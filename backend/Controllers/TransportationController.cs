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

        public TransportationController()
        {
            // Base path'i ayarlayın
            _basePath = "/Users/senolerdem/RiderProjects/EstechApi/EstechApi/project-root/backend/Data";
        }

        /// <summary>
        /// Bin kişi başına otomobil sayısı verilerini getirir
        /// </summary>
        [HttpGet("otomobil-sayisi")]
        public ActionResult<List<AgricultureData>> GetOtomobilSayisi()
        {
            try
            {
                var filePath = Path.Combine(_basePath, "Ulasım", "otomobil_sayisi.csv");
                
                if (!System.IO.File.Exists(filePath))
                {
                    return NotFound($"Dosya bulunamadı: {filePath}");
                }

                var data = CsvReaderUtil.ReadCsv(filePath);
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Otomobil sayısı verileri okunurken hata: {ex.Message}");
            }
        }

        /// <summary>
        /// Taşıtların ortalama yaşları verilerini getirir
        /// </summary>
        [HttpGet("tasit-yaslari")]
        public ActionResult<List<AgricultureData>> GetTasitYaslari()
        {
            try
            {
                var filePath = Path.Combine(_basePath, "Ulasım", "tasit_yaslari.csv");
                
                if (!System.IO.File.Exists(filePath))
                {
                    return NotFound($"Dosya bulunamadı: {filePath}");
                }

                var data = CsvReaderUtil.ReadCsv(filePath);
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Taşıt yaşları verileri okunurken hata: {ex.Message}");
            }
        }

        /// <summary>
        /// Tüm mevcut ulaşım dosyalarını listeler (debug için)
        /// </summary>
        [HttpGet("files")]
        public ActionResult<object> GetAvailableFiles()
        {
            try
            {
                var files = new List<object>();

                // Ulaşım dosyaları
                var ulasimPath = Path.Combine(_basePath, "Ulasım");
                if (Directory.Exists(ulasimPath))
                {
                    var ulasimFiles = Directory.GetFiles(ulasimPath, "*.csv")
                        .Select(f => new { 
                            Name = Path.GetFileName(f), 
                            Path = f,
                            Exists = System.IO.File.Exists(f),
                            Size = new FileInfo(f).Length
                        });
                    files.AddRange(ulasimFiles);
                }

                return Ok(new { 
                    BasePath = _basePath,
                    UlasimPath = ulasimPath,
                    TotalFiles = files.Count,
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