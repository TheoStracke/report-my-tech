import { Attendance } from "@/types/attendance";

// Função utilitária para converter hh:mm:ss para segundos
function parseTimeToSeconds(time: string | undefined): number {
  if (!time) return 0;
  const parts = time.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 1) return parts[0];
  return 0;
}

function formatSeconds(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export async function exportFullReportImage(attendances: Attendance[]): Promise<void> {
  if (!attendances || attendances.length === 0) {
    alert("Nenhum atendimento registrado para exportar.");
    return;
  }

  // Métricas principais
  const total = attendances.length;
  const semSolucao = attendances.filter(a => !a.solution || a.solution.trim() === "").length;
  const pendentes = attendances.filter(a => a.status === "Pendente");
  const causasSemSolucao: Record<string, number> = {};
  pendentes.forEach(a => {
    if (a.causeNoSolution) {
      causasSemSolucao[a.causeNoSolution] = (causasSemSolucao[a.causeNoSolution] || 0) + 1;
    }
  });
  const dificuldadesTheo = attendances.map(a => a.observations).filter(Boolean).join("; ");

  // Tempo médio de atendimento
  const tempos = attendances.map(a => a.timeSpent || 0);
  const tempoMedio = tempos.length ? Math.round(tempos.reduce((a, b) => a + b, 0) / tempos.length) : 0;

  // Tempo médio até primeira mensagem (em segundos)
  const temposPrimeiraMsg = attendances.map(a => parseTimeToSeconds(a.firstResponseMinutes as any));
  const mediaPrimeiraMsg = temposPrimeiraMsg.length ? Math.round(temposPrimeiraMsg.reduce((a, b) => a + b, 0) / temposPrimeiraMsg.length) : 0;

  // Gráfico de causas sem solução (top 5)
  const topCausas = Object.entries(causasSemSolucao).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Pizza por tipo
  const typeCount = attendances.reduce<Record<string, number>>((acc, a) => {
    acc[a.type] = (acc[a.type] || 0) + 1;
    return acc;
  }, {});
  const docCount = typeCount["Suporte Documental"] || 0;
  const techCount = typeCount["Suporte Técnico"] || 0;
  const totalCount = docCount + techCount;
  const docPercent = totalCount > 0 ? (docCount / totalCount) * 100 : 0;
  const techPercent = totalCount > 0 ? (techCount / totalCount) * 100 : 0;

  // SVG (resumido, pode ser expandido)
  const width = 1200;
  const height = 1600;
  const padding = 60;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect x="0" y="0" width="${width}" height="${height}" fill="#0f172a" />
    <text x="${padding}" y="80" fill="#60a5fa" font-size="36" font-weight="bold">Relatório Completo - Theo Stracke</text>
    <text x="${padding}" y="130" fill="#f1f5f9" font-size="24">Quantidade de Suportes: ${total}</text>
    <text x="${padding}" y="170" fill="#fbbf24" font-size="24">Quantidade de Suporte sem Solução: ${semSolucao}</text>
    <text x="${padding}" y="210" fill="#a3e635" font-size="24">Tempo Médio de Atendimento: ${tempoMedio} min</text>
    <text x="${padding}" y="250" fill="#38bdf8" font-size="24">Tempo Médio até Primeira Mensagem: ${formatSeconds(mediaPrimeiraMsg)}</text>
    <text x="${padding}" y="300" fill="#f472b6" font-size="22">Dificuldades do Theo:</text>
    <text x="${padding}" y="330" fill="#f9fafb" font-size="18">${dificuldadesTheo || "Nenhuma dificuldade registrada."}</text>
    <text x="${padding}" y="380" fill="#fbbf24" font-size="22">Causas dos Suportes sem Solução (Top 5):</text>
    ${topCausas.map(([causa, qtd], i) => `<text x="${padding + 20}" y="${420 + i * 30}" fill="#fde68a" font-size="18">${causa}: ${qtd}</text>`).join("")}
    <!-- Gráfico de pizza -->
    <g transform="translate(${padding + 200}, 600)">
      <text x="0" y="-130" fill="#94a3b8" font-size="18" font-weight="600" text-anchor="middle">Distribuição por Tipo</text>
      <circle cx="0" cy="0" r="100" fill="#1e293b" stroke="#334155" stroke-width="2" />
      ${totalCount > 0 ? `
        <path d="M 0 0 L 0 -100 A 100 100 0 ${techPercent > 50 ? 1 : 0} 1 ${100 * Math.sin((techPercent / 100) * 2 * Math.PI)} ${-100 * Math.cos((techPercent / 100) * 2 * Math.PI)} Z" fill="#3b82f6" stroke="#1e293b" stroke-width="2" />
        <path d="M 0 0 L ${100 * Math.sin((techPercent / 100) * 2 * Math.PI)} ${-100 * Math.cos((techPercent / 100) * 2 * Math.PI)} A 100 100 0 ${docPercent > 50 ? 1 : 0} 1 0 -100 Z" fill="#10b981" stroke="#1e293b" stroke-width="2" />
        <rect x="-140" y="120" width="16" height="16" rx="3" fill="#3b82f6" />
        <text x="-118" y="132" fill="#e5e7eb" font-size="14" font-weight="500">Suporte Técnico: ${techCount} (${techPercent.toFixed(0)}%)</text>
        <rect x="-140" y="145" width="16" height="16" rx="3" fill="#10b981" />
        <text x="-118" y="157" fill="#e5e7eb" font-size="14" font-weight="500">Suporte Documental: ${docCount} (${docPercent.toFixed(0)}%)</text>
      ` : ""}
    </g>
  </svg>`;

  // Converte SVG -> PNG e baixa
  const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);
  await new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not available"));
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error("Falha ao gerar imagem"));
        const a = document.createElement("a");
        const today = new Date().toISOString().split("T")[0];
        a.download = `relatorio_completo_${today}.png`;
        a.href = URL.createObjectURL(blob);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        resolve();
      }, "image/png");
    };
    img.onerror = () => reject(new Error("Erro ao carregar imagem"));
    img.src = url;
  });
}
