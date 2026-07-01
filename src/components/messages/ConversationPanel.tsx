"use client";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Message, SenderRole } from "@/lib/messages";

function formatTimestamp(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

type ConversationPanelProps = {
  messages: Message[];
  loading: boolean;
  currentRole: SenderRole;
  onSend: (texto: string) => Promise<void>;
  emptyLabel?: string;
};

export function ConversationPanel({
  messages, loading, currentRole, onSend, emptyLabel = "Nenhuma mensagem ainda. Envie a primeira!",
}: ConversationPanelProps) {
  const [texto, setTexto]     = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async () => {
    const trimmed = texto.trim();
    if (!trimmed || sending) return;
    setSending(true);
    try {
      await onSend(trimmed);
      setTexto("");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ flex: 1, overflowY: "auto", p: 2, display: "flex", flexDirection: "column", gap: 1.25 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress color="primary" size={28} />
          </Box>
        ) : messages.length === 0 ? (
          <Typography sx={{ color: "#9ca3af", fontSize: 13, textAlign: "center", py: 6 }}>
            {emptyLabel}
          </Typography>
        ) : (
          messages.map((m) => {
            const mine = m.senderRole === currentRole;
            return (
              <Box
                key={m._id}
                sx={{
                  alignSelf: mine ? "flex-end" : "flex-start",
                  maxWidth: "75%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.25,
                }}
              >
                <Box
                  sx={{
                    bgcolor: mine ? "#10b981" : "#f3f4f6",
                    color: mine ? "#fff" : "#111827",
                    borderRadius: 2,
                    px: 1.75,
                    py: 1,
                    fontSize: 14,
                    wordBreak: "break-word",
                  }}
                >
                  {m.texto}
                </Box>
                <Typography
                  sx={{ fontSize: 10.5, color: "#9ca3af", textAlign: mine ? "right" : "left", px: 0.5 }}
                >
                  {formatTimestamp(m.createdAt)}
                </Typography>
              </Box>
            );
          })
        )}
        <div ref={bottomRef} />
      </Box>

      <Box sx={{ display: "flex", gap: 1, p: 1.5, borderTop: "1px solid #e5e7eb" }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Escreva uma mensagem..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={sending}
          multiline
          maxRows={4}
        />
        <IconButton
          color="primary"
          onClick={handleSend}
          disabled={sending || !texto.trim()}
          sx={{ bgcolor: "#10b981", color: "#fff", "&:hover": { bgcolor: "#059669" }, "&.Mui-disabled": { bgcolor: "#e5e7eb", color: "#9ca3af" } }}
        >
          <Send size={18} />
        </IconButton>
      </Box>
    </Box>
  );
}
