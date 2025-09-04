import { Stack } from "@mui/material";
import GenericChart from "./GenericChart.tsx";

interface Props {
  selectedDistrict: string;
  category: string;
  onAgricultureSubChange?: (subDataType: string) => void; // Yeni prop
}

const AGRICULTURE_CHARTS = [
  {
    endpoint: "Agriculture/beekeeping",
    category: "Arıcılık",
    title: "Arıcılık İşletme Sayısı",
    unit: "işletme",
    color: "#fbc02d",
    dataType: "beekeeping",
  },
  {
    endpoint: "Agriculture/livestock",
    category: "Canlı Hayvan Sayısı",
    title: "Canlı Hayvan Sayısı",
    unit: "baş",
    color: "#8d6e63",
    dataType: "livestock",
  },
  {
    endpoint: "Agriculture/poultry",
    category: "Diğer Kümes Hayvanları",
    title: "Diğer Kümes Hayvanları Sayısı",
    unit: "adet",
    color: "#e64a19",
    dataType: "poultry",
  },
  {
    endpoint: "Agriculture/chicken",
    category: "Et Tavuğu",
    title: "Et Tavuğu Sayısı",
    unit: "adet",
    color: "#1976d2",
    dataType: "chicken",
  },
  {
    endpoint: "Agriculture/fallow-land",
    category: "Nadas Alanı",
    title: "Nadas Alanı",
    unit: "dekar",
    color: "#388e3c",
    dataType: "fallow-land",
  },
  {
    endpoint: "Agriculture/greenhouse",
    category: "Örtüaltı Tarım",
    title: "Örtüaltı Tarım Alanı",
    unit: "dekar",
    color: "#7b1fa2",
    dataType: "greenhouse",
  },
  {
    endpoint: "Agriculture/tractors",
    category: "Traktörler",
    title: "Traktör Sayısı",
    unit: "adet",
    color: "#455a64",
    dataType: "tractors",
  },
  {
    endpoint: "Agriculture/wheat",
    category: "Tarım Alanı",
    title: "Buğday Üretim Miktarı",
    unit: "ton",
    color: "#ffb300",
    dataType: "wheat",
  },
];

const ENERGY_ENVIRONMENT_CHARTS = [
  {
    endpoint: "EnergyEnvironment/atik_su_aritma_tesisi_kapasitesi",
    category: "Atıksu Arıtma",
    title: "Atıksu Arıtma Tesisi Kapasitesi",
    unit: "Bin m³/yıl",
    color: "#2e7d32",
  },
  {
    endpoint: "EnergyEnvironment/atik_su_aritma_tesisi_sayisi",
    category: "Atıksu Arıtma",
    title: "Atıksu Arıtma Tesisi Sayısı",
    unit: "adet",
    color: "#1565c0",
  },
  {
    endpoint: "EnergyEnvironment/elektrik_tuketimi",
    category: "Enerji",
    title: "Toplam Elektrik Tüketimi",
    unit: "MWh",
    color: "#f57c00",
  },
  {
    endpoint: "EnergyEnvironment/icme_suyu_tesisi_sayisi",
    category: "Su",
    title: "İçme ve Kullanma Suyu Arıtma Tesisi Sayısı",
    unit: "adet",
    color: "#0288d1",
  },
  {
    endpoint: "EnergyEnvironment/icme_suyu_aritilan_miktar",
    category: "Su",
    title: "İçme ve Kullanma Suyu Arıtılan Miktar",
    unit: "Bin m³",
    color: "#26a69a",
  },
  {
    endpoint: "EnergyEnvironment/kisi_basi_ortalama_belediye_atik",
    category: "Çevre",
    title: "Kişi Başı Ortalama Belediye Atık Miktarı",
    unit: "kg",
    color: "#7b1fa2",
  },
  {
    endpoint: "EnergyEnvironment/kisi_basi_elektrik_tuketimi",
    category: "Enerji",
    title: "Kişi Başına Elektrik Tüketimi",
    unit: "kWh",
    color: "#c2185b",
  },
];

