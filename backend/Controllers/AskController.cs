using Microsoft.AspNetCore.Mvc;
using EstechApi.Utils;
using Newtonsoft.Json.Linq;

namespace EstechApi.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AskController : ControllerBase
    {
        [HttpPost]
        public async Task<IActionResult> Ask([FromBody] AskRequest request)
        {
            var apiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY");
            if (string.IsNullOrEmpty(apiKey))
            {
                return BadRequest(new { error = "❌ OpenAI API key bulunamadı." });
            }

            // 1) CSV verilerini oku - performans için sınırlı okuma
            var basePath = "/Users/senolerdem/RiderProjects/EstechApi/EstechApi/project-root/backend/Data";
            var allRecords = new List<EstechApi.Models.AgricultureData>();
            var readingSummary = new List<object>();
            
            // Tüm alt klasörleri manuel olarak tara - ama az kayıt al
            var subFolders = new[]
            {
                "Eğitim ve Kültür/İL BAZINDA",
                "ENERJİ VE ÇEVRE/İL BAZINDA", 
                "İSTİHDAM VE İŞSİZLİK 2/İL BAZINDA",
                "Nufus",
                "TarımHayvancilik",
                "Ulasım"
            };
            
            foreach (var folder in subFolders)
            {
                var folderPath = Path.Combine(basePath, folder);
                if (Directory.Exists(folderPath))
                {
                    var folderData = CsvReaderUtil.ReadAllCsvs(folderPath);
                    var limitedData = folderData.Take(50).ToList(); // Her klasörden sadece 5 kayıt
                    allRecords.AddRange(limitedData);
                    
                    readingSummary.Add(new {
                        folder = folder,
                        totalRecords = folderData.Count,
                        usedRecords = limitedData.Count,
                        categories = folderData.Select(x => x.Category).Distinct().Take(30).ToList()
                    });
                }
            }
            
            var records = allRecords;

            if (!records.Any())
            {
                return Ok(new { reply = "⚠️ CSV verisi bulunamadı." });
            }

            // 2) Kategori dağılımını görmek için grupla
            var categoryStats = records
                .GroupBy(r => r.Category)
                .Select(g => new { Category = g.Key, Count = g.Count() })
                .OrderByDescending(x => x.Count)
                .ToList();

            // 3) Daha çeşitli veri almak için her kategoriden eşit miktarda al
            var sampleRecords = new List<EstechApi.Models.AgricultureData>();
            
            foreach (var category in categoryStats.Take(30)) // İlk 8 kategori
            {
                var categoryRecords = records
                    .Where(r => r.Category == category.Category)
                    .Take(20) // Her kategoriden 5 kayıt
                    .ToList();
                
                sampleRecords.AddRange(categoryRecords);
            }

            // 4) GPT'ye gönderilecek context hazırla - daha detaylı
            var context = string.Join("\n", sampleRecords.Select(m =>
                $"Kategori: {m.Category}, Alt Kategori: {m.SubCategory}, Yıl: {m.Year}, İlçe: {m.District}, Değer: {m.Value}"));

            var systemPrompt = $@"Sen bir yatırım danışmanısın. Aşağıdaki Türkiye/Ankara verilerine göre analiz yap ve yatırım önerisi ver.

Veri Kategorileri: {string.Join(", ", categoryStats.Take(100).Select(c => c.Category))}

Veri Detayları:
{context}

Bu verilere dayanarak soruları yanıtla ve yatırım önerileri ver.";

            // 5) GPT çağır
            using var client = new HttpClient();
            client.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");

            var payload = new
            {
                model = "gpt-4o-mini",
                messages = new[]
                {
                    new { role = "system", content = systemPrompt },
                    new { role = "user", content = request.Message }
                },
                max_tokens = 1000,
                temperature = 0.7
            };

            var response = await client.PostAsJsonAsync("https://api.openai.com/v1/chat/completions", payload);
            var result = await response.Content.ReadAsStringAsync();

            // 6) JSON'dan cevabı ayıkla
            var json = JObject.Parse(result);
            var reply = json["choices"]?[0]?["message"]?["content"]?.ToString();

            return Ok(new
            {
                reply,
                dataStats = new 
                {
                    totalRecords = records.Count,
                    usedRecords = sampleRecords.Count,
                    readingSummary = readingSummary, // Hangi klasörlerden ne kadar veri okuduğu
                    categoriesUsed = categoryStats.Take(8).ToList(),
                    actualDataSample = sampleRecords.Take(20).Select(r => new {
                        r.Category,
                        r.SubCategory, 
                        r.Year,
                        r.District,
                        r.Value,
                        r.SourceFile
                    }).ToList() // GPT'ye gönderilen gerçek veri örnekleri
                }
            });
        }

        // Debug endpoint - hangi veriler okunuyor görmek için
        [HttpGet("debug")]
        public IActionResult Debug()
        {
            var basePath = "/Users/senolerdem/RiderProjects/EstechApi/EstechApi/project-root/backend/Data";
            var allRecords = new List<EstechApi.Models.AgricultureData>();
            
            // Tüm alt klasörleri manuel olarak tara
            var subFolders = new[]
            {
                "Eğitim ve Kültür/İL BAZINDA",
                "ENERJİ VE ÇEVRE/İL BAZINDA", 
                "İSTİHDAM VE İŞSİZLİK 2/İL BAZINDA",
                "Nufus",
                "TarımHayvancilik", 
                "Ulasım"
            };
            
            foreach (var folder in subFolders)
            {
                var folderPath = Path.Combine(basePath, folder);
                if (Directory.Exists(folderPath))
                {
                    var folderData = CsvReaderUtil.ReadAllCsvs(folderPath);
                    allRecords.AddRange(folderData);
                }
            }

            var stats = allRecords
                .GroupBy(r => r.Category)
                .Select(g => new { 
                    Category = g.Key, 
                    Count = g.Count(),
                    SubCategories = g.Select(x => x.SubCategory).Distinct().Count(),
                    SourceFiles = g.Select(x => x.SourceFile).Distinct().ToList()
                })
                .OrderByDescending(x => x.Count)
                .ToList();

            return Ok(new {
                totalRecords = allRecords.Count,
                totalCategories = stats.Count,
                categoryBreakdown = stats
            });
        }
    }

    public class AskRequest
    {
        public string Message { get; set; } = string.Empty;
    }
}