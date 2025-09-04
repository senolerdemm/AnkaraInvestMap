import { useEffect, useState } from "react";
import {
  Box,
  Chip,
  Typography,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { MyLocation, ZoomIn, Refresh } from "@mui/icons-material";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

interface Props {
  onDistrictClick: (district: string) => void;
  selectedCategory?: string;
  selectedDataType?: string;
  districtValues?: { [districtName: string]: number };
}

function AnkaraMap({
  onDistrictClick,
  selectedCategory,
  selectedDataType,
  districtValues,
}: Props) {
  const [geoData, setGeoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGeoJSON = async () => {
      try {
        const response = await fetch("/ankara.json");
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const ankaraData = await response.json();

        // İsim düzeltme
        ankaraData.features.forEach((f: any) => {
          f.properties.name =
            f.properties.name ||
            f.properties.NAME_2 ||
            f.properties.ILCE_ADI ||
            f.properties.district ||
            "Bilinmeyen İlçe";
        });

        setGeoData(ankaraData);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bilinmeyen hata");
        setLoading(false);
      }
    };

    loadGeoJSON();
  }, []);

  // TÜİK tarzı renk skalası - gradient sistem
  const getCategoryColorScale = (category: string) => {
    const colorScales: { [key: string]: { colors: string[]; name: string } } = {
      "Nüfus ve Demografi": {
        colors: [
          "#fff5f5",
          "#fed7d7",
          "#feb2b2",
          "#fc8181",
          "#f56565",
          "#e53e3e",
          "#c53030",
          "#9b2c2c",
        ],
        name: "Kırmızı",
      },
      "Tarım ve Hayvancılık": {
        colors: [
          "#f0fff4",
          "#c6f6d5",
          "#9ae6b4",
          "#68d391",
          "#48bb78",
          "#38a169",
          "#2f855a",
          "#276749",
        ],
        name: "Yeşil",
      },
      "Çevre ve Enerji": {
        colors: [
          "#fffaf0",
          "#feebc8",
          "#fbd38d",
          "#f6ad55",
          "#ed8936",
          "#dd6b20",
          "#c05621",
          "#9c4221",
        ],
        name: "Turuncu",
      },
      "Eğitim ve Kültür": {
        colors: [
          "#faf5ff",
          "#e9d8fd",
          "#d6bcfa",
          "#b794f6",
          "#9f7aea",
          "#805ad5",
          "#6b46c1",
          "#553c9a",
        ],
        name: "Mor",
      },
      "İstihdam ve İşsizlik": {
        colors: [
          "#e6fffa",
          "#b2f5ea",
          "#81e6d9",
          "#4fd1c7",
          "#38b2ac",
          "#319795",
          "#2c7a7b",
          "#285e61",
        ],
        name: "Teal",
      },
      "Ulaştırma ve Haberleşme": {
        colors: [
          "#ebf8ff",
          "#bee3f8",
          "#90cdf4",
          "#63b3ed",
          "#4299e1",
          "#3182ce",
          "#2b77cb",
          "#2c5aa0",
        ],
        name: "Mavi",
      },
    };

    return colorScales[category] || colorScales["Nüfus ve Demografi"];
  };

  // İlçe ismi normalizasyonu
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

  // Veri değerine göre renk hesaplama - TÜİK tarzı gradient
  const getDistrictColor = (districtName: string) => {
    if (!districtValues || !selectedCategory) {
      return "#e2e8f0"; // Varsayılan gri
    }

    const normalizedName = normalizeDistrictName(districtName);
    const value = districtValues[normalizedName];

    if (value === undefined || value === null) {
      return "#e2e8f0"; // Gri - veri yok
    }

    const values = Object.values(districtValues).filter(
      (v) => v !== null && v !== undefined
    );
    if (values.length === 0) return "#e2e8f0";

    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    if (minValue === maxValue) {
      const colorScale = getCategoryColorScale(selectedCategory);
      return colorScale.colors[4]; // Orta renk
    }

    // Normalize et (0-1 arası)
    const normalized = (value - minValue) / (maxValue - minValue);
    const colorScale = getCategoryColorScale(selectedCategory);

    // 8 seviyeli renk skalası (TÜİK gibi)
    const colorIndex = Math.min(Math.floor(normalized * 8), 7);
    return colorScale.colors[colorIndex];
  };

  // Dinamik stil fonksiyonu - TÜİK tarzı
  const getFeatureStyle = (feature: any) => {
    const districtName = feature.properties.name;
    const fillColor = getDistrictColor(districtName);

    return {
      fillColor,
      weight: 1, // İnce sınır
      opacity: 1,
      color: "#ffffff", // Beyaz sınır (TÜİK gibi)
      fillOpacity: 0.8, // Biraz şeffaf
    };
  };

  const onEachFeature = (feature: any, layer: any) => {
    const name = feature.properties.name;
    const originalStyle = getFeatureStyle(feature);

    layer.on({
      click: () => onDistrictClick(name),
      mouseover: (e: any) => {
        e.target.setStyle({
          fillColor: "#FF5722", // Parlak turuncu hover
          weight: 3,
          color: "#BF360C",
          fillOpacity: 0.9,
        });
      },
      mouseout: (e: any) => {
        e.target.setStyle(originalStyle);
      },
    });

    // Tooltip'te veri değerini de göster
    const normalizedName = normalizeDistrictName(name);
    const value = districtValues?.[normalizedName];
    const valueText =
      value !== undefined && value !== null
        ? `<br/><small>Değer: ${value.toLocaleString()}${
            selectedDataType ? " " + getUnitForDataType(selectedDataType) : ""
          }</small>`
        : "";

    layer.bindTooltip(
      `<div style="
        background: linear-gradient(135deg, #0D47A1 0%, #1565C0 100%);
        color: white;
        padding: 10px 14px;
        border-radius: 10px;
        font-family: 'Roboto', sans-serif;
        box-shadow: 0 6px 20px rgba(0,0,0,0.4);
        border: 2px solid #2196F3;
        font-weight: bold;
      ">
        <div style="font-weight: 700; font-size: 15px; margin-bottom: 3px;">${name}</div>
        <div style="font-size: 12px; opacity: 0.95;">Detay için tıklayın${valueText}</div>
      </div>`,
      {
        sticky: true,
        offset: [0, -12],
      }
    );
  };

  // Veri tipi için birim getir
  const getUnitForDataType = (dataType: string) => {
    const unitMap: { [key: string]: string } = {
      population: "kişi",
      growthRate: "%",
      beekeeping: "işletme",
      livestock: "baş",
      tractors: "adet",
      "literacy-rate": "%",
      "istihdam-orani": "%",
      elektrik_tuketimi: "MWh",
      "otomobil-sayisi": "adet",
    };
    return unitMap[dataType] || "";
  };

  const ankaraCenter: LatLngExpression = [39.9334, 32.8597];

  if (loading) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 2,
          background: "#f5f7fa",
        }}
      >
        <CircularProgress size={50} sx={{ color: "#1976D2" }} />
        <Typography
          variant="h6"
          sx={{
            color: "#1976D2",
            fontWeight: 500,
            textAlign: "center",
          }}
        >
          Ankara haritası yükleniyor...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 2,
          p: 3,
          background: "#f5f7fa",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: "#d32f2f",
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          Harita yüklenemedi
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "#666",
            textAlign: "center",
            maxWidth: 400,
          }}
        >
          {error}
        </Typography>
        <IconButton
          onClick={() => window.location.reload()}
          sx={{
            mt: 2,
            bgcolor: "#1976D2",
            color: "white",
            "&:hover": { bgcolor: "#1565C0" },
          }}
        >
          <Refresh />
        </IconButton>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        position: "relative",
        background: "#f5f7fa",
      }}
    >
      {/* Modern Üst Panel */}
      <Box
        sx={{
          position: "absolute",
          top: 16,
          left: 16,
          zIndex: 1000,
          display: "flex",
          gap: 1,
          alignItems: "center",
          background: "rgba(255, 255, 255, 0.98)",
          backdropFilter: "blur(12px)",
          p: 1.8,
          borderRadius: 4,
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
          border: "2px solid rgba(33, 150, 243, 0.3)",
        }}
      >
        <Chip
          icon={<MyLocation sx={{ fontSize: 18 }} />}
          label="Ankara Genel"
          onClick={() => onDistrictClick("Ankara (Genel)")}
          sx={{
            fontWeight: 700,
            bgcolor: "#1976D2",
            color: "white",
            fontSize: "13px",
            height: 36,
            "&:hover": { bgcolor: "#1565C0", transform: "scale(1.05)" },
            "& .MuiChip-icon": { color: "white" },
            boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
          }}
        />
        <Chip
          icon={<MyLocation sx={{ fontSize: 18 }} />}
          label="İlçeler"
          sx={{
            fontWeight: 700,
            bgcolor: "#FF6F00",
            color: "white",
            fontSize: "13px",
            height: 36,
            "&:hover": { bgcolor: "#E65100", transform: "scale(1.05)" },
            "& .MuiChip-icon": { color: "white" },
            boxShadow: "0 4px 12px rgba(255, 111, 0, 0.3)",
          }}
        />
        <IconButton
          size="small"
          onClick={() => window.location.reload()}
          sx={{
            color: "#1976D2",
            bgcolor: "rgba(25, 118, 210, 0.1)",
            "&:hover": { bgcolor: "rgba(25, 118, 210, 0.2)" },
          }}
        >
          <Refresh fontSize="small" />
        </IconButton>
      </Box>

      {/* TÜİK Tarzı Legend */}
      {selectedCategory && districtValues && (
        <Box
          sx={{
            position: "absolute",
            bottom: 20,
            right: 20,
            zIndex: 1000,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(8px)",
            p: 2,
            borderRadius: 1,
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            border: "1px solid rgba(0, 0, 0, 0.1)",
            minWidth: 180,
            fontSize: "12px",
          }}
        >
          <Typography
            variant="caption"
            fontWeight={600}
            color="text.primary"
            sx={{ mb: 1, display: "block", fontSize: "11px" }}
          >
            {selectedCategory}
          </Typography>

          {(() => {
            const values = Object.values(districtValues).filter(
              (v) => v !== null && v !== undefined
            );
            if (values.length === 0) return null;

            const minValue = Math.min(...values);
            const maxValue = Math.max(...values);
            const colorScale = getCategoryColorScale(selectedCategory);
            const step = (maxValue - minValue) / 8;

            return (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.3 }}>
                {colorScale.colors.map((color, index) => {
                  const rangeStart = Math.round(minValue + step * index);
                  const rangeEnd = Math.round(minValue + step * (index + 1));

                  return (
                    <Box
                      key={index}
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <Box
                        sx={{
                          width: 14,
                          height: 14,
                          bgcolor: color,
                          border: "0.5px solid #ccc",
                          borderRadius: 0.5,
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{ fontSize: "10px", color: "#333" }}
                      >
                        {index === 0
                          ? `${rangeStart.toLocaleString()} - ${rangeEnd.toLocaleString()}`
                          : index === colorScale.colors.length - 1
                          ? `${rangeStart.toLocaleString()}+`
                          : `${rangeStart.toLocaleString()} - ${rangeEnd.toLocaleString()}`}
                      </Typography>
                    </Box>
                  );
                })}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mt: 0.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 14,
                      height: 14,
                      bgcolor: "#e2e8f0",
                      border: "0.5px solid #ccc",
                      borderRadius: 0.5,
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{ fontSize: "10px", color: "#666" }}
                  >
                    Veri Yok
                  </Typography>
                </Box>
              </Box>
            );
          })()}
        </Box>
      )}

      {/* Temiz Alt Bilgi */}
      <Box
        sx={{
          position: "absolute",
          bottom: 16,
          left: 16,
          zIndex: 1000,
          background: "rgba(255, 255, 255, 0.98)",
          backdropFilter: "blur(12px)",
          px: 2.5,
          py: 1.2,
          borderRadius: 3,
          boxShadow: "0 6px 25px rgba(0, 0, 0, 0.15)",
          border: "2px solid rgba(33, 150, 243, 0.2)",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: "#333",
            display: "flex",
            alignItems: "center",
            gap: 1,
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          <ZoomIn sx={{ fontSize: 14, color: "#1976D2" }} />
          Zoom: Kaydır • Sürükle: Hareket • Tıkla: Seç
        </Typography>
      </Box>

      {/* Normal Leaflet Harita + Veri Bazlı Renklendirme */}
      <Box
        sx={{
          height: "100%",
          width: "100%",
          position: "relative",
          background: "#f5f7fa",
        }}
      >
        <MapContainer
          center={ankaraCenter}
          zoom={9}
          style={{
            height: "100%",
            width: "100%",
          }}
          scrollWheelZoom
          zoomControl={true}
          attributionControl={true}
        >
          {/* Normal harita katmanı */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {/* Ankara ilçeleri - veri bazlı renklerle */}
          {geoData && (
            <GeoJSON
              data={geoData}
              style={getFeatureStyle}
              onEachFeature={onEachFeature}
            />
          )}
        </MapContainer>
      </Box>
    </Box>
  );
}

export default AnkaraMap;