const EMPLOYMENT_CHARTS = [
  {
    endpoint: "Employment/isgucu-katilma-orani",
    category: "İşgücü Katılım",
    title: "İşgücü Katılma Oranı",
    unit: "%",
    color: "#1976d2",
  },
  {
    endpoint: "Employment/issizlik-orani",
    category: "İşsizlik",
    title: "İşsizlik Oranı",
    unit: "%",
    color: "#e53935",
  },
  {
    endpoint: "Employment/istihdam-orani",
    category: "İstihdam",
    title: "İstihdam Oranı",
    unit: "%",
    color: "#388e3c",
  },
];

const EDUCATION_CHARTS = [
  {
    endpoint: "Education/students-per-school",
    category: "Okul Başına Öğrenci",
    title: "Okul Başına Öğrenci Sayısı",
    unit: "öğrenci",
    color: "#0288d1",
  },
  {
    endpoint: "Education/students-per-teacher",
    category: "Öğretmen Başına Öğrenci",
    title: "Öğretmen Başına Öğrenci Sayısı",
    unit: "öğrenci",
    color: "#7b1fa2",
  },
  {
    endpoint: "Education/schooling-rate",
    category: "Net Okullaşma Oranı",
    title: "Net Okullaşma Oranı",
    unit: "%",
    color: "#388e3c",
  },
  {
    endpoint: "Education/literacy-rate",
    category: "Okuma Yazma",
    title: "Okuma Yazma Oranı",
    unit: "%",
    color: "#f57c00",
  },
  {
    endpoint: "Education/theatre-performance",
    category: "Tiyatro ve Gösteri",
    title: "Tiyatro / Gösteri Sayısı",
    unit: "adet",
    color: "#c2185b",
  },
  {
    endpoint: "Education/libraries",
    category: "Kütüphaneler",
    title: "Kütüphane Sayısı",
    unit: "adet",
    color: "#512da8",
  },
];

const TRANSPORTATION_CHARTS = [
  {
    endpoint: "Transportation/otomobil-sayisi",
    category: "Otomobil Sayısı",
    title: "Bin Kişi Başına Otomobil Sayısı",
    unit: "otomobil",
    color: "#1976d2",
  },
  {
    endpoint: "Transportation/tasit-yaslari",
    category: "Taşıt Yaşları",
    title: "Taşıtların Ortalama Yaşları",
    unit: "yıl",
    color: "#f57c00",
  },
];

const CHART_CATEGORIES = {
  "Tarım ve Hayvancılık": AGRICULTURE_CHARTS,
  "Eğitim ve Kültür": EDUCATION_CHARTS,
  "Çevre ve Enerji": ENERGY_ENVIRONMENT_CHARTS,
  "Ulaştırma ve Haberleşme": TRANSPORTATION_CHARTS,
  "İstihdam ve İşsizlik": EMPLOYMENT_CHARTS,
};

const ChartManager = ({
  selectedDistrict,
  category,
  onAgricultureSubChange,
}: Props) => {
  const charts = CHART_CATEGORIES[category as keyof typeof CHART_CATEGORIES];
  if (!charts) return null;

  return (
    <Stack spacing={3}>
      {charts.map((chart, index) => (
        <GenericChart
          key={`${chart.endpoint}-${chart.category}-${index}`}
          selectedDistrict={selectedDistrict}
          endpoint={chart.endpoint}
          category={chart.category}
          title={chart.title}
          unit={chart.unit}
          color={chart.color}
          onClick={
            category === "Tarım ve Hayvancılık" && "dataType" in chart
              ? () => {
                  console.log(
                    `Tarım alt kategorisi tıklandı: ${chart.dataType}`
                  );
                  onAgricultureSubChange?.(chart.dataType);
                }
              : undefined
          }
        />
      ))}
    </Stack>
  );
};

export default ChartManager;
