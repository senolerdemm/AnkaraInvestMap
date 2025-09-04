using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using EstechApi.Models;
using EstechApi.Utils;
using Newtonsoft.Json.Linq;

namespace EstechApi.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AskController : ControllerBase
    {
        private readonly string _basePath;

        public AskController(IWebHostEnvironment env, IConfiguration cfg)
        {
            // 1) Öncelik: Ortam değişkeni (CI/CD veya farklı makine için kolay)
            var fromEnv = Environment.GetEnvironmentVariable("DATA_DIR");

            // 2) Alternatif: appsettings.json -> "DataDir"
            var fromConfig = cfg["DataDir"];

            // 3) Varsayılan: Proje kökü (ContentRoot) altındaki "Data"
            _basePath = !string.IsNullOrWhiteSpace(fromEnv)
                ? fromEnv
                : !string.IsNullOrWhiteSpace(fromConfig)
                    ? fromConfig
                    : Path.Combine(env.ContentRootPath, "Data");

            Console.WriteLine($"[AskController] BasePath: {_basePath}");
            Directory.CreateDirectory(_basePath); // yoksa oluştur
        }

        [HttpPost]
        public async Task<IActionResult> Ask([FromBody] AskRequest request)
        {
            var apiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY");
            if (string.IsNullOrEmpty(apiKey))
                return BadRequest(new { error = "❌ OPENAI_API_KEY bulunamadı." });

            var allRecords = new List<AgricultureData>();
            var readingSummary = new List<object>();

            // Alt klasörler (İSİMLERİN DİSKTEKİYLE BİREBİR OLMASI GEREKİR)
            var subFolders = new[]
            {
                Path.Combine("Eğitim ve Kültür", "İL BAZINDA"),
                Path.Combine("ENERJİ VE ÇEVRE", "İL BAZINDA"),
                Path.Combine("İSTİHDAM VE İŞSİZLİK 2", "İL BAZINDA"),
                "Nufus",
                "TarımHayvancilik",
                "Ulasim"
            };

            foreach (var folder in subFolders)
            {
                var folderPath = Path.Combine(_basePath, folder);
                Console.WriteLine($"[AskController] Klasör kontrol: {folderPath}");

                if (!Directory.Exists(folderPath))
                {
                    Console.WriteLine($"[AskController] ❌ Klasör bulunamadı: {folderPath}");
                    continue;
                }

                var folderData = CsvReaderUtil.ReadAllCsvs(folderPath);
                var limitedData = folderData.Take(50).ToList();
                allRecords.AddRange(limitedData);

                readingSummary.Add(new
                {
                    folder,
                    totalRecords = folderData.Count,
                    usedRecords = limitedData.Count,
                    categories = folderData.Select(x => x.Category).Distinct().Take(30).ToList()
                });
            }

            if (!allRecords.Any())
                return Ok(new { reply = "⚠️ CSV verisi bulunamadı.", basePath = _basePath });

            // Kategorilere göre grupla
            var categoryStats = allRecords
                .GroupBy(r => r.Category)
                .Select(g => new { Category = g.Key, Count = g.Count() })
                .OrderByDescending(x => x.Count)
                .ToList();

            // Sampling
            var sampleRecords = new List<AgricultureData>();
            foreach (var c in categoryStats.Take(30))
            {
                var items = allRecords.Where(r => r.Category == c.Category).Take(20).ToList();
                sampleRecords.AddRange(items);
            }

            // GPT context
            var context = string.Join("\n", sampleRecords.Select(m =>
                $"Kategori: {m.Category}, Alt Kategori: {m.SubCategory}, Yıl: {m.Year}, İlçe: {m.District}, Değer: {m.Value}"));

            var systemPrompt =
$@"Sen bir yatırım danışmanısın. Aşağıdaki Türkiye/Ankara verilerine göre analiz yap ve yatırım önerisi ver.
Veri Kategorileri: {string.Join(", ", categoryStats.Take(100).Select(c => c.Category))}
Veri Detayları:
{context}
Bu verilere dayanarak soruları yanıtla ve yatırım önerileri ver.";

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

            if (!response.IsSuccessStatusCode)
            {
                return BadRequest(new
                {
                    error = "LLM çağrısı başarısız",
                    status = (int)response.StatusCode,
                    body = result
                });
            }

            string? reply = null;
            try
            {
                var json = JObject.Parse(result);
                reply = json["choices"]?[0]?["message"]?["content"]?.ToString();
            }
            catch
            {
                reply = null;
            }

            if (string.IsNullOrWhiteSpace(reply))
                reply = "Model yanıtı alınamadı.";

            return Ok(new
            {
                reply,
                dataStats = new
                {
                    totalRecords = allRecords.Count,
                    usedRecords = sampleRecords.Count,
                    readingSummary,
                    categoriesUsed = categoryStats.Take(8).ToList(),
                    actualDataSample = sampleRecords.Take(20).Select(r => new
                    {
                        r.Category,
                        r.SubCategory,
                        r.Year,
                        r.District,
                        r.Value,
                        r.SourceFile
                    }).ToList()
                }
            });
        }

        [HttpGet("debug")]
        public IActionResult Debug()
        {
            var allRecords = new List<AgricultureData>();

            var subFolders = new[]
            {
                Path.Combine("Eğitim ve Kültür", "İL BAZINDA"),
                Path.Combine("ENERJİ VE ÇEVRE", "İL BAZINDA"),
                Path.Combine("İSTİHDAM VE İŞSİZLİK 2", "İL BAZINDA"),
                "Nufus",
                "TarımHayvancilik",
                "Ulasim"
            };

            foreach (var folder in subFolders)
            {
                var folderPath = Path.Combine(_basePath, folder);
                if (Directory.Exists(folderPath))
                {
                    var folderData = CsvReaderUtil.ReadAllCsvs(folderPath);
                    allRecords.AddRange(folderData);
                }
            }

            var stats = allRecords
                .GroupBy(r => r.Category)
                .Select(g => new
                {
                    Category = g.Key,
                    Count = g.Count(),
                    SubCategories = g.Select(x => x.SubCategory).Distinct().Count(),
                    SourceFiles = g.Select(x => x.SourceFile).Distinct().ToList()
                })
                .OrderByDescending(x => x.Count)
                .ToList();

            return Ok(new
            {
                basePath = _basePath,
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
