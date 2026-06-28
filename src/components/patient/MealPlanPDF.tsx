/**
 * Documento PDF do plano alimentar — gerado client-side via @react-pdf/renderer.
 * Importar apenas via dynamic() com ssr: false.
 */
import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { MealPlanDetail, MealPlanStatus } from "@/lib/diet";

// ─── Estilos ──────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<MealPlanStatus, string> = {
  ativo:    "Ativo",
  rascunho: "Rascunho",
  inativo:  "Inativo",
};

const STATUS_COLOR: Record<MealPlanStatus, string> = {
  ativo:    "#065f46",
  rascunho: "#92400e",
  inativo:  "#374151",
};

const STATUS_BG: Record<MealPlanStatus, string> = {
  ativo:    "#d1fae5",
  rascunho: "#fef3c7",
  inativo:  "#f3f4f6",
};

const s = StyleSheet.create({
  page: {
    fontFamily:   "Helvetica",
    fontSize:     10,
    color:        "#111827",
    paddingTop:   40,
    paddingBottom:50,
    paddingHorizontal: 44,
    backgroundColor: "#ffffff",
  },

  // ── Header ──
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 24,
    paddingBottom: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: "#10b981",
  },
  brand: {
    fontSize:   22,
    fontFamily: "Helvetica-Bold",
    color:      "#10b981",
  },
  headerRight: {
    fontSize:  9,
    color:     "#9ca3af",
    textAlign: "right",
  },

  // ── Título do plano ──
  planTitle: {
    fontSize:     18,
    fontFamily:   "Helvetica-Bold",
    color:        "#111827",
    marginBottom: 6,
  },
  metaRow: {
    flexDirection:  "row",
    alignItems:     "center",
    gap:            12,
    marginBottom:   14,
    flexWrap:       "wrap",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderRadius:      4,
    fontSize:          9,
    fontFamily:        "Helvetica-Bold",
  },
  metaText: {
    fontSize: 9,
    color:    "#6b7280",
  },

  // ── Observações ──
  obsBox: {
    backgroundColor: "#fffbeb",
    borderLeftWidth: 3,
    borderLeftColor: "#f59e0b",
    paddingHorizontal: 10,
    paddingVertical:   8,
    marginBottom: 18,
    borderRadius: 2,
  },
  obsLabel: {
    fontSize:   8,
    fontFamily: "Helvetica-Bold",
    color:      "#92400e",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  obsText: {
    fontSize: 9,
    color:    "#78350f",
    lineHeight: 1.5,
  },

  // ── Refeição ──
  mealBlock: {
    marginBottom: 16,
    borderWidth:  1,
    borderColor:  "#e5e7eb",
    borderRadius: 4,
    overflow:     "hidden",
  },
  mealHeader: {
    flexDirection:   "row",
    alignItems:      "center",
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 10,
    paddingVertical:   7,
    gap:             10,
    borderBottomWidth: 1,
    borderBottomColor: "#d1fae5",
  },
  mealTime: {
    fontSize:   10,
    fontFamily: "Helvetica-Bold",
    color:      "#065f46",
    minWidth:   38,
  },
  mealName: {
    fontSize:   11,
    fontFamily: "Helvetica-Bold",
    color:      "#111827",
    flex:       1,
  },
  mealItemCount: {
    fontSize: 8,
    color:    "#9ca3af",
  },

  // ── Tabela de itens ──
  tableHeader: {
    flexDirection:   "row",
    backgroundColor: "#f9fafb",
    paddingHorizontal: 10,
    paddingVertical:   5,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  tableRow: {
    flexDirection:     "row",
    paddingHorizontal: 10,
    paddingVertical:   6,
    borderBottomWidth: 1,
    borderBottomColor: "#f9fafb",
  },
  tableRowAlt: {
    backgroundColor: "#fafafa",
  },
  colAlimento:   { flex: 2.5, paddingRight: 6 },
  colQtd:        { width: 60,  paddingRight: 6 },
  colUnidade:    { width: 80,  paddingRight: 6 },
  colObs:        { flex: 2,    color: "#6b7280" },
  thText: {
    fontSize:   8,
    fontFamily: "Helvetica-Bold",
    color:      "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  tdText: {
    fontSize:   9,
    color:      "#374151",
    lineHeight: 1.4,
  },
  tdAlimento: {
    fontSize:   9,
    fontFamily: "Helvetica-Bold",
    color:      "#111827",
    lineHeight: 1.4,
  },

  // ── Vazio ──
  emptyRow: {
    paddingHorizontal: 10,
    paddingVertical:   8,
  },
  emptyText: {
    fontSize: 9,
    color:    "#9ca3af",
    fontStyle: "italic",
  },

  // ── Footer ──
  footer: {
    position: "absolute",
    bottom:   24,
    left:     44,
    right:    44,
    flexDirection:  "row",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: "#e5e7eb",
    paddingTop:     8,
  },
  footerText: {
    fontSize: 8,
    color:    "#9ca3af",
  },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso?: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("pt-BR");
}

function todayStr() {
  return new Date().toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

// ─── Componente PDF ───────────────────────────────────────────────────────────

export function MealPlanPDF({
  plan,
  patientName,
}: {
  plan: MealPlanDetail;
  patientName?: string;
}) {
  const meals = [...plan.refeicoes].sort((a, b) =>
    a.horario.localeCompare(b.horario),
  );

  const statusColor = STATUS_COLOR[plan.status];
  const statusBg    = STATUS_BG[plan.status];
  const statusLabel = STATUS_LABEL[plan.status];

  const inicio = fmtDate(plan.dataInicio);
  const fim    = fmtDate(plan.dataFim);

  return (
    <Document
      title={plan.nome}
      author="NutriOne"
      subject="Plano Alimentar"
    >
      <Page size="A4" style={s.page}>
        {/* ── Header ── */}
        <View style={s.header}>
          <Text style={s.brand}>NutriOne</Text>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={s.headerRight}>Plano Alimentar</Text>
            {patientName && (
              <Text style={[s.headerRight, { fontFamily: "Helvetica-Bold", color: "#374151" }]}>
                {patientName}
              </Text>
            )}
          </View>
        </View>

        {/* ── Título do plano ── */}
        <Text style={s.planTitle}>{plan.nome}</Text>

        <View style={s.metaRow}>
          {/* Status badge */}
          <View style={[s.statusBadge, { backgroundColor: statusBg }]}>
            <Text style={{ color: statusColor, fontSize: 9, fontFamily: "Helvetica-Bold" }}>
              {statusLabel}
            </Text>
          </View>

          {(inicio || fim) && (
            <Text style={s.metaText}>
              {inicio ?? "—"}  →  {fim ?? "—"}
            </Text>
          )}

          <Text style={s.metaText}>
            {meals.length} refeição{meals.length !== 1 ? "ões" : ""}
          </Text>
        </View>

        {/* ── Observações ── */}
        {plan.observacoes && (
          <View style={s.obsBox}>
            <Text style={s.obsLabel}>Observações</Text>
            <Text style={s.obsText}>{plan.observacoes}</Text>
          </View>
        )}

        {/* ── Refeições ── */}
        {meals.length === 0 ? (
          <View style={s.emptyRow}>
            <Text style={s.emptyText}>Nenhuma refeição adicionada neste plano.</Text>
          </View>
        ) : (
          meals.map((meal) => (
            <View key={meal._id} style={s.mealBlock} wrap={false}>
              {/* Header da refeição */}
              <View style={s.mealHeader}>
                <Text style={s.mealTime}>{meal.horario}</Text>
                <Text style={s.mealName}>{meal.nome}</Text>
                <Text style={s.mealItemCount}>
                  {meal.itens.length} item{meal.itens.length !== 1 ? "s" : ""}
                </Text>
              </View>

              {meal.itens.length === 0 ? (
                <View style={s.emptyRow}>
                  <Text style={s.emptyText}>Nenhum alimento adicionado.</Text>
                </View>
              ) : (
                <>
                  {/* Cabeçalho da tabela */}
                  <View style={s.tableHeader}>
                    <View style={s.colAlimento}><Text style={s.thText}>Alimento</Text></View>
                    <View style={s.colQtd}>    <Text style={s.thText}>Qtd.</Text></View>
                    <View style={s.colUnidade}><Text style={s.thText}>Unidade</Text></View>
                    <View style={s.colObs}>    <Text style={s.thText}>Observação</Text></View>
                  </View>

                  {/* Linhas */}
                  {meal.itens.map((item, idx) => (
                    <View
                      key={item._id}
                      style={[s.tableRow, idx % 2 === 1 ? s.tableRowAlt : {}]}
                    >
                      <View style={s.colAlimento}>
                        <Text style={s.tdAlimento}>{item.alimento}</Text>
                      </View>
                      <View style={s.colQtd}>
                        <Text style={s.tdText}>{item.quantidade}</Text>
                      </View>
                      <View style={s.colUnidade}>
                        <Text style={s.tdText}>{item.unidade}</Text>
                      </View>
                      <View style={s.colObs}>
                        <Text style={[s.tdText, { color: "#6b7280" }]}>
                          {item.observacao || "—"}
                        </Text>
                      </View>
                    </View>
                  ))}
                </>
              )}
            </View>
          ))
        )}

        {/* ── Footer ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>NutriOne · Plano Alimentar</Text>
          <Text style={s.footerText}>Gerado em {todayStr()}</Text>
        </View>

        {/* Número de página */}
        <Text
          style={[s.footerText, { position: "absolute", bottom: 10, right: 44, fontSize: 7 }]}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
}
