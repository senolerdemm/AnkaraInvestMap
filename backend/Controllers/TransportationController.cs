using Microsoft.AspNetCore.Mvc;
using EstechApi.Models;
using EstechApi.Utils;

namespace EstechApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransportationController : ControllerBase
    {
        private readonly string _basePath;

        public TransportationController(IWebHostEnvironment env)
        {
            // ✅ Sadece Data/Ulasim ekleniyor
            _basePath = Path.Combine(env.ContentRootPath, "Data", "Ulasim");

            Console.WriteLine($"[TransportationController] BasePath: {_basePath}");
        }

        [HttpGet("otomobil-sayisi")]
        public ActionResult<List<AgricultureData>> GetOtomobilSayisi()
        {
            try
            {
                var filePath = Path.Combine(_basePath, "otomobil_sayisi.csv");
                Console.WriteLine($"[TransportationController] Trying to read: {filePath}");

                if (!System.IO.File.Exists(filePath))
                    return NotFound(new { error = $"❌ Dosya bulunamadı: {filePath}" });

                var data = CsvReaderUtil.ReadCsv(filePath);
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Otomobil sayısı okunurken hata: {ex.Message}");
            }
        }

        [HttpGet("tasit-yaslari")]
        public ActionResult<List<AgricultureData>> GetTasitYaslari()
        {
            try
            {
                var filePath = Path.Combine(_basePath, "tasit_yaslari.csv");
                Console.WriteLine($"[TransportationController] Trying to read: {filePath}");

                if (!System.IO.File.Exists(filePath))
                    return NotFound(new { error = $"❌ Dosya bulunamadı: {filePath}" });

                var data = CsvReaderUtil.ReadCsv(filePath);
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Taşıt yaşları okunurken hata: {ex.Message}");
            }
        }

        [HttpGet("files")]
        public ActionResult<object> GetAvailableFiles()
        {
            try
            {
                if (!Directory.Exists(_basePath))
                    return NotFound(new { error = $"❌ Klasör bulunamadı: {_basePath}" });

                var files = Directory.GetFiles(_basePath, "*.csv")
                    .Select(f => new
                    {
                        Name = Path.GetFileName(f),
                        Path = f,
                        Exists = System.IO.File.Exists(f),
                        Size = new FileInfo(f).Length
                    });

                return Ok(new
                {
                    BasePath = _basePath,
                    TotalFiles = files.Count(),
                    Files = files
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Dosyalar listelenirken hata: {ex.Message}");
            }
        }
    }
}
