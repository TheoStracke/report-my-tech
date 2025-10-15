// Tipos de erros comuns no suporte
export const SUPPORT_ERRORS = [
  "Dúvida atualização GEDAR",
  "ACI",
  "Dúvida sistema HOPE",
  "Dúvida sistema GEDAR",
  "Dúvida sistema Assinador",
  "Erro sistema HOPE",
  "Erro sistema GEDAR",
  "Erro sistema Assinador",
  "Erro importação de documentos sendo feita incorretamente",
  "Atualização conformidade",
  "Erro plugin assinatura",
  "Atualização de senha",
  "Adequação",
  "Desadequação",
  "Novo login",
"Outro"
] as const;

export type SupportError = typeof SUPPORT_ERRORS[number];
