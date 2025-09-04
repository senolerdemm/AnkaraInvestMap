import { useEffect, useState } from "react";
import {
  Box,
  Chip,
  Typography,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { MyLocation, ZoomIn, Refresh } from "@mui/icons-material";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";

interface Props {
  onDistrictClick: (district: string) => void;
}

function AnkaraMap({ onDistrictClick }: Props) {
  const [option, setOption] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGeoJSON = async () => {
      try {
        const response = await fetch("/ankara.json");
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const ankaraData = await response.json();

        // isim düzeltme
        ankaraData.features.forEach((f: any) => {
          f.properties.name =
            f.properties.name ||
            f.properties.NAME_2 ||
            f.properties.ILCE_ADI ||
            f.properties.district ||
            "Bilinmeyen İlçe";
        });

        echarts.registerMap("ankara", ankaraData);

        setOption({
          backgroundColor: "transparent",
          tooltip: {
            trigger: "item",
            formatter: (params: any) => `
              <div style="padding: 10px; font-family: Inter, sans-serif;">
                <div style="font-weight:600; font-size:15px; color:#4FC3F7;">
                  ${params.name}
                </div>
                <div style="font-size:12px; color:#ccc;">Detay için tıklayın</div>
              </div>
            `,
            backgroundColor: "rgba(40,40,60,0.95)",
            borderColor: "#4FC3F7",
            borderWidth: 1,
            textStyle: { color: "#fff" },
            extraCssText:
              "box-shadow: 0 4px 20px rgba(243, 243, 243, 0.4); border-radius: 8px;",
          },
          series: [
            {
              type: "map",
              map: "ankara",
              roam: true,
              scaleLimit: { min: 0.9, max: 5 },
              zoom: 1.2,
              label: {
                show: true,
                fontSize: 11,
                color: "#b0bec5",
                fontWeight: 500,
              },
              itemStyle: {
                areaColor: "#263238", // normal fill
                borderColor: "#455A64",
                borderWidth: 0.8,
              },
              emphasis: {
                label: { color: "#fff", fontWeight: 700 },
                itemStyle: {
                  areaColor: "#4FC3F7", // hover rengi
                  borderColor: "#81D4FA",
                  shadowBlur: 15,
                  shadowColor: "rgba(79,195,247,0.7)",
                },
              },
              select: {
                itemStyle: {
                  areaColor: "#0288d1",
                  borderColor: "#B3E5FC",
                  borderWidth: 2,
                },
              },
              selectedMode: "single",
            },
          ],
        });

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bilinmeyen hata");
        setLoading(false);
      }
    };

    loadGeoJSON();
  }, []);

  const onEvents = {
    click: (params: any) => {
      if (params.name) onDistrictClick(params.name);
    },
  };

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
          bgcolor: "#1c1c28",
        }}
      >
        <CircularProgress size={60} sx={{ color: "#4FC3F7" }} />
        <Typography variant="h6" sx={{ color: "#4FC3F7" }}>
          Harita yükleniyor...
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
          bgcolor: "#1c1c28",
        }}
      >
        <Typography variant="h5" color="error">
          Harita yüklenemedi
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        position: "relative",
        overflow: "hidden",
        bgcolor: "#1c1c28", // dashboard koyu tema
      }}
    >
      {/* Üst Bilgi Çubuğu */}
      <Box
        sx={{
          position: "absolute",
          top: 16,
          left: 16,
          zIndex: 1000,
          display: "flex",
          gap: 1,
          alignItems: "center",
          bgcolor: "rgba(30,30,50,0.8)",
          p: 1.2,
          borderRadius: 2,
          backdropFilter: "blur(8px)",
          boxShadow: "0 4px 12px rgba(243, 238, 238, 0.3)",
        }}
      >
        {/* Yeni eklenen Chip */}
        <Chip
          icon={<MyLocation />}
          label="Ankara (Genel)"
          color="secondary"
          onClick={() => onDistrictClick("Ankara (Genel)")}
          sx={{ fontWeight: 600, bgcolor: "#6a1b9a", color: "#fff" }}
        />
        <Chip
          icon={<MyLocation />}
          label="Ankara İlçeleri"
          color="primary"
          sx={{ fontWeight: 600, bgcolor: "#0288d1", color: "#fff" }}
        />
        <IconButton size="small" sx={{ color: "#81D4FA" }}>
          <Refresh fontSize="small" />
        </IconButton>
      </Box>

      {/* Kontrol İpuçları */}
      <Box
        sx={{
          position: "absolute",
          bottom: 16,
          right: 16,
          zIndex: 1000,
          bgcolor: "rgba(30,30,50,0.8)",
          px: 1.5,
          py: 0.7,
          borderRadius: 2,
          backdropFilter: "blur(8px)",
          boxShadow: "0 4px 12px rgba(235, 232, 232, 0.25)",
        }}
      >
        <Typography
          variant="caption"
          sx={{ color: "#eee", display: "flex", alignItems: "center", gap: 1 }}
        >
          <ZoomIn sx={{ fontSize: 14 }} /> Zoom: Mouse | Pan: Drag | Click:
          Select
        </Typography>
      </Box>

      {/* TAM EKRAN HARİTA */}
      <ReactECharts
        option={option}
        style={{ height: "100%", width: "100%" }}
        onEvents={onEvents}
        opts={{ renderer: "canvas" }}
      />
    </Box>
  );
}

export default AnkaraMap;
