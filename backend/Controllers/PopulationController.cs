using Microsoft.AspNetCore.Mvc;
using System.Globalization;
using CsvHelper;
using CsvHelper.Configuration;

namespace EstechApi.Controllers
{
    public class PopulationData
    {
        public string Year { get; set; }
        public string District { get; set; }
        public int Population { get; set; }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class PopulationController : ControllerBase
    {
        private readonly string _populationFile = Path.Combine("Data","Nufus","ANKARA_ILCE_NUFUSLARI.csv");

        [HttpGet("{district}")]
        public IActionResult GetByDistrict(string district)
        {
            var records = ReadPopulationCsv();
            var filtered = records.Where(r =>
                string.Equals(r.District, district, StringComparison.OrdinalIgnoreCase)
            );

            if (!filtered.Any())
                return NotFound(new { Message = $"Veri bulunamadı: {district}" });

            return Ok(filtered);
        }

        [HttpGet("all")]
        public IActionResult GetAll()
        {
            var records = ReadPopulationCsv();
            return Ok(records);
        }

        private IEnumerable<PopulationData> ReadPopulationCsv()
        {
            var result = new List<PopulationData>();

            if (!System.IO.File.Exists(_populationFile))
                return result;

            using var reader = new StreamReader(_populationFile);
            using var csv = new CsvReader(reader, new CsvConfiguration(CultureInfo.InvariantCulture)
            {
                Delimiter = "|",
                HasHeaderRecord = false,
                TrimOptions = TrimOptions.Trim,
                IgnoreBlankLines = true
            });

            string currentYear = "";

            while (csv.Read())
            {
                var row = csv.Parser.Record;
                if (row == null) continue;

                // Eğer satır yıl ile başlıyorsa (örn: "2007|Ankara(Akyurt)...")
                if (!string.IsNullOrWhiteSpace(row[0]) && int.TryParse(row[0], out _))
                {
                    currentYear = row[0];
                    if (row.Length >= 3)
                        ParseRow(row[1], row[2], currentYear, result);
                }
                // Eğer satırın ilk kolonu boşsa (örn: "|Ankara(Altındağ)...")
                else if (row.Length >= 3)
                {
                    ParseRow(row[1], row[2], currentYear, result);
                }
            }

            return result;
        }

        private void ParseRow(string districtPart, string value, string year, List<PopulationData> result)
        {
            if (string.IsNullOrWhiteSpace(districtPart) || string.IsNullOrWhiteSpace(value)) return;

            var match = System.Text.RegularExpressions.Regex.Match(districtPart, @"Ankara\(([^)]+)\)");
            if (match.Success &&
                double.TryParse(value, NumberStyles.Any, CultureInfo.InvariantCulture, out double population))
            {
                result.Add(new PopulationData
                {
                    Year = year,
                    District = match.Groups[1].Value,
                    Population = (int)Math.Round(population)
                });
            }
        }
    }
}
