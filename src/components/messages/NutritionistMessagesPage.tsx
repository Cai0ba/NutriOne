"use client";

import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { getMyPatients, getStoredToken, type Patient } from "@/lib/auth";
import {
  listMessages,
  markMessagesRead,
  sendMessageToPatient,
  type Message,
} from "@/lib/messages";
import { ConversationPanel } from "./ConversationPanel";

function getInitials(nome: string) {
  return nome.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

export function NutritionistMessagesPage() {
  const [patients, setPatients]   = useState<Patient[]>([]);
  const [selected, setSelected]   = useState<Patient | null>(null);
  const [messages, setMessages]   = useState<Message[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) return;
    getMyPatients(token)
      .then((res) => {
        setPatients(res.patients);
        if (res.patients.length > 0) setSelected(res.patients[0]);
      })
      .catch(() => setError("Não foi possível carregar seus pacientes."))
      .finally(() => setLoadingPatients(false));
  }, []);

  const loadConversation = useCallback(async (patientId: string) => {
    const token = getStoredToken();
    if (!token) return;
    setLoadingMessages(true);
    try {
      const data = await listMessages(token, patientId);
      setMessages(data);
      await markMessagesRead(token, patientId);
    } catch {
      setError("Não foi possível carregar as mensagens.");
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (selected) loadConversation(selected.id);
  }, [selected, loadConversation]);

  const handleSend = async (texto: string) => {
    const token = getStoredToken();
    if (!token || !selected) return;
    const msg = await sendMessageToPatient(token, selected.id, texto);
    setMessages((prev) => [...prev, msg]);
  };

  return (
    <DashboardLayout>
      <Box sx={{ px: { xs: 2, md: 4 }, py: 3, height: "calc(100vh - 72px)" }}>
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: 24, fontWeight: 900, color: "#111827" }}>Mensagens</Typography>
          <Typography sx={{ fontSize: 13, color: "#6b7280" }}>Converse com seus pacientes</Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box sx={{ display: "flex", gap: 2, height: "calc(100% - 64px)" }}>
          {/* Lista de pacientes */}
          <Paper elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 2, width: 280, overflowY: "auto", flexShrink: 0 }}>
            {loadingPatients ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <CircularProgress color="primary" size={28} />
              </Box>
            ) : patients.length === 0 ? (
              <Typography sx={{ color: "#9ca3af", fontSize: 13, textAlign: "center", py: 6, px: 2 }}>
                Você ainda não tem pacientes vinculados.
              </Typography>
            ) : (
              patients.map((p) => (
                <Box
                  key={p.id}
                  onClick={() => setSelected(p)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    px: 2,
                    py: 1.5,
                    cursor: "pointer",
                    bgcolor: selected?.id === p.id ? "#ecfdf5" : "transparent",
                    borderBottom: "1px solid #f3f4f6",
                    "&:hover": { bgcolor: selected?.id === p.id ? "#ecfdf5" : "#f9fafb" },
                  }}
                >
                  <Avatar sx={{ width: 36, height: 36, bgcolor: "#d1fae5", color: "primary.dark", fontSize: 13, fontWeight: 800 }}>
                    {getInitials(p.nome)}
                  </Avatar>
                  <Typography noWrap sx={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
                    {p.nome}
                  </Typography>
                </Box>
              ))
            )}
          </Paper>

          {/* Conversa */}
          <Paper elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 2, flex: 1 }}>
            {selected ? (
              <ConversationPanel
                messages={messages}
                loading={loadingMessages}
                currentRole="nutritionist"
                onSend={handleSend}
              />
            ) : (
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                <Typography sx={{ color: "#9ca3af", fontSize: 14 }}>
                  Selecione um paciente para ver a conversa.
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
    </DashboardLayout>
  );
}
