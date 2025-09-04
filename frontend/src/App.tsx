import { useState } from "react";
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

function App() {
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [panelOpen, setPanelOpen] = useState(false);

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
          top: 64, // AppBar yüksekliği
          left: 0,
          right: 0,
          bottom: 0,
          width: "100vw",
          height: "calc(100vh - 64px)",
          overflow: "hidden",
        }}
      >
        <AnkaraMap
          onDistrictClick={(district) => {
            setSelectedDistrict(district);
            setPanelOpen(true); // İlçeye tıklayınca paneli aç
          }}
        />
      </Box>

      {/* YAN PANEL (Drawer) */}
      <Drawer
        anchor="right"
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: { xs: "100vw", sm: 400, md: 450 },
            top: 64, // AppBar altından başla
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
          <DistrictPanel selectedDistrict={selectedDistrict} />
        </Box>
      </Drawer>
      <ChatBot />
    </ThemeProvider>
  );
}

export default App;
