import { Attendance } from "@/types/attendance";

export const exportTodayToCSV = (attendances: Attendance[]): void => {
  if (attendances.length === 0) {
    alert("Nenhum atendimento registrado hoje para exportar.");
    return;
  }

  // Cabeçalhos do CSV
  const headers = [
    "Data",
    "Hora",
    "Cliente/Setor",
    "Tipo de Atendimento",
    "Categoria",
    "Descrição do Problema",
    "Solução Aplicada",
    "Status",
    "Tempo Gasto (min)",
    "Observações",
  ];

  // Converter dados para linhas CSV
  const rows = attendances.map((a) => [
    a.date,
    a.time,
    a.client,
    a.type,
    a.category || "",
    `"${a.problem.replace(/"/g, '""')}"`, // Escapar aspas
    `"${a.solution.replace(/"/g, '""')}"`,
    a.status,
    a.timeSpent.toString(),
    a.observations ? `"${a.observations.replace(/"/g, '""')}"` : "",
  ]);

  // Montar conteúdo CSV
  const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");

  // Criar blob e fazer download
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  const today = new Date().toISOString().split("T")[0];
  const filename = `relatorio_tecnico_TheoStracke_${today}.csv`;

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
