import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Alert,
  CircularProgress,
  Button,
} from "@mui/material";
import { TrendingUp, TrendingDown, Remove } from "@mui/icons-material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ApiData {
  category: string;
  year: string;
  district: string;
  value: number;
}

interface ChartData {
  year: string;
  value: number;
}

interface ProcessedData {
  chartData: ChartData[];
  trend: "up" | "down" | "stable";
  totalYears: number;
  lastValue: number;
  category: string;
}

interface Props {
  selectedDistrict: string;
  endpoint: string; // örn: "Education/literacy-rate"
  category: string;
  title: string;
  unit: string;
  color?: string;
  onClick?: () => void; // 👈 Haritada gösterme için
}

const GenericChart = ({
  selectedDistrict,
  endpoint,
  category,
  title,
  unit,
  color = "#1976d2",
  onClick,
}: Props) => {
  const [data, setData] = useState<ProcessedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedDistrict) {
      setData(null);
      return;
    }
    loadData();
  }, [selectedDistrict, endpoint]);

  const normalizeDistrict = (district: string) => {
    if (!district) return "";
    if (district === "Ankara (Genel)") return "Ankara (Genel)";

    const match = district.match(/\((.*?)\)/);
    if (match) return match[1].trim();

    if (district.includes("-")) return district.split("-")[0].trim();

    return district.trim();
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:5005/api/${endpoint}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const rawData: ApiData[] = await response.json();

      const filteredData = rawData
        .filter((d) => normalizeDistrict(d.district) === selectedDistrict)
        .sort((a, b) => parseInt(a.year) - parseInt(b.year));

      const chartData: ChartData[] = filteredData.map((d) => ({
        year: d.year,
        value: d.value,
      }));

      let trend: "up" | "down" | "stable" = "stable";
      if (chartData.length > 1) {
        const firstValue = chartData[0].value;
        const lastValue = chartData[chartData.length - 1].value;
        const changePercent = ((lastValue - firstValue) / firstValue) * 100;

        if (changePercent > 5) trend = "up";
        else if (changePercent < -5) trend = "down";
      }

      setData({
        chartData,
        trend,
        totalYears: chartData.length,
        lastValue: chartData[chartData.length - 1]?.value ?? 0,
        category,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Veri yüklenemedi");
      setData(null);
    }

    setLoading(false);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp sx={{ color: "success.main" }} />;
      case "down":
        return <TrendingDown sx={{ color: "error.main" }} />;
      default:
        return <Remove sx={{ color: "text.secondary" }} />;
    }
  };

  if (loading) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height={200}
          >
            <CircularProgress size={40} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        <strong>{title}</strong> verisi yüklenirken hata oluştu: {error}
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert severity="info">
        <strong>{title}</strong> verisi bu ilçe için bulunamadı.
      </Alert>
    );
  }

  return (
    <Card variant="outlined" sx={{ position: "relative" }}>
      <CardContent>
        {/* Başlık */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Typography variant="h6">{title}</Typography>
          {getTrendIcon(data.trend)}
        </Box>

        {/* Grafik */}
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip formatter={(value) => [`${value} ${unit}`, title]} />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={{ r: 4 }}
              name={unit}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Alt bilgi */}
        <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Chip
            label={`${data.totalYears} yıl verisi`}
            variant="outlined"
            size="small"
          />
          <Chip
            label={`Son: ${data.lastValue.toLocaleString()} ${unit}`}
            variant="outlined"
            size="small"
          />
        </Box>

        {/* 👇 Yeni buton */}
        {onClick && (
          <Box sx={{ mt: 2, textAlign: "right" }}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={onClick}
            >
              Haritada Göster
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default GenericChart;
