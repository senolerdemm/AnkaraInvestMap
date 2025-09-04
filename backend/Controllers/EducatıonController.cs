using Microsoft.AspNetCore.Mvc;
using EstechApi.Models;
using EstechApi.Utils;

namespace EstechApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EducationController : ControllerBase
    {
        private readonly string _dataFolder;

        public EducationController(IWebHostEnvironment env)
        {
            // Data klasörünü bul
            _dataFolder = Path.Combine(env.ContentRootPath, "Data", "Eğitim ve Kültür", "İL BAZINDA");
        }

        // Okul başına düşen öğrenci sayısı
        [HttpGet("students-per-school")]
        public ActionResult<IEnumerable<AgricultureData>> GetStudentsPerSchool()
        {
            var path = Path.Combine(_dataFolder, "okul_basina_ogrenci.csv");
            var data = CsvReaderUtil.ReadCsv(path);
            return Ok(data);
        }

        // Öğretmen başına düşen öğrenci sayısı
        [HttpGet("students-per-teacher")]
        public ActionResult<IEnumerable<AgricultureData>> GetStudentsPerTeacher()
        {
            var path = Path.Combine(_dataFolder, "ogretmen_basina_ogrenci.csv");
            var data = CsvReaderUtil.ReadCsv(path);
            return Ok(data);
        }

        // Net okullaşma oranı
        [HttpGet("schooling-rate")]
        public ActionResult<IEnumerable<AgricultureData>> GetSchoolingRate()
        {
            var path = Path.Combine(_dataFolder, "net_okullasma.csv");
            var data = CsvReaderUtil.ReadCsv(path);
            return Ok(data);
        }

        // Okuma yazma oranı
        [HttpGet("literacy-rate")]
        public ActionResult<IEnumerable<AgricultureData>> GetLiteracyRate()
        {
            var path = Path.Combine(_dataFolder, "okuma_yazma.csv");
            var data = CsvReaderUtil.ReadCsvWithSubCategory(path, "Okuma Yazma");
            return Ok(data);
        }

        // Tiyatro salonu ve gösteri sayısı
        [HttpGet("theatre-performance")]
        public ActionResult<IEnumerable<AgricultureData>> GetTheatreAndPerformance()
        {
            var path = Path.Combine(_dataFolder, "tiyatro_gosteri.csv");
            var data = CsvReaderUtil.ReadCsv(path);
            return Ok(data);
        }

        // Kütüphane sayısı ve kullanıcı sayısı
        [HttpGet("libraries")]
        public ActionResult<IEnumerable<AgricultureData>> GetLibraries()
        {
            var path = Path.Combine(_dataFolder, "halk_kutuphane.csv");
            var data = CsvReaderUtil.ReadCsv(path);
            return Ok(data);
        }
    }
}
