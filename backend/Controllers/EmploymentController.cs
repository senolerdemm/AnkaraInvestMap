using Microsoft.AspNetCore.Mvc;
using EstechApi.Models;
using EstechApi.Utils;

namespace EstechApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmploymentController : ControllerBase
    {
        private readonly string _basePath;

        public EmploymentController()
        {
            // Base path'i ayarlayın
            _basePath = "/Users/senolerdem/RiderProjects/EstechApi/EstechApi/project-root/backend/Data";
        }

        /// <summary>
        /// İşgücü katılma oranı verilerini getirir
        /// </summary>
        [HttpGet("isgucu-katilma-orani")]
        public ActionResult<List<AgricultureData>> GetIsgucuKatilmaOrani()
        {
            try
            {
                var filePath = Path.Combine(_basePath, "İSTİHDAM VE İŞSİZLİK 2", "İL BAZINDA", "ISGUCU_KATILMA_ORANI.csv");
                
                if (!System.IO.File.Exists(filePath))
                {
                    return NotFound($"Dosya bulunamadı: {filePath}");
                }

                var data = CsvReaderUtil.ReadCsv(filePath);
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"İşgücü katılma oranı verileri okunurken hata: {ex.Message}");
            }
        }

        /// <summary>
        /// İşsizlik oranı verilerini getirir
        /// </summary>
        [HttpGet("issizlik-orani")]
        public ActionResult<List<AgricultureData>> GetIssizlikOrani()
        {
            try
            {
                var filePath = Path.Combine(_basePath, "İSTİHDAM VE İŞSİZLİK 2", "İL BAZINDA", "ISSIZLIK_ORANI.csv");
                
                if (!System.IO.File.Exists(filePath))
                {
                    return NotFound($"Dosya bulunamadı: {filePath}");
                }

                var data = CsvReaderUtil.ReadCsv(filePath);
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"İşsizlik oranı verileri okunurken hata: {ex.Message}");
            }
        }

        /// <summary>
        /// İstihdam oranı verilerini getirir
        /// </summary>
        [HttpGet("istihdam-orani")]
        public ActionResult<List<AgricultureData>> GetIstihdamOrani()
        {
            try
            {
                var filePath = Path.Combine(_basePath, "İSTİHDAM VE İŞSİZLİK 2", "İL BAZINDA", "ISTIHDAM_ORANI.csv");
                
                if (!System.IO.File.Exists(filePath))
                {
                    return NotFound($"Dosya bulunamadı: {filePath}");
                }

                var data = CsvReaderUtil.ReadCsv(filePath);
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"İstihdam oranı verileri okunurken hata: {ex.Message}");
            }
        }

        /// <summary>
        /// Mevcut istihdam dosyalarını listeler (debug için)
        /// </summary>
        [HttpGet("files")]
        public ActionResult<object> GetAvailableFiles()
        {
            try
            {
                var files = new List<object>();

                // İstihdam dosyaları
                var employmentPath = Path.Combine(_basePath, "İSTİHDAM VE İŞSİZLİK 2", "İL BAZINDA");
                if (Directory.Exists(employmentPath))
                {
                    var employmentFiles = Directory.GetFiles(employmentPath, "*.csv")
                        .Select(f => new { 
                            Name = Path.GetFileName(f), 
                            Path = f,
                            Exists = System.IO.File.Exists(f),
                            Size = new FileInfo(f).Length
                        });
                    files.AddRange(employmentFiles);
                }

                return Ok(new { 
                    BasePath = _basePath,
                    EmploymentPath = employmentPath,
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