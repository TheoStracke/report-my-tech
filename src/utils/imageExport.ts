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

  // Dimensões e estilo
  const width = 1080; // px
  const padding = 48;
  const contentWidth = width - padding * 2;
  const headerHeight = 180;
  const lineHeight = 28;
  const sectionSpacing = 12;
  const cardSpacing = 20;

  // Totais e resumo de status
  const totalCount = attendances.length;
  const totalMinutes = attendances.reduce((s, a) => s + (a.timeSpent || 0), 0);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const statusCount = attendances.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});
  const statusSummary = Object.entries(statusCount)
    .map(([k, v]) => `${k}: ${v}`)
    .join(" • ");

  // Calcula altura necessária
  const itemHeights = attendances.map((a) => {
    const prob = wrapText(a.problem, 70).length;
    const sol = wrapText(a.solution, 70).length;
    const obs = a.observations ? wrapText(a.observations, 70).length : 0;
    const lines = 3 /* título/linha superior */ + prob + sol + (obs ? obs + 1 /* label obs */ : 0) + 4; // respiros
    return 24 + lines * lineHeight + sectionSpacing * 2;
  });
  const itemsHeight = itemHeights.reduce((s, h) => s + h, 0) + (attendances.length - 1) * cardSpacing;
  const height = headerHeight + itemsHeight + padding;

  // Monta SVG
  let y = padding + 24; // cursor vertical
  const today = new Date();
  const dateStr = today.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

  const parts: string[] = [];
  // Header
  parts.push(`
    <rect x="0" y="0" width="${width}" height="${headerHeight}" fill="#0f172a" />
    <text x="${padding}" y="${padding}" fill="#93c5fd" font-family="Segoe UI, Roboto, Arial" font-size="20" font-weight="600">Relatório Técnico - Theo Stracke</text>
    <text x="${padding}" y="${padding + 36}" fill="#e2e8f0" font-family="Segoe UI, Roboto, Arial" font-size="30" font-weight="800">Atendimentos do dia ${escapeXml(dateStr)}</text>
    <text x="${padding}" y="${padding + 72}" fill="#cbd5e1" font-family="Segoe UI, Roboto, Arial" font-size="18">Total: ${totalCount} • Tempo total: ${hours}h ${minutes}min</text>
    ${statusSummary ? `<text x="${padding}" y="${padding + 100}" fill="#94a3b8" font-family="Segoe UI, Roboto, Arial" font-size="16">${escapeXml(statusSummary)}</text>` : ""}
  `);

  y = headerHeight + 0;

  attendances.forEach((a, idx) => {
    const blockHeight = itemHeights[idx];
    // Card
    parts.push(`
      <rect x="${padding - 8}" y="${y}" width="${contentWidth + 16}" height="${blockHeight}" rx="12" fill="#0b1220" stroke="#1e293b" stroke-width="1" />
    `);

    let innerY = y + sectionSpacing + 10;
    const left = padding + 8;

    // Linha superior: hora • tempo | cliente
    parts.push(`
      <text x="${left}" y="${innerY}" fill="#93c5fd" font-family="Segoe UI, Roboto, Arial" font-size="18" font-weight="600">${escapeXml(a.time)} • ${a.timeSpent} min</text>
    `);
    parts.push(`
      <text x="${left + 280}" y="${innerY}" fill="#e5e7eb" font-family="Segoe UI, Roboto, Arial" font-size="18" font-weight="700">${escapeXml(a.client)}</text>
    `);
    innerY += lineHeight + 4;

    // Badges simples: status e tipo
    parts.push(`
      <rect x="${left}" y="${innerY - 20}" rx="6" width="120" height="26" fill="#064e3b" />
      <text x="${left + 10}" y="${innerY}" fill="#d1fae5" font-family="Segoe UI, Roboto, Arial" font-size="14" font-weight="600">${escapeXml(a.status)}</text>
      <rect x="${left + 130}" y="${innerY - 20}" rx="6" width="170" height="26" fill="#1e3a8a" />
      <text x="${left + 140}" y="${innerY}" fill="#dbeafe" font-family="Segoe UI, Roboto, Arial" font-size="14" font-weight="600">${escapeXml(a.type)}</text>
    `);
    innerY += lineHeight + 6;

    // Problema
    parts.push(`<text x="${left}" y="${innerY}" fill="#a3a3a3" font-family="Segoe UI, Roboto, Arial" font-size="14" font-weight="700">Problema:</text>`);
    innerY += lineHeight - 8;
    wrapText(a.problem, 90).forEach((line) => {
      parts.push(`<text x="${left}" y="${innerY}" fill="#e5e7eb" font-family="Segoe UI, Roboto, Arial" font-size="16">${escapeXml(line)}</text>`);
      innerY += lineHeight;
    });

    // Solução
    parts.push(`<text x="${left}" y="${innerY}" fill="#a3a3a3" font-family="Segoe UI, Roboto, Arial" font-size="14" font-weight="700">Solução:</text>`);
    innerY += lineHeight - 8;
    wrapText(a.solution, 90).forEach((line) => {
      parts.push(`<text x="${left}" y="${innerY}" fill="#e5e7eb" font-family="Segoe UI, Roboto, Arial" font-size="16">${escapeXml(line)}</text>`);
      innerY += lineHeight;
    });

    // Observações (opcional)
    if (a.observations) {
      parts.push(`<text x="${left}" y="${innerY}" fill="#a3a3a3" font-family="Segoe UI, Roboto, Arial" font-size="14" font-weight="700">Obs:</text>`);
      innerY += lineHeight - 8;
      wrapText(a.observations, 90).forEach((line) => {
        parts.push(`<text x="${left}" y="${innerY}" fill="#e5e7eb" font-family="Segoe UI, Roboto, Arial" font-size="16">${escapeXml(line)}</text>`);
        innerY += lineHeight;
      });
    }

    y += blockHeight + cardSpacing;
  });

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#020617" />
        <stop offset="100%" stop-color="#0b1220" />
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="${width}" height="${height}" fill="url(#bg)" />
    ${parts.join("\n")}
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
