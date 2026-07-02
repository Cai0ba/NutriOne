import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "NutriOne — Plataforma para Nutricionistas e Pacientes";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
          fontFamily: "system-ui, sans-serif",
          padding: "60px",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "32px" }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: "#10b981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="44" height="44" viewBox="0 0 32 32" fill="none">
              <path
                d="M16 6C16 6 8 10 8 18c0 4.4 3.6 8 8 8s8-3.6 8-8C24 10 16 6 16 6z"
                fill="white"
              />
              <line x1="16" y1="26" x2="16" y2="14" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M16 20 Q19 17 22 15" stroke="#10b981" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M16 17 Q13 15 11 13" stroke="#10b981" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>
          <span style={{ fontSize: 52, fontWeight: 900, color: "#10b981" }}>NutriOne</span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 38,
            fontWeight: 700,
            color: "#111827",
            textAlign: "center",
            lineHeight: 1.3,
            marginBottom: "20px",
            maxWidth: 800,
          }}
        >
          Plataforma completa para nutricionistas e pacientes
        </div>

        {/* Subtítulo */}
        <div
          style={{
            fontSize: 22,
            color: "#6b7280",
            textAlign: "center",
            maxWidth: 700,
            lineHeight: 1.5,
            marginBottom: "40px",
          }}
        >
          Planos alimentares · Avaliações físicas · Consultas · Mensagens
        </div>

        {/* Pills */}
        <div style={{ display: "flex", gap: "12px" }}>
          {["Gratuito para começar", "Sem cartão de crédito"].map((text) => (
            <div
              key={text}
              style={{
                background: "#10b981",
                color: "white",
                borderRadius: 999,
                padding: "10px 24px",
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              {text}
            </div>
          ))}
        </div>

        {/* URL */}
        <div style={{ position: "absolute", bottom: 36, fontSize: 18, color: "#9ca3af" }}>
          nutrioneapp.com.br
        </div>
      </div>
    ),
    size,
  );
}
