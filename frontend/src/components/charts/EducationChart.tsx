import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface EducationData {
  category: string;
  subCategory: string;
  year: string;
  district: string;
  value: number;
}

interface Props {
  selectedDistrict: string;
  endpoint: string;
  title: string;
  color?: string;
}

const EducationChart = ({
  selectedDistrict,
  endpoint,
  title,
  color = "#0288d1",
}: Props) => {
  const [data, setData] = useState<EducationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedDistrict) return;
    loadData();
  }, [selectedDistrict]);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5005/api/education/${endpoint}`
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const raw: EducationData[] = await response.json();

      const filtered = raw.filter(
        (d) =>
          d.district === "Ankara (Genel)" || // il bazlı kayıtlar
          d.district.includes(selectedDistrict) // seçilen ilçe kayıtları
      );
      setData(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Veri alınamadı");
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {title} yüklenemedi: {error}
      </Alert>
    );
  }

  if (data.length === 0) {
    return <Alert severity="info">{title} verisi yok.</Alert>;
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{title}</Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default EducationChart;
