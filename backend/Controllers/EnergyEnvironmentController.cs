using Microsoft.AspNetCore.Mvc;
using EstechApi.Models;
using EstechApi.Utils;

namespace EstechApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EnergyEnvironmentController : ControllerBase
    {
        private readonly string _dataFolder = Path.Combine("Data", "ENERJİ VE ÇEVRE", "İL BAZINDA");

        // ♻️ Atıksu Arıtma Tesisi Kapasitesi
        [HttpGet("atik_su_aritma_tesisi_kapasitesi")]
        public IActionResult GetAtikSuAritmaTesisiKapasitesi()
        {
            var path = Path.Combine(_dataFolder, "atik_su_aritma_tesisi_kapasitesi.csv");
            var data = CsvReaderUtil.ReadCsv(path);
            return Ok(data);
        }

        // ♻️ Atıksu Arıtma Tesisi Sayısı
        [HttpGet("atik_su_aritma_tesisi_sayisi")]
        public IActionResult GetAtikSuAritmaTesisiSayisi()
        {
            var path = Path.Combine(_dataFolder, "atik_su_aritma_tesisi_sayisi.csv");
            var data = CsvReaderUtil.ReadCsv(path);
            return Ok(data);
        }

       
        // ⚡ Elektrik Tüketimi
        [HttpGet("elektrik_tuketimi")]
        public IActionResult GetElektrikTuketimi()
        {
            var path = Path.Combine(_dataFolder, "elektrik_tuketimi.csv");
            var data = CsvReaderUtil.ReadCsv(path);
            return Ok(data);
        }

        // 💧 İçme ve Kullanma Suyu Arıtma Tesisi Sayısı
        [HttpGet("icme_suyu_tesisi_sayisi")]
        public IActionResult GetIcmeSuyuTesisiSayisi()
        {
            var path = Path.Combine(_dataFolder, "icme_ve_kullanma_suyu_aritma_tesisi_sayisi.csv");
            var data = CsvReaderUtil.ReadCsv(path);
            return Ok(data);
        }

        // 💧 İçme ve Kullanma Suyu Arıtma Tesislerinde Arıtılan Su Miktarı
        [HttpGet("icme_suyu_aritilan_miktar")]
        public IActionResult GetIcmeSuyuAritilanMiktar()
        {
            var path = Path.Combine(_dataFolder, "icme_ve_kullanma_suyu_aritma_tesislerinde_aritilan_su_miktari.csv");
            var data = CsvReaderUtil.ReadCsv(path);
            return Ok(data);
        }

        // 🗑️ Kişi Başı Ortalama Belediye Atık Miktarı
        [HttpGet("kisi_basi_ortalama_belediye_atik")]
        public IActionResult GetKisiBasiAtik()
        {
            var path = Path.Combine(_dataFolder, "kisi_basina_ortalama_belediye_atik_miktari.csv");
            var data = CsvReaderUtil.ReadCsv(path);
            return Ok(data);
        }

        // ⚡ Kişi Başına Toplam Elektrik Tüketimi
        [HttpGet("kisi_basi_elektrik_tuketimi")]
        public IActionResult GetKisiBasiElektrik()
        {
            var path = Path.Combine(_dataFolder, "kisi_basina_toplam_elektrik_tuketimi.csv");
            var data = CsvReaderUtil.ReadCsv(path);
            return Ok(data);
        }
    }
}
