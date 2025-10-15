export type AttendanceStatus = "Resolvido" | "Pendente" | "Encaminhado";
export type AttendanceType = "Suporte Documental" | "Suporte Técnico";

export interface Attendance {
  id: string;
  date: string;
  time: string;
  client: string;
  type: AttendanceType;
  category?: string; // categoria específica do suporte (dinâmica)
  problem: string;
  solution: string;
  status: AttendanceStatus;
  timeSpent: number; // em minutos - não usado para Pendente
  firstResponseMinutes?: number; // em minutos - apenas para Pendente
  causeNoSolution?: string; // motivo/causa quando Pendente
  observations?: string;
}
