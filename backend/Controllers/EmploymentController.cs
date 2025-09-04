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
            // Çalışma dizini + Data klasörü
            _basePath = Path.Combine(Directory.GetCurrentDirectory(), "Data");
        }

        /// <summary>
        /// İşgücü katılma oranı
        /// </summary>
        [HttpGet("isgucu-katilma-orani")]
        public ActionResult<List<AgricultureData>> GetIsgucuKatilmaOrani()
        {
            var filePath = Path.Combine(_basePath, "İSTİHDAM VE İŞSİZLİK 2", "İL BAZINDA", "ISGUCU_KATILMA_ORANI.csv");

            if (!System.IO.File.Exists(filePath))
                return NotFound($"Dosya bulunamadı: {filePath}");

            var data = CsvReaderUtil.ReadCsv(filePath);
            return Ok(data);
        }

        /// <summary>
        /// İşsizlik oranı
        /// </summary>
        [HttpGet("issizlik-orani")]
        public ActionResult<List<AgricultureData>> GetIssizlikOrani()
        {
            var filePath = Path.Combine(_basePath, "İSTİHDAM VE İŞSİZLİK 2", "İL BAZINDA", "ISSIZLIK_ORANI.csv");

            if (!System.IO.File.Exists(filePath))
                return NotFound($"Dosya bulunamadı: {filePath}");

            var data = CsvReaderUtil.ReadCsv(filePath);
            return Ok(data);
        }

        /// <summary>
        /// İstihdam oranı
        /// </summary>
        [HttpGet("istihdam-orani")]
        public ActionResult<List<AgricultureData>> GetIstihdamOrani()
        {
            var filePath = Path.Combine(_basePath, "İSTİHDAM VE İŞSİZLİK 2", "İL BAZINDA", "ISTIHDAM_ORANI.csv");

            if (!System.IO.File.Exists(filePath))
                return NotFound($"Dosya bulunamadı: {filePath}");

            var data = CsvReaderUtil.ReadCsv(filePath);
            return Ok(data);
        }

        /// <summary>
        /// Debug için mevcut csv dosyalarını listeler
        /// </summary>
        [HttpGet("files")]
        public ActionResult<object> GetAvailableFiles()
        {
            var employmentPath = Path.Combine(_basePath, "İSTİHDAM VE İŞSİZLİK 2", "İL BAZINDA");

            if (!Directory.Exists(employmentPath))
                return NotFound($"Klasör bulunamadı: {employmentPath}");

            var files = Directory.GetFiles(employmentPath, "*.csv")
                                 .Select(f => Path.GetFileName(f))
                                 .ToList();

            return Ok(new { EmploymentPath = employmentPath, Files = files });
        }
    }
}
