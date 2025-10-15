// Tipos de erros comuns no suporte
export const SUPPORT_ERRORS = [
  "Erro de Login/Acesso",
  "Erro de Conexão",
  "Erro de Sistema/Aplicação",
  "Erro de Configuração",
  "Erro de Permissão",
  "Erro de Integração",
  "Erro de Banco de Dados",
  "Erro de Impressão",
  "Problema de Performance",
  "Problema de Hardware",
  "Outros"
] as const;

export type SupportError = typeof SUPPORT_ERRORS[number];
