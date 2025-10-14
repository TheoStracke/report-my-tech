import { Attendance } from "@/types/attendance";

// Escapa caracteres especiais para XML/SVG
const escapeXml = (str: string) =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

// Quebra texto em múltiplas linhas de tamanho aproximado
const wrapText = (text: string, maxCharsPerLine = 60): string[] => {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    if ((current + (current ? " " : "") + w).length > maxCharsPerLine) {
      if (current) lines.push(current);
      current = w;
    } else {
      current = current ? current + " " + w : w;
    }
  }
  if (current) lines.push(current);
  return lines;
};

export const exportTodayToImage = async (attendances: Attendance[]): Promise<void> => {
  if (!attendances || attendances.length === 0) {
    alert("Nenhum atendimento registrado hoje para exportar.");
    return;
  }

  // Dimensões e estilo - layout compacto para resumo executivo
  const width = 1080;
  const height = 720; // fixo, apenas resumo
  const padding = 60;

  // Cálculos do resumo
  const totalCount = attendances.length;
  const totalMinutes = attendances.reduce((s, a) => s + (a.timeSpent || 0), 0);
  const avgMinutes = totalCount > 0 ? Math.round(totalMinutes / totalCount) : 0;
  const pendingCount = attendances.filter((a) => a.status === "Pendente").length;

  const today = new Date();
  const dateStr = today.toLocaleDateString("pt-BR", { 
    weekday: "long",
    day: "2-digit", 
    month: "long", 
    year: "numeric" 
  });

  // Resumo por tipo (top 3)
  const typeCount = attendances.reduce<Record<string, number>>((acc, a) => {
    acc[a.type] = (acc[a.type] || 0) + 1;
    return acc;
  }, {});
  const topTypes = Object.entries(typeCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0f172a" />
        <stop offset="100%" stop-color="#020617" />
      </linearGradient>
      <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#3b82f6" />
        <stop offset="100%" stop-color="#06b6d4" />
      </linearGradient>
    </defs>
    
    <!-- Fundo -->
    <rect x="0" y="0" width="${width}" height="${height}" fill="url(#bg)" />
    
    <!-- Barra superior com gradiente -->
    <rect x="0" y="0" width="${width}" height="8" fill="url(#accent)" />
    
    <!-- Cabeçalho -->
    <text x="${padding}" y="80" fill="#93c5fd" font-family="Segoe UI, Roboto, Arial, sans-serif" font-size="22" font-weight="600" letter-spacing="0.5">RELATÓRIO TÉCNICO</text>
    <text x="${padding}" y="130" fill="#f1f5f9" font-family="Segoe UI, Roboto, Arial, sans-serif" font-size="42" font-weight="800">Theo Stracke</text>
    <text x="${padding}" y="170" fill="#94a3b8" font-family="Segoe UI, Roboto, Arial, sans-serif" font-size="20" font-weight="400" text-transform="capitalize">${escapeXml(dateStr)}</text>
    
    <!-- Cards de métricas principais -->
    <!-- Card 1: Total de Atendimentos -->
    <rect x="${padding}" y="240" width="300" height="180" rx="16" fill="#1e293b" stroke="#334155" stroke-width="2" />
    <text x="${padding + 30}" y="290" fill="#60a5fa" font-family="Segoe UI, Roboto, Arial, sans-serif" font-size="18" font-weight="600">Total de Atendimentos</text>
    <text x="${padding + 30}" y="360" fill="#f1f5f9" font-family="Segoe UI, Roboto, Arial, sans-serif" font-size="64" font-weight="800">${totalCount}</text>
    
    <!-- Card 2: Pendências -->
    <rect x="${padding + 330}" y="240" width="300" height="180" rx="16" fill="#1e293b" stroke="#334155" stroke-width="2" />
    <text x="${padding + 360}" y="290" fill="#fbbf24" font-family="Segoe UI, Roboto, Arial, sans-serif" font-size="18" font-weight="600">Pendências</text>
    <text x="${padding + 360}" y="360" fill="#f1f5f9" font-family="Segoe UI, Roboto, Arial, sans-serif" font-size="64" font-weight="800">${pendingCount}</text>
    ${pendingCount > 0 ? `<text x="${padding + 360}" y="395" fill="#f59e0b" font-family="Segoe UI, Roboto, Arial, sans-serif" font-size="16" font-weight="500">Requer atenção</text>` : `<text x="${padding + 360}" y="395" fill="#10b981" font-family="Segoe UI, Roboto, Arial, sans-serif" font-size="16" font-weight="500">Tudo em dia ✓</text>`}
    
    <!-- Card 3: Tempo Médio -->
    <rect x="${padding + 660}" y="240" width="300" height="180" rx="16" fill="#1e293b" stroke="#334155" stroke-width="2" />
    <text x="${padding + 690}" y="290" fill="#a78bfa" font-family="Segoe UI, Roboto, Arial, sans-serif" font-size="18" font-weight="600">Tempo Médio</text>
    <text x="${padding + 690}" y="360" fill="#f1f5f9" font-family="Segoe UI, Roboto, Arial, sans-serif" font-size="64" font-weight="800">${avgMinutes}</text>
    <text x="${padding + 690}" y="395" fill="#c4b5fd" font-family="Segoe UI, Roboto, Arial, sans-serif" font-size="20" font-weight="500">minutos</text>
    
    <!-- Seção Tipos Mais Frequentes -->
    ${topTypes.length > 0 ? `
    <text x="${padding}" y="490" fill="#cbd5e1" font-family="Segoe UI, Roboto, Arial, sans-serif" font-size="20" font-weight="700">Tipos Mais Frequentes</text>
    <line x1="${padding}" y1="505" x2="${width - padding}" y2="505" stroke="#334155" stroke-width="1" />
    ${topTypes.map((([type, count], idx) => `
      <rect x="${padding}" y="${530 + idx * 50}" width="${(count / totalCount) * 800}" height="36" rx="6" fill="#1e40af" opacity="0.6" />
      <text x="${padding + 20}" y="${555 + idx * 50}" fill="#dbeafe" font-family="Segoe UI, Roboto, Arial, sans-serif" font-size="18" font-weight="600">${escapeXml(type)}</text>
      <text x="${padding + (count / totalCount) * 800 + 20}" y="${555 + idx * 50}" fill="#93c5fd" font-family="Segoe UI, Roboto, Arial, sans-serif" font-size="18" font-weight="600">${count}</text>
    `)).join("\n")}
    ` : ""}
    
    <!-- Rodapé -->
    <text x="${width / 2}" y="${height - 30}" fill="#475569" font-family="Segoe UI, Roboto, Arial, sans-serif" font-size="14" font-weight="400" text-anchor="middle">Gerado automaticamente • Sistema de Relatórios Técnicos</text>
  </svg>`;

  // Converte SVG -> PNG (hi-dpi) e baixa arquivo
  const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  await new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = 2; // nitidez
      const canvas = document.createElement("canvas");
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Falha ao gerar imagem"));
          return;
        }
        const link = document.createElement("a");
        const today = new Date().toISOString().split("T")[0];
        link.download = `relatorio_tecnico_TheoStracke_${today}.png`;
        link.href = URL.createObjectURL(blob);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        resolve();
      }, "image/png");
    };
    img.onerror = (e) => reject(new Error("Falha ao carregar SVG na imagem"));
    img.src = url;
  });
};
