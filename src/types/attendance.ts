export type AttendanceStatus = "Resolvido" | "Pendente" | "Encaminhado";
export type AttendanceType = "Presencial" | "Remoto" | "Telefone";

export interface Attendance {
  id: string;
  date: string;
  time: string;
  client: string;
  type: AttendanceType;
  problem: string;
  solution: string;
  status: AttendanceStatus;
  timeSpent: number; // em minutos
  observations?: string;
}
