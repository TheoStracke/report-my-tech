import { Attendance } from "@/types/attendance";

// Função para formatar minutos em tempo legível
function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}min`;
}

export async function exportFullReportImage(attendances: Attendance[]): Promise<void> {
  if (!attendances || attendances.length === 0) {
    alert("Nenhum atendimento registrado para exportar.");
    return;
  }

  // 1. Quantidade de suportes
  const totalSuportes = attendances.length;

  // 2. Quantidade de suporte sem solução (Pendentes)
  const suportesSemSolucao = attendances.filter(a => a.status === "Pendente").length;

  // 3. Causas do suporte sem solução
  const causasSemSolucao: Record<string, number> = {};
  attendances.filter(a => a.status === "Pendente" && a.causeNoSolution).forEach(a => {
    const causa = a.causeNoSolution!;
    causasSemSolucao[causa] = (causasSemSolucao[causa] || 0) + 1;
  });
  const causasOrdenadas = Object.entries(causasSemSolucao)
    .sort((a, b) => b[1] - a[1]);

  // 4. Dificuldades do Theo (observações)
  const dificuldades = attendances
    .filter(a => a.observations && a.observations.trim())
    .map(a => a.observations!.trim());

  // 5. Top 3 despachantes que mais chamaram
  const despachanteCount: Record<string, number> = {};
  attendances.forEach(a => {
    despachanteCount[a.category] = (despachanteCount[a.category] || 0) + 1;
  });
  const top3Despachantes = Object.entries(despachanteCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // 6. Top 3 erros com mais ocorrência
  const errorCount: Record<string, number> = {};
  attendances.forEach(a => {
    if (a.errorType) {
      errorCount[a.errorType] = (errorCount[a.errorType] || 0) + 1;
    }
  });
  const top3Erros = Object.entries(errorCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // 7. Comparativo de suporte documental e técnico
  const typeCount = attendances.reduce<Record<string, number>>((acc, a) => {
    acc[a.type] = (acc[a.type] || 0) + 1;
    return acc;
  }, {});
  const docCount = typeCount["Suporte Documental"] || 0;
  const techCount = typeCount["Suporte Técnico"] || 0;
  const totalCount = docCount + techCount;
  const docPercent = totalCount > 0 ? (docCount / totalCount) * 100 : 0;
  const techPercent = totalCount > 0 ? (techCount / totalCount) * 100 : 0;

  // 8. Tempo médio até a primeira interação
  const atendimentosComResposta = attendances.filter(a => a.firstResponseMinutes && a.firstResponseMinutes > 0);
  const tempoMedioPrimeiraInteracao = atendimentosComResposta.length
    ? Math.round(atendimentosComResposta.reduce((sum, a) => sum + (a.firstResponseMinutes || 0), 0) / atendimentosComResposta.length)
    : 0;

  // 9. Tempo médio de atendimento total
  const atendimentosComTempo = attendances.filter(a => a.timeSpent > 0);
  const tempoMedioTotal = atendimentosComTempo.length 
    ? Math.round(atendimentosComTempo.reduce((sum, a) => sum + a.timeSpent, 0) / atendimentosComTempo.length)
    : 0;

  // Cálculo de ângulos para gráfico de pizza
  const pieRadius = 100;
  const techAngle = (techPercent / 100) * 360;
  const techRadians = (techAngle * Math.PI) / 180;
  const techX = pieRadius * Math.sin(techRadians);
  const techY = -pieRadius * Math.cos(techRadians);
  const largeArcTech = techPercent > 50 ? 1 : 0;
  const largeArcDoc = docPercent > 50 ? 1 : 0;

  // Dimensões e configurações
  const width = 1200;
  const height = 1600;
  const padding = 50;
  const today = new Date().toLocaleDateString('pt-BR');

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1e293b;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000" flood-opacity="0.3" />
    </filter>
  </defs>
  
  <rect x="0" y="0" width="${width}" height="${height}" fill="url(#bgGradient)" />
  
  <!-- Header -->
  <text x="${width / 2}" y="60" fill="#60a5fa" font-size="40" font-weight="bold" text-anchor="middle">📊 Relatório de Suporte</text>
  <text x="${width / 2}" y="95" fill="#cbd5e1" font-size="18" text-anchor="middle">${today} - Theo Stracke</text>
  
  <!-- Seção 1: Quantidade de Suportes -->
  <g transform="translate(${padding}, 130)">
    <rect x="0" y="0" width="500" height="110" rx="12" fill="#1e3a8a" opacity="0.3" filter="url(#shadow)" />
    <rect x="0" y="0" width="500" height="110" rx="12" fill="none" stroke="#3b82f6" stroke-width="2" />
    <text x="250" y="35" fill="#93c5fd" font-size="16" text-anchor="middle" font-weight="600">QUANTIDADE DE SUPORTES</text>
    <text x="250" y="75" fill="#dbeafe" font-size="48" font-weight="bold" text-anchor="middle">${totalSuportes}</text>
  </g>
  
  <!-- Seção 2: Suportes Sem Solução -->
  <g transform="translate(${padding + 530}, 130)">
    <rect x="0" y="0" width="500" height="110" rx="12" fill="#854d0e" opacity="0.3" filter="url(#shadow)" />
    <rect x="0" y="0" width="500" height="110" rx="12" fill="none" stroke="#fbbf24" stroke-width="2" />
    <text x="250" y="35" fill="#fde047" font-size="16" text-anchor="middle" font-weight="600">SUPORTES SEM SOLUÇÃO</text>
    <text x="250" y="75" fill="#fef3c7" font-size="48" font-weight="bold" text-anchor="middle">${suportesSemSolucao}</text>
  </g>
  
  <!-- Seção 3: Causas de Suporte Sem Solução -->
  ${causasOrdenadas.length > 0 ? `
  <g transform="translate(${padding}, 270)">
    <text x="0" y="0" fill="#fbbf24" font-size="22" font-weight="bold">⚠️ Causas de Suporte Sem Solução</text>
    <rect x="0" y="15" width="1100" height="${causasOrdenadas.length * 42 + 30}" rx="10" fill="#1e293b" stroke="#475569" stroke-width="1.5" filter="url(#shadow)" />
    ${causasOrdenadas.map(([causa, qtd], i) => {
      const causaTruncada = causa.length > 70 ? causa.substring(0, 70) + '...' : causa;
      return `
        <text x="20" y="${50 + i * 42}" fill="#fde68a" font-size="16">${i + 1}. ${causaTruncada}</text>
        <text x="1070" y="${50 + i * 42}" fill="#fbbf24" font-size="18" font-weight="bold" text-anchor="end">${qtd}x</text>
      `;
    }).join('')}
  </g>
  ` : ''}
  
  <!-- Seção 4: Dificuldades do Theo -->
  ${dificuldades.length > 0 ? `
  <g transform="translate(${padding}, ${270 + (causasOrdenadas.length > 0 ? causasOrdenadas.length * 42 + 75 : 0)})">
    <text x="0" y="0" fill="#f472b6" font-size="22" font-weight="bold">💭 Dificuldades Encontradas</text>
    <rect x="0" y="15" width="1100" height="${Math.min(dificuldades.length, 5) * 38 + 30}" rx="10" fill="#1e293b" stroke="#475569" stroke-width="1.5" filter="url(#shadow)" />
    ${dificuldades.slice(0, 5).map((dif, i) => {
      const difTruncada = dif.length > 95 ? dif.substring(0, 95) + '...' : dif;
      return `<text x="20" y="${50 + i * 38}" fill="#f9a8d4" font-size="15">• ${difTruncada}</text>`;
    }).join('')}
  </g>
  ` : ''}
  
  <!-- Seção 5: Top 3 Despachantes -->
  <g transform="translate(${padding}, ${270 + (causasOrdenadas.length > 0 ? causasOrdenadas.length * 42 + 75 : 0) + (dificuldades.length > 0 ? Math.min(dificuldades.length, 5) * 38 + 75 : 0)})">
    <text x="0" y="0" fill="#60a5fa" font-size="22" font-weight="bold">👥 Top 3 Despachantes</text>
    <rect x="0" y="15" width="530" height="${top3Despachantes.length * 55 + 25}" rx="10" fill="#1e293b" stroke="#475569" stroke-width="1.5" filter="url(#shadow)" />
    ${top3Despachantes.map(([despachante, qtd], i) => {
      const maxQtd = Math.max(...top3Despachantes.map(d => d[1]));
      const barWidth = (qtd / maxQtd) * 400;
      const despTruncado = despachante.length > 28 ? despachante.substring(0, 28) + '...' : despachante;
      return `
        <text x="20" y="${48 + i * 55}" fill="#e2e8f0" font-size="16" font-weight="500">${i + 1}. ${despTruncado}</text>
        <rect x="20" y="${53 + i * 55}" width="${barWidth}" height="28" rx="5" fill="#3b82f6" opacity="0.85" />
        <text x="${barWidth + 30}" y="${72 + i * 55}" fill="#60a5fa" font-size="18" font-weight="bold">${qtd}</text>
      `;
    }).join('')}
  </g>
  
  <!-- Seção 6: Top 3 Erros -->
  <g transform="translate(${padding + 570}, ${270 + (causasOrdenadas.length > 0 ? causasOrdenadas.length * 42 + 75 : 0) + (dificuldades.length > 0 ? Math.min(dificuldades.length, 5) * 38 + 75 : 0)})">
    <text x="0" y="0" fill="#ef4444" font-size="22" font-weight="bold">🐛 Top 3 Erros</text>
    <rect x="0" y="15" width="530" height="${Math.max(top3Erros.length * 55 + 25, 90)}" rx="10" fill="#1e293b" stroke="#475569" stroke-width="1.5" filter="url(#shadow)" />
    ${top3Erros.length > 0 ? top3Erros.map(([erro, qtd], i) => {
      const maxQtd = Math.max(...top3Erros.map(e => e[1]));
      const barWidth = (qtd / maxQtd) * 400;
      const erroTruncado = erro.length > 28 ? erro.substring(0, 28) + '...' : erro;
      return `
        <text x="20" y="${48 + i * 55}" fill="#e2e8f0" font-size="16" font-weight="500">${i + 1}. ${erroTruncado}</text>
        <rect x="20" y="${53 + i * 55}" width="${barWidth}" height="28" rx="5" fill="#ef4444" opacity="0.85" />
        <text x="${barWidth + 30}" y="${72 + i * 55}" fill="#fca5a5" font-size="18" font-weight="bold">${qtd}</text>
      `;
    }).join('') : `<text x="20" y="50" fill="#94a3b8" font-size="15">Nenhum erro categorizado</text>`}
  </g>
  
  <!-- Seção 7: Comparativo Documental vs Técnico -->
  <g transform="translate(${width / 2}, ${270 + (causasOrdenadas.length > 0 ? causasOrdenadas.length * 42 + 75 : 0) + (dificuldades.length > 0 ? Math.min(dificuldades.length, 5) * 38 + 75 : 0) + Math.max(top3Despachantes.length, top3Erros.length) * 55 + 90})">
    <text x="0" y="-150" fill="#10b981" font-size="22" font-weight="bold" text-anchor="middle">📈 Comparativo de Suporte</text>
    <circle cx="0" cy="0" r="120" fill="#1e293b" stroke="#334155" stroke-width="3" />
    ${totalCount === 0
      ? `<text x="0" y="10" fill="#94a3b8" font-size="16" text-anchor="middle">Sem dados</text>`
      : (techCount === 0 || docCount === 0)
        ? `
          <circle cx="0" cy="0" r="${pieRadius}" fill="${techCount > 0 ? '#3b82f6' : '#10b981'}" />
          <text x="0" y="10" fill="#fff" font-size="20" font-weight="bold" text-anchor="middle">
            ${techCount > 0 ? 'Técnico 100%' : 'Documental 100%'}
          </text>
        `
        : `
          <path d="M 0 0 L 0 -${pieRadius} A ${pieRadius} ${pieRadius} 0 ${largeArcTech} 1 ${techX} ${techY} Z" fill="#3b82f6" stroke="#1e293b" stroke-width="2" />
          <path d="M 0 0 L ${techX} ${techY} A ${pieRadius} ${pieRadius} 0 ${largeArcDoc} 1 0 -${pieRadius} Z" fill="#10b981" stroke="#1e293b" stroke-width="2" />
        `
    }
    <g transform="translate(0, 150)">
      ${techCount > 0
        ? `
          <rect x="-120" y="0" width="24" height="24" rx="4" fill="#3b82f6" />
          <text x="-90" y="18" fill="#e5e7eb" font-size="16" font-weight="500" text-anchor="start">
            Suporte Técnico: ${techCount} (${techPercent.toFixed(1)}%)
          </text>
        ` : ''}
      ${docCount > 0
        ? `
          <rect x="-120" y="32" width="24" height="24" rx="4" fill="#10b981" />
          <text x="-90" y="50" fill="#e5e7eb" font-size="16" font-weight="500" text-anchor="start">
            Suporte Documental: ${docCount} (${docPercent.toFixed(1)}%)
          </text>
        ` : ''}
    </g>
  </g>
  
  <!-- Seção 8 e 9: Tempos Médios -->
  <g transform="translate(${padding}, ${270 + (causasOrdenadas.length > 0 ? causasOrdenadas.length * 42 + 75 : 0) + (dificuldades.length > 0 ? Math.min(dificuldades.length, 5) * 38 + 75 : 0) + Math.max(top3Despachantes.length, top3Erros.length) * 55 + 390})">
    <rect x="0" y="0" width="530" height="95" rx="12" fill="#4c1d95" opacity="0.3" filter="url(#shadow)" />
    <rect x="0" y="0" width="530" height="95" rx="12" fill="none" stroke="#a78bfa" stroke-width="2" />
    <text x="20" y="32" fill="#e9d5ff" font-size="16" font-weight="600">⚡ Tempo Médio até 1ª Interação</text>
    <text x="20" y="68" fill="#ddd6fe" font-size="34" font-weight="bold">${formatMinutes(tempoMedioPrimeiraInteracao)}</text>
    
    <rect x="570" y="0" width="530" height="95" rx="12" fill="#831843" opacity="0.3" filter="url(#shadow)" />
    <rect x="570" y="0" width="530" height="95" rx="12" fill="none" stroke="#f472b6" stroke-width="2" />
    <text x="590" y="32" fill="#fce7f3" font-size="16" font-weight="600">⏱️ Tempo Médio de Atendimento Total</text>
    <text x="590" y="68" fill="#fbcfe8" font-size="34" font-weight="bold">${formatMinutes(tempoMedioTotal)}</text>
  </g>
  
  <!-- Footer -->
  <text x="${width / 2}" y="${height - 40}" fill="#64748b" font-size="13" text-anchor="middle">Gerado automaticamente pelo Sistema de Atendimentos</text>
  <text x="${width / 2}" y="${height - 20}" fill="#475569" font-size="11" text-anchor="middle">© ${new Date().getFullYear()} Theo Stracke - Todos os direitos reservados</text>
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
