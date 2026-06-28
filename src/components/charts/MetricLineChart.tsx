"use client";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type ChartDataPoint = {
  date: string;      // ISO string
  value: number | null;
  label?: string;    // tooltip label extra (ex: classificação IMC)
};

export type ReferenceLineConfig = {
  y: number;
  label: string;
  color: string;
};

type MetricLineChartProps = {
  title: string;
  unit: string;
  data: ChartDataPoint[];
  color: string;
  referenceLines?: ReferenceLineConfig[];
  formatValue?: (v: number) => string;
  minY?: number;
  maxY?: number;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

function calcTrend(data: ChartDataPoint[]): {
  delta: number | null;
  pct: number | null;
} {
  const valid = data.filter((d) => d.value !== null);
  if (valid.length < 2) return { delta: null, pct: null };
  const first = valid[0].value!;
  const last = valid[valid.length - 1].value!;
  const delta = last - first;
  const pct = first !== 0 ? (delta / first) * 100 : 0;
  return { delta, pct };
}

// ─── Tooltip customizado ──────────────────────────────────────────────────────

function CustomTooltip({
  active,
  payload,
  unit,
  formatValue,
}: {
  active?: boolean;
  payload?: { payload: ChartDataPoint; value: number }[];
  unit: string;
  formatValue?: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  const val = payload[0].value;

  return (
    <Box
      sx={{
        bgcolor: "#111827",
        color: "#fff",
        px: 1.5,
        py: 1,
        borderRadius: 1,
        fontSize: 13,
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      }}
    >
      <Typography sx={{ fontSize: 11, color: "#9ca3af", mb: 0.3 }}>
        {new Date(point.date).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}
      </Typography>
      <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>
        {formatValue ? formatValue(val) : val} {unit}
      </Typography>
      {point.label && (
        <Typography sx={{ fontSize: 11, color: "#86efac", mt: 0.2 }}>
          {point.label}
        </Typography>
      )}
    </Box>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function MetricLineChart({
  title,
  unit,
  data,
  color,
  referenceLines,
  formatValue,
  minY,
  maxY,
}: MetricLineChartProps) {
  const { delta, pct } = calcTrend(data);
  const currentValue = [...data].reverse().find((d) => d.value !== null)?.value;
  const hasData = data.some((d) => d.value !== null);

  const trendColor =
    delta === null ? "#9ca3af" : delta < 0 ? "#10b981" : delta > 0 ? "#f97316" : "#9ca3af";

  const TrendIcon =
    delta === null ? Minus : delta < 0 ? TrendingDown : delta > 0 ? TrendingUp : Minus;

  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid #e5e7eb",
        borderRadius: 2,
        p: 2.5,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5 }}>
          {title}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.5, mt: 0.5 }}>
          <Typography sx={{ fontSize: 28, fontWeight: 850, color: "#111827", lineHeight: 1 }}>
            {currentValue != null
              ? formatValue
                ? formatValue(currentValue)
                : currentValue
              : "—"}
          </Typography>
          {currentValue != null && (
            <Typography sx={{ fontSize: 14, color: "#9ca3af" }}>{unit}</Typography>
          )}
          {pct !== null && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.4,
                ml: "auto",
                color: trendColor,
              }}
            >
              <TrendIcon size={15} />
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: trendColor }}>
                {pct > 0 ? "+" : ""}
                {pct.toFixed(1)}%
              </Typography>
            </Box>
          )}
        </Box>
        {delta !== null && (
          <Typography sx={{ fontSize: 12, color: "#9ca3af", mt: 0.3 }}>
            {delta > 0 ? "+" : ""}
            {delta.toFixed(1)} {unit} desde o início
          </Typography>
        )}
      </Box>

      {/* Chart */}
      {!hasData ? (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#d1d5db",
            fontSize: 13,
          }}
        >
          Sem dados suficientes
        </Box>
      ) : (
        <Box sx={{ flex: 1, minHeight: 140 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatDateShort}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[
                  minY ?? ((v: number) => Math.floor(v * 0.97)),
                  maxY ?? ((v: number) => Math.ceil(v * 1.03)),
                ]}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) =>
                  formatValue ? formatValue(v) : String(v)
                }
              />
              <Tooltip
                content={
                  <CustomTooltip unit={unit} formatValue={formatValue} />
                }
              />
              {referenceLines?.map((rl) => (
                <ReferenceLine
                  key={rl.y}
                  y={rl.y}
                  stroke={rl.color}
                  strokeDasharray="4 3"
                  label={{
                    value: rl.label,
                    fontSize: 10,
                    fill: rl.color,
                    position: "insideTopRight",
                  }}
                />
              ))}
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2.5}
                fill={`url(#grad-${title})`}
                dot={{ r: 4, fill: color, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: color, strokeWidth: 2, stroke: "#fff" }}
                connectNulls={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Paper>
  );
}
