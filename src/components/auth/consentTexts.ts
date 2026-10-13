import type { ConsentType } from "@/lib/consents";

/**
 * RASCUNHO. Textos em linguagem simples escritos para o desenvolvimento.
 * Devem ser substituídos por texto revisado juridicamente antes de abrir a
 * plataforma para mais pacientes. A versão que vale é a da API (`versaoAtual`).
 */
export const CONSENT_TEXTS: Record<
  ConsentType,
  { titulo: string; texto: string; obrigatorio: boolean }
> = {
  dados_saude: {
    titulo: "Meus dados de saúde",
    texto:
      "Autorizo o tratamento dos meus dados de saúde (medidas, plano alimentar, consultas e mensagens) pelo meu nutricionista e pelo NutriOne, para o meu acompanhamento nutricional.",
    obrigatorio: true,
  },
  monitoramento_atividade: {
    titulo: "Acompanhamento do uso do app",
    texto:
      "Permito que meu nutricionista veja quando uso o aplicativo (acessos, planos visualizados e mensagens enviadas, sem o conteúdo delas) para me acompanhar melhor. É opcional: o aplicativo funciona normalmente sem isso.",
    obrigatorio: false,
  },
};
