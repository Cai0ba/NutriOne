"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useState } from "react";
import { getStoredToken } from "@/lib/auth";
import {
  listSelfMessages,
  markSelfMessagesRead,
  sendSelfMessage,
  type Message,
} from "@/lib/messages";
import { PatientLayout } from "../patient/PatientLayout";
import { ConversationPanel } from "./ConversationPanel";

export function PatientMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = getStoredToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await listSelfMessages(token);
      setMessages(data);
      await markSelfMessagesRead(token);
    } catch {
      setError("Não foi possível carregar suas mensagens.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSend = async (texto: string) => {
    const token = getStoredToken();
    if (!token) return;
    const msg = await sendSelfMessage(token, texto);
    setMessages((prev) => [...prev, msg]);
  };

  return (
    <PatientLayout>
      <Box sx={{ px: { xs: 2, md: 4 }, py: 3, maxWidth: 900, mx: "auto", height: "calc(100vh - 72px - 48px)" }}>
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: 24, fontWeight: 900, color: "#111827" }}>Mensagens</Typography>
          <Typography sx={{ fontSize: 13, color: "#6b7280" }}>Converse com seu nutricionista</Typography>
        </Box>

        {error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Paper elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 2, height: "calc(100% - 64px)" }}>
            <ConversationPanel
              messages={messages}
              loading={loading}
              currentRole="client"
              onSend={handleSend}
              emptyLabel="Nenhuma mensagem ainda. Tire suas dúvidas com seu nutricionista!"
            />
          </Paper>
        )}
      </Box>
    </PatientLayout>
  );
}
