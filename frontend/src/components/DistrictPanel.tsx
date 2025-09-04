import {
  Paper,
  Typography,
  Box,
  Avatar,
  Fade,
  Stack,
  Card,
  CardContent,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  People,
  TrendingUp,
  TrendingDown,
  BarChart,
  LocationOn,
  Remove,
  ExpandMore,
  School,
  LocalHospital,
  Business,
  Home,
  Work,
  Agriculture,
  DirectionsCar,
  AccountBalance,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
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
import ChartManager from "./charts/ChartManager.tsx";

interface Props {
  selectedDistrict: string;
  onCategoryChange?: (category: string, dataType: string) => void;
  onAgricultureSubChange?: (subDataType: string) => void;
}

interface PopulationData {
  year: string;
  district: string;
  population: number;
}

interface GrowthRateData {
  year: string;
  district: string;
  growthRate: number;
}

interface PopulationProcessedData {
  populationTrend?: {
    years: string[];
    values: number[];
    trend: "up" | "down" | "stable";
    avgGrowth: number;
  };
  growthRates?: {
    years: string[];
    rates: number[];
    avgRate: number;
  };
}

const DistrictPanel = ({
  selectedDistrict,
  onCategoryChange,
  onAgricultureSubChange,
}: Props) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [expandedCategory, setExpandedCategory] =
    useState<string>("Nüfus ve Demografi");
  const [populationData, setPopulationData] =
    useState<PopulationProcessedData | null>(null);
  const [loading, setLoading] = useState(false);

  // Aktif kategoriler - veri olan kategoriler
  const activeCategories = [
    "Nüfus ve Demografi",
    "Tarım ve Hayvancılık",
    "Sanayi",
    "Sağlık ve Sosyal Koruma",
    "Eğitim ve Kültür",
    "Çevre ve Enerji",
    "Ulaştırma ve Haberleşme",
    "İstihdam ve İşsizlik",
  ];

  // Kategori setini selectedDistrict'e göre belirle
  useEffect(() => {
    if (selectedDistrict === "Ankara (Genel)") {
      setCategories([
        "Çevre ve Enerji",
        "Eğitim ve Kültür",
        "İstihdam ve İşsizlik",
        "Nüfus ve Demografi",
        "Tarım ve Hayvancılık",
        "Ulaştırma ve Haberleşme",
      ]);
    } else {
      setCategories(["Nüfus ve Demografi", "Tarım ve Hayvancılık"]);
    }
    // her seçimde başlangıç "Nüfus ve Demografi"
    setExpandedCategory("Nüfus ve Demografi");
  }, [selectedDistrict]);

  // Kategori için varsayılan veri tipleri
  const getDefaultDataType = (category: string) => {
    const defaultDataTypes: { [key: string]: string } = {
      "Nüfus ve Demografi": "population",
      "Tarım ve Hayvancılık": "beekeeping",
    };
    return defaultDataTypes[category] || "population";
  };

  // Accordion expand
  const handleCategoryExpand = (category: string) => {
    const newCategory = expandedCategory === category ? "" : category;
    setExpandedCategory(newCategory);

    const validMapCategories = ["Nüfus ve Demografi", "Tarım ve Hayvancılık"];

    if (
      onCategoryChange &&
      newCategory &&
      validMapCategories.includes(newCategory)
    ) {
      const defaultDataType = getDefaultDataType(newCategory);
      onCategoryChange(newCategory, defaultDataType);
      console.log("Panel kategori değişikliği:", newCategory, defaultDataType);
    } else if (onCategoryChange && newCategory) {
      console.log(
        `${newCategory} için ilçe bazlı veri yok, nüfus haritası gösteriliyor.`
      );
      onCategoryChange("Nüfus ve Demografi", "population");
    }
  };

  useEffect(() => {
    loadPopulationData();
  }, []);

  useEffect(() => {
    if (selectedDistrict) {
      processPopulationData(selectedDistrict);
    }
  }, [selectedDistrict]);

  const loadPopulationData = async () => {
    setLoading(true);
    try {
      const [populationRes, growthRes] = await Promise.all([
        fetch("http://localhost:5005/api/population/all"),
        fetch("http://localhost:5005/api/growthrate/all"),
      ]);

      const populationRawData: PopulationData[] = await populationRes.json();
      const growthRawData: GrowthRateData[] = await growthRes.json();

      (window as any).districtPanelData = {
        population: populationRawData,
        growthRates: growthRawData,
      };
    } catch (error) {
      console.error("Nüfus verileri yüklenemedi:", error);
    }
    setLoading(false);
  };

  const processPopulationData = (district: string) => {
    const globalData = (window as any).districtPanelData;
    if (!globalData) return;

    const popData =
      globalData.population?.filter(
        (item: PopulationData) => item.district === district
      ) || [];

    const growthData =
      globalData.growthRates?.filter(
        (item: GrowthRateData) => item.district === district
      ) || [];

    const processedResult: PopulationProcessedData = {};

    if (popData.length > 0) {
      const sortedPopData = popData.sort(
        (a: PopulationData, b: PopulationData) =>
          parseInt(a.year) - parseInt(b.year)
      );
      const popYears = sortedPopData.map((item: PopulationData) => item.year);
      const popValues = sortedPopData.map(
        (item: PopulationData) => item.population
      );

      let popTrend: "up" | "down" | "stable" = "stable";
      let avgGrowth = 0;

      if (popValues.length > 1) {
        const firstValue = popValues[0];
        const lastValue = popValues[popValues.length - 1];
        avgGrowth =
          (((lastValue - firstValue) / firstValue) * 100) /
          (popValues.length - 1);

        if (avgGrowth > 1) popTrend = "up";
        else if (avgGrowth < -1) popTrend = "down";
      }

      processedResult.populationTrend = {
        years: popYears,
        values: popValues,
        trend: popTrend,
        avgGrowth,
      };
    }

    if (growthData.length > 0) {
      const sortedGrowthData = growthData.sort(
        (a: GrowthRateData, b: GrowthRateData) =>
          parseInt(a.year) - parseInt(b.year)
      );
      const growthYears = sortedGrowthData.map(
        (item: GrowthRateData) => item.year
      );
      const growthRates = sortedGrowthData.map(
        (item: GrowthRateData) => item.growthRate
      );
      const avgRate =
        growthRates.length > 0
          ? growthRates.reduce((a: number, b: number) => a + b, 0) /
            growthRates.length
          : 0;

      processedResult.growthRates = {
        years: growthYears,
        rates: growthRates,
        avgRate,
      };
    }

    setPopulationData(processedResult);
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      "Çevre ve Enerji": <Business color="primary" />,
      "Sosyoekonomik Seviye": <TrendingUp color="primary" />,
      "Eğitim ve Kültür": <School color="primary" />,
      "İnşaat ve Konut": <Home color="primary" />,
      "İstihdam ve İşsizlik": <Work color="primary" />,
      "Nüfus ve Demografi": <People color="primary" />,
      "Sağlık ve Sosyal Koruma": <LocalHospital color="primary" />,
      Sanayi: <Business color="primary" />,
      "Tarım ve Hayvancılık": <Agriculture color="primary" />,
      "Ulaştırma ve Haberleşme": <DirectionsCar color="primary" />,
      "Ulusal Hesaplar": <AccountBalance color="primary" />,
    };
    return iconMap[category] || <BarChart color="primary" />;
  };

  if (!selectedDistrict) {
    return (
      <Box
        sx={{
          p: 3,
          textAlign: "center",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <LocationOn sx={{ fontSize: 80, color: "primary.light", mb: 2 }} />
        <Typography variant="h5" gutterBottom fontWeight={600} color="primary">
          TÜİK İstatistikleri
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Harita üzerinde bir ilçeye tıklayarak kategorilere göre verileri
          görüntüleyin
        </Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography variant="body1">Veriler yükleniyor...</Typography>
      </Box>
    );
  }

  return (
    <Fade in timeout={500}>
      <Paper
        elevation={0}
        sx={{ height: "100%", display: "flex", flexDirection: "column" }}
      >
        {/* Header */}
        <Box sx={{ bgcolor: "primary.main", color: "white", p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Avatar
              sx={{ bgcolor: "primary.dark", mr: 2, width: 50, height: 50 }}
            >
              {selectedDistrict.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" fontWeight={600}>
                {selectedDistrict}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                TÜİK İstatistik Kategorileri
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* İçerik */}
        <Box sx={{ flex: 1, overflow: "auto" }}>
          <Stack>
            {categories.map((category) => (
              <Accordion
                key={category}
                expanded={expandedCategory === category}
                onChange={() => handleCategoryExpand(category)}
                disabled={!activeCategories.includes(category)}
              >
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {getCategoryIcon(category)}
                    <Typography fontWeight={500}>{category}</Typography>
                    {!activeCategories.includes(category) && (
                      <Typography variant="caption" color="text.secondary">
                        (Yakında)
                      </Typography>
                    )}
                  </Box>
                </AccordionSummary>

                <AccordionDetails>
                  {/* Nüfus ve Demografi */}
                  {category === "Nüfus ve Demografi" &&
                    populationData?.populationTrend && (
                      <Stack spacing={3}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              Nüfus Grafiği
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                              <LineChart
                                data={populationData.populationTrend.years.map(
                                  (year, idx) => ({
                                    year,
                                    population:
                                      populationData.populationTrend!.values[
                                        idx
                                      ],
                                  })
                                )}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="year" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line
                                  type="monotone"
                                  dataKey="population"
                                  stroke="#1976d2"
                                  strokeWidth={2}
                                  dot={{ r: 3 }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>

                        {populationData.growthRates && (
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="h6" gutterBottom>
                                Yıllık Nüfus Artış Hızı (%)
                              </Typography>
                              <ResponsiveContainer width="100%" height={300}>
                                <LineChart
                                  data={populationData.growthRates.years.map(
                                    (year, idx) => ({
                                      year,
                                      growthRate:
                                        populationData.growthRates!.rates[idx],
                                    })
                                  )}
                                >
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="year" />
                                  <YAxis />
                                  <Tooltip />
                                  <Legend />
                                  <Line
                                    type="monotone"
                                    dataKey="growthRate"
                                    stroke="#e53935"
                                    strokeWidth={2}
                                    dot={{ r: 3 }}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </CardContent>
                          </Card>
                        )}
                      </Stack>
                    )}

                  {/* Dinamik kategoriler */}
                  {[
                    "Tarım ve Hayvancılık",
                    "Sanayi",
                    "Sağlık ve Sosyal Koruma",
                    "Eğitim ve Kültür",
                    "Çevre ve Enerji",
                    "Ulaştırma ve Haberleşme",
                    "İstihdam ve İşsizlik",
                  ].includes(category) && (
                    <ChartManager
                      selectedDistrict={selectedDistrict}
                      category={category}
                      onAgricultureSubChange={onAgricultureSubChange}
                    />
                  )}

                  {/* Pasif kategoriler */}
                  {!activeCategories.includes(category) && (
                    <Alert severity="info">
                      <strong>{category}</strong> verisi henüz eklenmedi.
                    </Alert>
                  )}
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        </Box>
      </Paper>
    </Fade>
  );
};

export default DistrictPanel;
