using System.Globalization;
using EstechApi.Models;

namespace EstechApi.Utils
{
    
    public static class CsvReaderUtil
    {  
        public static List<AgricultureData> ReadAllCsvs(string rootPath)
        {
            var allData = new List<AgricultureData>();

            // Alt klasörlerle birlikte tara
            var csvFiles = Directory.GetFiles(rootPath, "*.csv", SearchOption.AllDirectories);

            foreach (var file in csvFiles)
            {
                try
                {
                    // İstersen dosya adına göre ReadCsv / ReadCsvWithSubCategory seçebilirsin
                    var fileName = Path.GetFileName(file);

                    var data = ReadCsv(file); // şimdilik tek metodu kullan
                    foreach (var item in data)
                    {
                        item.SourceFile = fileName; // Kaynağı da ekle
                        allData.Add(item);
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"⚠️ CSV okunamadı: {file} | {ex.Message}");
                }
            }

            return allData;
        }

        public static List<AgricultureData> ReadCsvWithSubCategory(string path, string mainCategory)
        {
            var result = new List<AgricultureData>();
            var lines = File.ReadAllLines(path);

            if (lines.Length < 4) return result;

            // 2. satır: ilçe headerları (skip first 2 kolon: kategori + subcategory)
            var headers = lines[1].Split('|').Skip(2).ToList();

            for (int i = 3; i < lines.Length; i++)
            {
                var parts = lines[i].Split('|');
                if (parts.Length < 4) continue;

                var category = parts[0].Trim();
                var subCategory = parts[1].Trim();
                var year = parts[2].Trim();

                if (!int.TryParse(year, out _)) continue; // yıl değilse geç

                var values = parts.Skip(3).ToList();

                for (int j = 0; j < headers.Count && j < values.Count; j++)
                {    
                    
                    var district = string.IsNullOrWhiteSpace(headers[j])
                        ? "Ankara (Genel)"   // boş kolon varsa → il geneli
                        : headers[j].Trim();
                    
                    if (double.TryParse(values[j], NumberStyles.Any, CultureInfo.InvariantCulture, out var val))
                    {
                        result.Add(new AgricultureData
                        {
                            Category = mainCategory,
                            SubCategory = subCategory,
                            Year = year,
                            District = district,
                            Value = val
                        });
                    }
                }
            }

            return result;
        }
        
        public static List<AgricultureData> ReadCsv(string path)
        {
            var result = new List<AgricultureData>();
            if (!File.Exists(path)) return result;

            var lines = File.ReadAllLines(path);
            if (lines.Length < 4) return result;

            // 2. satır: ilçeler
            var headers = lines[1].Split('|').Skip(2).ToList();

            string currentCategory = "";
            string currentSubCategory = "";

            for (int i = 3; i < lines.Length; i++)
            {
                var parts = lines[i].Split('|');
                if (parts.Length < 3) continue;

                // kategori / alt kategori güncelle
                if (!string.IsNullOrWhiteSpace(parts[0]))
                    currentCategory = parts[0].Trim();

                if (!string.IsNullOrWhiteSpace(parts[1]))
                    currentSubCategory = parts[1].Trim();

                var yearStr = parts[2].Trim();
                if (!int.TryParse(yearStr, out _)) continue;

                var values = parts.Skip(3).ToList();
                for (int j = 0; j < headers.Count && j < values.Count; j++)
                {   
                    var district = string.IsNullOrWhiteSpace(headers[j])
                        ? "Ankara (Genel)"   // boş kolon varsa → il geneli
                        : headers[j].Trim();

                    if (double.TryParse(values[j], NumberStyles.Any, CultureInfo.InvariantCulture, out var val))
                    {
                        result.Add(new AgricultureData
                        {
                            Category = currentCategory,
                            SubCategory = currentSubCategory,
                            Year = yearStr,
                            District = district,
                            Value = val
                        });
                    }
                }
            }

            return result;
        }
    }
}