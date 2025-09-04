using Microsoft.AspNetCore.Mvc;
using EstechApi.Utils;
using EstechApi.Models;

namespace EstechApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestController : ControllerBase
    {
        private readonly string _dataFolder = Path.Combine("Data", "TarımHayvancilik");

        [HttpGet("livestock")]
        public IActionResult TestLivestock()
        {
            var path = Path.Combine(_dataFolder, "CanliHayvanSayisi.csv");
            var data = CsvReaderUtil.ReadCsv(path);

            // Test için sadece ilk 10 kaydı dönelim
            return Ok(data.Take(10));
        }

        [HttpGet("beekeeping")]
        public IActionResult TestBeekeeping()
        {
            var path = Path.Combine(_dataFolder, "AricilikIsletmeSayisi.csv");
            var data = CsvReaderUtil.ReadCsv(path);

            return Ok(data.Take(10));
        }
    }
}