namespace EstechApi.Models
{
    public class AgricultureData
    {
        public string Category { get; set; }   // Örn: "Arıcılık", "Canlı Hayvan"
        public string Year { get; set; }       // Örn: "2013"
        public string District { get; set; }   // Örn: "Akyurt"
        public double Value { get; set; }      // Örn: 134.0
        public string? SubCategory { get; set; } = ""; 
        
        public string? SourceFile { get; set; } = ""; // Verinin alındığı dosya adı
    }
}