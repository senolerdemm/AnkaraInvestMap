import { useState, useEffect } from "react";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Drawer,
} from "@mui/material";
import { Menu as MenuIcon, Close as CloseIcon } from "@mui/icons-material";
import AnkaraMap from "./components/AnkaraMap";
import DistrictPanel from "./components/DistrictPanel";
import ChatBot from "./components/ChatBot.tsx";

interface DistrictDataMap {
  [districtName: string]: number;
}

function App() {
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [panelOpen, setPanelOpen] = useState(false);

  // Harita renklendirmesi için state'ler
  const [selectedCategory, setSelectedCategory] =
    useState<string>("Nüfus ve Demografi");
  const [selectedDataType, setSelectedDataType] =
    useState<string>("population");
  const [districtValues, setDistrictValues] = useState<DistrictDataMap>({});

  const theme = createTheme({
    palette: {
      mode: "dark",
      primary: { main: "#1976d2" },
      secondary: { main: "#9c27b0" },
      background: { default: "#0a0e1a", paper: "#1e1e2e" },
    },
    typography: {
      fontFamily: "Inter, Roboto, Arial, sans-serif",
    },
  });

  // İlçe adı normalleştirme
  const normalizeDistrictName = (district: string) => {
    if (!district) return "";

    if (district === "Ankara (Genel)") {
      return "Ankara (Genel)";
    }

    const match = district.match(/\((.*?)\)/);
    if (match) return match[1].trim();

    if (district.includes("-")) return district.split("-")[0].trim();

    return district.trim();
  };

  // API'den veri çekme
  const fetchDistrictData = async (category: string, dataType: string) => {
    try {
      let endpoint = "";

      switch (category) {
        case "Nüfus ve Demografi":
          endpoint =
            dataType === "population" ? "population/all" : "growthrate/all";
          break;
        case "Tarım ve Hayvancılık":
          endpoint = `Agriculture/${dataType}`;
          break;
        case "Eğitim ve Kültür":
          endpoint = `Education/${dataType}`;
          break;
        case "Çevre ve Enerji":
          endpoint = `EnergyEnvironment/${dataType}`;
          break;
        case "İstihdam ve İşsizlik":
          endpoint = `Employment/${dataType}`;
          break;
        case "Ulaştırma ve Haberleşme":
          endpoint = `Transportation/${dataType}`;
          break;
        default:
          return;
      }

      const response = await fetch(`http://localhost:5005/api/${endpoint}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const rawData = await response.json();
      const processedData: DistrictDataMap = {};

      if (Array.isArray(rawData) && rawData.length > 0) {
        if (category === "Tarım ve Hayvancılık") {
          // ✅ Tarım için özel case: doğrudan ilçelere göre değer ata
          rawData.forEach((item: any) => {
            const normalizedDistrict = normalizeDistrictName(item.district);
            if (normalizedDistrict && item.value !== null) {
              processedData[normalizedDistrict] = item.value;
            }
          });
        } else {
          // ✅ Diğer kategoriler: yıl filtrelemesi
          const currentYear = new Date().getFullYear();
          const availableYears = [
            ...new Set(rawData.map((d: any) => parseInt(d.year))),
          ].sort((a, b) => b - a);

          const latestAvailableYear = availableYears[0];
          const targetYear = latestAvailableYear.toString();

          const targetYearData = rawData.filter(
            (d: any) => d.year === targetYear
          );

          targetYearData.forEach((item: any) => {
            const normalizedDistrict = normalizeDistrictName(item.district);
            if (normalizedDistrict && item.value !== null) {
              processedData[normalizedDistrict] = item.value;
            }
          });
        }

        console.log(`${category} - ${dataType} verileri:`, processedData);
      }

      setDistrictValues(processedData);
    } catch (error) {
      console.error("Veri çekilemedi:", error);
      setDistrictValues({});
    }
  };

  // Kategori değiştiğinde veri çek
  useEffect(() => {
    fetchDistrictData(selectedCategory, selectedDataType);
  }, [selectedCategory, selectedDataType]);

  // İlk yükleme
  useEffect(() => {
    fetchDistrictData("Nüfus ve Demografi", "population");
  }, []);

  // Kategori değiştirme fonksiyonu - Sadece iyi veriler
  const handleCategoryChange = (category: string, dataType: string) => {
    // Sadece ilçe bazlı verisi olan kategorileri kabul et
    const validCategories = ["Nüfus ve Demografi", "Tarım ve Hayvancılık"];

    if (validCategories.includes(category)) {
      setSelectedCategory(category);
      setSelectedDataType(dataType);
    } else {
      console.log(`${category} kategorisi için ilçe bazlı veri bulunamadı.`);
      // Varsayılan olarak nüfus verilerini göster
      setSelectedCategory("Nüfus ve Demografi");
      setSelectedDataType("population");
    }
  };
  const handleAgricultureSubChange = (subDataType: string) => {
    if (selectedCategory === "Tarım ve Hayvancılık") {
      setSelectedDataType(subDataType);
      fetchDistrictData("Tarım ve Hayvancılık", subDataType);
      console.log(`Tarım alt kategorisi değişti: ${subDataType}`);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* Üst Bar */}
      <AppBar
        position="fixed"
        elevation={4}
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
        }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            🗺️ Ankara İlçeleri Yatırım Önceliği Haritası
          </Typography>
          <IconButton
            color="inherit"
            onClick={() => setPanelOpen(true)}
            sx={{
              bgcolor: "rgba(255,255,255,0.1)",
              borderRadius: 2,
              "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
            }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* TAM EKRAN HARİTA */}
      <Box
        sx={{
          position: "fixed",
          top: 64,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100vw",
          height: "calc(100vh - 64px)",
          overflow: "hidden",
        }}
      >
        {/* Bilgilendirme Kutusu */}
        <Box
          sx={{
            position: "absolute",
            top: 80, // AppBar altında kalsın
            left: 16,
            zIndex: 1500,
            maxWidth: 320,
            bgcolor: "rgba(255,255,255,0.95)",
            color: "#333",
            p: 2,
            borderRadius: 2,
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            fontSize: "0.85rem",
            lineHeight: 1.4,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            📢 Bilgilendirme
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            • İlçelere harita üzerinden tıklayarak ilçeye özel verileri
            görebilirsiniz.
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            • Tablo içindeki <em>"Haritada Göster"</em> butonuna basarak seçilen
            verinin Ankara geneline tematik dağılımını görüntüleyebilirsiniz.
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            • ChatBot üzerinden Ankara verilerine göre yatırım önerileri
            alabilirsiniz.
          </Typography>
          <Typography variant="body2">
            • <strong>Ankara Genel</strong> butonuna tıklayarak tüm Ankara’ya
            ait genel verileri görebilirsiniz.
          </Typography>
        </Box>

        <AnkaraMap
          onDistrictClick={(district) => {
            setSelectedDistrict(district);
            setPanelOpen(true);
          }}
          selectedCategory={selectedCategory}
          selectedDataType={selectedDataType}
          districtValues={districtValues}
        />
      </Box>

      {/* YAN PANEL */}
      <Drawer
        anchor="right"
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: { xs: "100vw", sm: 400, md: 450 },
            top: 64,
            height: "calc(100vh - 64px)",
            bgcolor: "background.paper",
            borderLeft: "1px solid rgba(255,255,255,0.1)",
          },
        }}
      >
        {/* Panel Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            bgcolor: "primary.main",
          }}
        >
          <Typography variant="h6" sx={{ color: "white", fontWeight: 600 }}>
            İlçe Detayları
          </Typography>
          <IconButton
            onClick={() => setPanelOpen(false)}
            sx={{ color: "white" }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Panel İçerik */}
        <Box sx={{ flex: 1, overflow: "auto" }}>
          <DistrictPanel
            selectedDistrict={selectedDistrict}
            onCategoryChange={handleCategoryChange}
            onAgricultureSubChange={handleAgricultureSubChange}
          />
        </Box>
      </Drawer>
      <ChatBot />
    </ThemeProvider>
  );
}

export default App;
