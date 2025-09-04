using Microsoft.AspNetCore.Mvc;
using System.Globalization;

namespace EstechApi.Controllers
{
    public class GrowthRateData
    {
        public string Year { get; set; } = "";
        public string District { get; set; } = "";
        public double GrowthRate { get; set; }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class GrowthRateController : ControllerBase
    {
        private readonly string _growthFile = Path.Combine("Data","Nufus", "YILLIK_NUFUS_ARTIS_HIZI.csv");

        [HttpGet("all")]
        public IActionResult GetAll()
        {
            var records = ReadGrowthCsv();
            return Ok(records);
        }

        [HttpGet("{district}")]
        public IActionResult GetByDistrict(string district)
        {
            var records = ReadGrowthCsv()
                .Where(r => string.Equals(r.District, district, StringComparison.OrdinalIgnoreCase))
                .ToList();

            if (records.Count == 0)
                return NotFound(new { Message = $"Veri bulunamadı: {district}" });

            return Ok(records);
        }

        private IEnumerable<GrowthRateData> ReadGrowthCsv()
        {
            var result = new List<GrowthRateData>();

            if (!System.IO.File.Exists(_growthFile))
                return result;

            var lines = System.IO.File.ReadAllLines(_growthFile);
            string currentYear = "";

            foreach (var rawLine in lines)
            {
                if (string.IsNullOrWhiteSpace(rawLine)) continue;

                var parts = rawLine.Split('|', StringSplitOptions.RemoveEmptyEntries);
                if (parts.Length == 0) continue;

                // Eğer ilk parça yıl ise güncelle
                if (int.TryParse(parts[0], out int yearVal))
                {
                    currentYear = parts[0];
                    continue; // yıl satırı -> diğer satırlara geç
                }

                // İlçe + değer satırı
                if (parts.Length >= 2 && !string.IsNullOrEmpty(currentYear))
                {
                    var match = System.Text.RegularExpressions.Regex.Match(parts[0], @"Ankara\(([^)]+)\)");
                    if (match.Success &&
                        double.TryParse(parts[1], NumberStyles.Any, CultureInfo.InvariantCulture, out double rate))
                    {
                        result.Add(new GrowthRateData
                        {
                            Year = currentYear,
                            District = match.Groups[1].Value,
                            GrowthRate = rate
                        });
                    }
                }
            }

            return result;
        }
    }
}
