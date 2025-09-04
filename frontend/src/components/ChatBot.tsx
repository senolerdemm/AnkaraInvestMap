import { useState, useEffect } from "react";
import {
  IconButton,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  autoOpen?: boolean; // Otomatik açılma prop'u
}

export default function ChatBot({ autoOpen = true }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Merhaba 👋 Yatırım danışmanınıza hoş geldiniz! Size nasıl yardımcı olabilirim?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Otomatik açılma
  useEffect(() => {
    if (autoOpen) {
      const timer = setTimeout(() => setOpen(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [autoOpen]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5005/Ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMessage.content }),
      });

      const data = await response.json();
      const reply = data.reply || "⚠️ Cevap alınamadı.";

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "❌ API bağlantı hatası." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Sol alt köşedeki yuvarlak ikon */}
      <IconButton
        onClick={() => setOpen(!open)}
        sx={{
          position: "fixed",
          bottom: 24,
          left: 24, // Sol tarafa taşındı
          width: 60,
          height: 60,
          bgcolor: "primary.main",
          color: "white",
          "&:hover": {
            bgcolor: "primary.dark",
            transform: "scale(1.05)",
          },
          transition: "all 0.3s ease",
          boxShadow: "0 4px 20px rgba(25, 118, 210, 0.3)",
          zIndex: 2000,
        }}
      >
        {open ? <CloseIcon /> : <ChatIcon />}
      </IconButton>

      {/* Chat paneli */}
      {open && (
        <Paper
          elevation={6}
          sx={{
            position: "fixed",
            bottom: 100,
            left: 24, // Sol tarafa taşındı
            width: 380,
            height: 520,
            borderRadius: 3,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 2000,
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              bgcolor: "primary.main",
              color: "white",
              fontWeight: 600,
            }}
          >
            💬 Yatırım Chatbot
          </Box>

          {/* Mesajlar */}
          <Box
            sx={{
              flex: 1,
              p: 2,
              overflowY: "auto",
              bgcolor: "background.default",
            }}
          >
            {messages.map((msg, i) => (
              <Box
                key={i}
                sx={{
                  mb: 1.5,
                  display: "flex",
                  justifyContent:
                    msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <Box
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    maxWidth: "75%",
                    bgcolor: msg.role === "user" ? "primary.main" : "grey.800",
                    color: "white",
                  }}
                >
                  {msg.content}
                </Box>
              </Box>
            ))}
            {loading && (
              <Typography variant="body2" color="text.secondary">
                Yazıyor...
              </Typography>
            )}
          </Box>

          {/* Input */}
          <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Mesajınızı yazın..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <Button
              variant="contained"
              sx={{ mt: 1, float: "right" }}
              onClick={sendMessage}
              disabled={loading}
            >
              Gönder
            </Button>
          </Box>
        </Paper>
      )}
    </>
  );
}
