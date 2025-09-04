using Microsoft.AspNetCore.Mvc;
using EstechApi.Models;
using EstechApi.Utils;

namespace EstechApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AgricultureController : ControllerBase
    {
        private readonly string _dataFolder = Path.Combine("Data", "TarımHayvancilik");

        [HttpGet("beekeeping")]
        public IActionResult GetBeekeeping()
        {
            var path = Path.Combine(_dataFolder, "AricilikIsletmeSayisi.csv");
            var data = CsvReaderUtil.ReadCsv(path);
            return Ok(data);
        }

        [HttpGet("livestock")]
        public IActionResult GetLivestock()
        {
            var path = Path.Combine(_dataFolder, "CanliHayvanSayisi.csv");
            var data = CsvReaderUtil.ReadCsvWithSubCategory(path, "Hayvancılık");
            return Ok(data);
        }

        [HttpGet("poultry")]
        public IActionResult GetPoultry()
        {
            var path = Path.Combine(_dataFolder, "DigerKumesHayvanlari.csv");
            var data = CsvReaderUtil.ReadCsv(path);
            return Ok(data);
        }

        [HttpGet("chicken")]
        public IActionResult GetChicken()
        {
            var path = Path.Combine(_dataFolder, "EtTavuguSayisi.csv");
            var data = CsvReaderUtil.ReadCsv(path);
            return Ok(data);
        }

        [HttpGet("fallow-land")]
        public IActionResult GetFallowLand()
        {
            var path = Path.Combine(_dataFolder, "NadasAlani.csv");
            var data = CsvReaderUtil.ReadCsv(path);
            return Ok(data);
        }

        [HttpGet("greenhouse")]
        public IActionResult GetGreenhouse()
        {
            var path = Path.Combine(_dataFolder, "OrtuluTarimAlani.csv");
            var data = CsvReaderUtil.ReadCsv(path);
            return Ok(data);
        }

        [HttpGet("tractors")]
        public IActionResult GetTractors()
        {
            var path = Path.Combine(_dataFolder, "TraktorSayisi.csv");
            var data = CsvReaderUtil.ReadCsv(path);
            return Ok(data);
        }

        [HttpGet("wheat")]
        public IActionResult GetWheat()
        {
            var path = Path.Combine(_dataFolder, "UretimMiktariDurumBugdayi.csv");
            var data = CsvReaderUtil.ReadCsv(path);
            return Ok(data);
        }
    }
}
