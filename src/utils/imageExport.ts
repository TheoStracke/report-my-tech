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

// Função para formatar minutos em tempo legível
const formatMinutes = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}min`;
};

export const exportTodayToImage = async (attendances: Attendance[]) => {
  if (!attendances || attendances.length === 0) {
    alert("Nenhum atendimento registrado hoje para exportar.");
    return;
  }

  // Métricas principais
  const total = attendances.length;
  const resolvidos = attendances.filter(a => a.status === "Resolvido").length;
  const pendentes = attendances.filter(a => a.status === "Pendente").length;
  const encaminhados = attendances.filter(a => a.status === "Encaminhado").length;

  // Tempo médio de atendimento
  const atendimentosComTempo = attendances.filter(a => a.timeSpent > 0);
  const tempoMedio = atendimentosComTempo.length 
    ? Math.round(atendimentosComTempo.reduce((sum, a) => sum + a.timeSpent, 0) / atendimentosComTempo.length)
    : 0;

  // Tempo médio de primeira resposta (agora em minutos)
  const atendimentosComResposta = attendances.filter(a => a.firstResponseMinutes && a.firstResponseMinutes > 0);
  const tempoMedioPrimeiraResposta = atendimentosComResposta.length
    ? Math.round(atendimentosComResposta.reduce((sum, a) => sum + (a.firstResponseMinutes || 0), 0) / atendimentosComResposta.length)
    : 0;

  // Top 5 despachantes/clientes mais atendidos
  const clienteCount: Record<string, number> = {};
  attendances.forEach(a => {
    clienteCount[a.category] = (clienteCount[a.category] || 0) + 1;
  });
  const topClientes = Object.entries(clienteCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Top 5 erros mais frequentes
  const errorCount: Record<string, number> = {};
  attendances.forEach(a => {
    if (a.errorType) {
      errorCount[a.errorType] = (errorCount[a.errorType] || 0) + 1;
    }
  });
  const topErros = Object.entries(errorCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Causas de pendências
  const causasPendencia: Record<string, number> = {};
  attendances.filter(a => a.status === "Pendente" && a.causeNoSolution).forEach(a => {
    const causa = a.causeNoSolution!;
    causasPendencia[causa] = (causasPendencia[causa] || 0) + 1;
  });
  const topCausasPendencia = Object.entries(causasPendencia)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Dificuldades (observações)
  const dificuldades = attendances
    .filter(a => a.observations && a.observations.trim())
    .map(a => `• ${a.observations}`)
    .slice(0, 5);

  // Contagem por tipo
  const typeCount = attendances.reduce<Record<string, number>>((acc, a) => {
    acc[a.type] = (acc[a.type] || 0) + 1;
    return acc;
  }, {});
  const docCount = typeCount["Suporte Documental"] || 0;
  const techCount = typeCount["Suporte Técnico"] || 0;
  const totalCount = docCount + techCount;
  const docPercent = totalCount > 0 ? (docCount / totalCount) * 100 : 0;
  const techPercent = totalCount > 0 ? (techCount / totalCount) * 100 : 0;

  // Cálculo de ângulos para pizza (usa raio 120)
  const radius = 120;
  const techAngle = (techPercent / 100) * 360;
  const techRadians = (techAngle * Math.PI) / 180;
  const techX = radius * Math.sin(techRadians);
  const techY = -radius * Math.cos(techRadians);
  const largeArcTech = techPercent > 50 ? 1 : 0;
  const largeArcDoc = docPercent > 50 ? 1 : 0;

  // SVG
  const width = 1400;
  const height = 2000;
  const padding = 50;
  const today = new Date().toLocaleDateString('pt-BR');

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <!-- Background -->
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1e293b;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="${width}" height="${height}" fill="url(#bgGradient)" />
  
  <!-- Header -->
  <text x="${width / 2}" y="60" fill="#60a5fa" font-size="42" font-weight="bold" text-anchor="middle">📊 Relatório Completo do Dia</text>
  <text x="${width / 2}" y="100" fill="#cbd5e1" font-size="20" text-anchor="middle">${escapeXml(today)} - Theo Stracke</text>
  
  <!-- Cards de Resumo -->
  <g transform="translate(${padding}, 140)">
    <!-- Card Total -->
    <rect x="0" y="0" width="300" height="120" rx="12" fill="#1e3a8a" opacity="0.3" />
    <rect x="0" y="0" width="300" height="120" rx="12" fill="none" stroke="#3b82f6" stroke-width="2" />
    <text x="150" y="35" fill="#93c5fd" font-size="16" text-anchor="middle">TOTAL DE ATENDIMENTOS</text>
    <text x="150" y="80" fill="#dbeafe" font-size="48" font-weight="bold" text-anchor="middle">${total}</text>
    
    <!-- Card Resolvidos -->
    <rect x="330" y="0" width="300" height="120" rx="12" fill="#065f46" opacity="0.3" />
    <rect x="330" y="0" width="300" height="120" rx="12" fill="none" stroke="#10b981" stroke-width="2" />
    <text x="480" y="35" fill="#86efac" font-size="16" text-anchor="middle">RESOLVIDOS</text>
    <text x="480" y="80" fill="#d1fae5" font-size="48" font-weight="bold" text-anchor="middle">${resolvidos}</text>
    
    <!-- Card Pendentes -->
    <rect x="660" y="0" width="300" height="120" rx="12" fill="#854d0e" opacity="0.3" />
    <rect x="660" y="0" width="300" height="120" rx="12" fill="none" stroke="#fbbf24" stroke-width="2" />
    <text x="810" y="35" fill="#fde047" font-size="16" text-anchor="middle">PENDENTES</text>
    <text x="810" y="80" fill="#fef3c7" font-size="48" font-weight="bold" text-anchor="middle">${pendentes}</text>
    
    <!-- Card Encaminhados -->
    <rect x="990" y="0" width="300" height="120" rx="12" fill="#164e63" opacity="0.3" />
    <rect x="990" y="0" width="300" height="120" rx="12" fill="none" stroke="#06b6d4" stroke-width="2" />
    <text x="1140" y="35" fill="#67e8f9" font-size="16" text-anchor="middle">ENCAMINHADOS</text>
    <text x="1140" y="80" fill="#cffafe" font-size="48" font-weight="bold" text-anchor="middle">${encaminhados}</text>
  </g>

  <!-- Tempos Médios -->
  <g transform="translate(${padding}, 300)">
    <rect x="0" y="0" width="630" height="100" rx="12" fill="#4c1d95" opacity="0.3" />
    <rect x="0" y="0" width="630" height="100" rx="12" fill="none" stroke="#a78bfa" stroke-width="2" />
    <text x="20" y="35" fill="#e9d5ff" font-size="18" font-weight="600">⏱️ Tempo Médio de Atendimento</text>
    <text x="20" y="70" fill="#ddd6fe" font-size="36" font-weight="bold">${formatMinutes(tempoMedio)}</text>
    
    <rect x="660" y="0" width="630" height="100" rx="12" fill="#831843" opacity="0.3" />
    <rect x="660" y="0" width="630" height="100" rx="12" fill="none" stroke="#f472b6" stroke-width="2" />
    <text x="680" y="35" fill="#fce7f3" font-size="18" font-weight="600">⚡ Tempo Médio 1ª Resposta</text>
    <text x="680" y="70" fill="#fbcfe8" font-size="36" font-weight="bold">${formatMinutes(tempoMedioPrimeiraResposta)}</text>
  </g>

  <!-- Top Despachantes -->
  <g transform="translate(${padding}, 440)">
    <text x="0" y="0" fill="#fbbf24" font-size="24" font-weight="bold">👥 Top 5 Despachantes/Clientes Mais Atendidos</text>
    <rect x="0" y="15" width="630" height="${Math.max(topClientes.length * 45 + 20, 100)}" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1" />
    ${topClientes.map(([cliente, qtd], i) => {
      const barWidth = (qtd / Math.max(...topClientes.map(c => c[1]))) * 500;
      return `
        <text x="15" y="${50 + i * 45}" fill="#e2e8f0" font-size="16">${escapeXml(cliente)}</text>
        <rect x="15" y="${55 + i * 45}" width="${barWidth}" height="25" rx="4" fill="#3b82f6" opacity="0.8" />
        <text x="${barWidth + 25}" y="${73 + i * 45}" fill="#60a5fa" font-size="18" font-weight="bold">${qtd}</text>
      `;
    }).join('')}
  </g>

  <!-- Top Erros -->
  <g transform="translate(${padding + 660}, 440)">
    <text x="0" y="0" fill="#ef4444" font-size="24" font-weight="bold">🐛 Top 5 Erros Mais Frequentes</text>
    <rect x="0" y="15" width="630" height="${Math.max(topErros.length * 45 + 20, 100)}" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1" />
    ${topErros.length > 0 ? topErros.map(([erro, qtd], i) => {
      const barWidth = (qtd / Math.max(...topErros.map(e => e[1]))) * 500;
      const erroTruncado = erro.length > 35 ? erro.substring(0, 35) + '...' : erro;
      return `
        <text x="15" y="${50 + i * 45}" fill="#e2e8f0" font-size="16">${escapeXml(erroTruncado)}</text>
        <rect x="15" y="${55 + i * 45}" width="${barWidth}" height="25" rx="4" fill="#ef4444" opacity="0.8" />
        <text x="${barWidth + 25}" y="${73 + i * 45}" fill="#fca5a5" font-size="18" font-weight="bold">${qtd}</text>
      `;
    }).join('') : `<text x="15" y="50" fill="#94a3b8" font-size="16">Nenhum erro categorizado</text>`}
  </g>

  <!-- Gráfico de Pizza -->
  <g transform="translate(${padding + 200}, ${topClientes.length > topErros.length ? 700 + topClientes.length * 45 : 700 + topErros.length * 45})">
    <text x="0" y="-50" fill="#94a3b8" font-size="24" font-weight="600" text-anchor="middle">📈 Distribuição por Tipo</text>
    ${totalCount > 0 ? `
      <circle cx="0" cy="50" r="120" fill="#1e293b" stroke="#334155" stroke-width="2" />
      <path d="M 0 50 L 0 ${50 - radius} A ${radius} ${radius} 0 ${largeArcTech} 1 ${techX} ${techY + 50} Z" fill="#3b82f6" stroke="#1e293b" stroke-width="2" />
      <path d="M 0 50 L ${techX} ${techY + 50} A ${radius} ${radius} 0 ${largeArcDoc} 1 0 ${50 - radius} Z" fill="#10b981" stroke="#1e293b" stroke-width="2" />
      <rect x="-160" y="200" width="20" height="20" rx="4" fill="#3b82f6" />
      <text x="-135" y="215" fill="#e5e7eb" font-size="16" font-weight="500">Suporte Técnico: ${techCount} (${techPercent.toFixed(1)}%)</text>
      <rect x="-160" y="235" width="20" height="20" rx="4" fill="#10b981" />
      <text x="-135" y="250" fill="#e5e7eb" font-size="16" font-weight="500">Suporte Documental: ${docCount} (${docPercent.toFixed(1)}%)</text>
    ` : `<text x="0" y="50" fill="#94a3b8" font-size="16" text-anchor="middle">Nenhum dado disponível</text>`}
  </g>

  <!-- Causas de Pendência -->
  ${topCausasPendencia.length > 0 ? `
  <g transform="translate(${padding + 700}, ${topClientes.length > topErros.length ? 700 + topClientes.length * 45 : 700 + topErros.length * 45})">
    <text x="0" y="-50" fill="#fbbf24" font-size="24" font-weight="bold">⏸️ Causas de Pendência</text>
    <rect x="0" y="-30" width="590" height="${topCausasPendencia.length * 40 + 30}" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1" />
    ${topCausasPendencia.map(([causa, qtd], i) => {
      const causaTruncada = causa.length > 45 ? causa.substring(0, 45) + '...' : causa;
      return `
        <text x="15" y="${i * 40 + 5}" fill="#fde68a" font-size="15">${escapeXml(causaTruncada)}</text>
        <text x="560" y="${i * 40 + 5}" fill="#fbbf24" font-size="16" font-weight="bold" text-anchor="end">${qtd}x</text>
      `;
    }).join('')}
  </g>
  ` : ''}

  <!-- Dificuldades -->
  ${dificuldades.length > 0 ? `
  <g transform="translate(${padding}, ${topClientes.length > topErros.length ? 1000 + topClientes.length * 45 : 1000 + topErros.length * 45})">
    <text x="0" y="0" fill="#f472b6" font-size="24" font-weight="bold">💭 Dificuldades Encontradas</text>
    <rect x="0" y="20" width="1300" height="${dificuldades.length * 35 + 30}" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1" />
    ${dificuldades.map((dif, i) => {
      const difTruncada = dif.length > 120 ? dif.substring(0, 120) + '...' : dif;
      return `<text x="15" y="${55 + i * 35}" fill="#f9a8d4" font-size="14">${escapeXml(difTruncada)}</text>`;
    }).join('')}
  </g>
  ` : ''}
  
  <!-- Footer -->
  <text x="${width / 2}" y="${height - 40}" fill="#64748b" font-size="14" text-anchor="middle">Gerado automaticamente pelo Sistema de Atendimentos</text>
  <text x="${width / 2}" y="${height - 20}" fill="#475569" font-size="12" text-anchor="middle">© ${new Date().getFullYear()} Theo Stracke - Todos os direitos reservados</text>
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

export const exportPendingReportImage = async (attendances: Attendance[]) => {
  const pendings = attendances.filter(a => a.status === 'Pendente');
  if (pendings.length === 0) {
    alert('Não há atendimentos pendentes hoje.');
    return;
  }

  const width = 1080;
  const padding = 48;
  const lineHeight = 28;
  const rowHeight = 80;
  const headerHeight = 140;
  const height = headerHeight + (pendings.length * rowHeight) + padding;
  const today = new Date();
  const dateStr = today.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const rows = pendings.map((a, i) => {
    const y = headerHeight + i * rowHeight + 10;
    return `
      <rect x="${padding}" y="${y}" width="${width - padding * 2}" height="${rowHeight - 16}" rx="10" fill="#0b1220" stroke="#1e293b" />
      <text x="${padding + 16}" y="${y + 24}" fill="#e5e7eb" font-family="Segoe UI, Roboto, Arial" font-size="18" font-weight="700">${escapeXml(a.category)}</text>
      <text x="${padding + 16}" y="${y + 48}" fill="#93c5fd" font-family="Segoe UI, Roboto, Arial" font-size="14">${escapeXml(a.type)} • ${escapeXml(a.time)} • 1ª resposta: ${a.firstResponseMinutes ?? 0} min</text>
      ${a.causeNoSolution ? `<text x="${padding + 520}" y="${y + 24}" fill="#fbbf24" font-family="Segoe UI, Roboto, Arial" font-size="16" font-weight="700">Causa: ${escapeXml(a.causeNoSolution)}</text>` : ''}
      ${a.problem ? `<text x="${padding + 520}" y="${y + 48}" fill="#cbd5e1" font-family="Segoe UI, Roboto, Arial" font-size="14">${escapeXml(a.problem.slice(0, 60))}${a.problem.length>60?'…':''}</text>` : ''}
    `;
  }).join('\n');

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="bgp" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#020617" />
        <stop offset="100%" stop-color="#0b1220" />
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="${width}" height="${height}" fill="url(#bgp)" />
    <text x="${padding}" y="${padding}" fill="#93c5fd" font-family="Segoe UI, Roboto, Arial" font-size="20" font-weight="600">Relatório de Pendências - ${escapeXml(dateStr)}</text>
    <text x="${padding}" y="${padding + 34}" fill="#e2e8f0" font-family="Segoe UI, Roboto, Arial" font-size="28" font-weight="800">Total pendentes: ${pendings.length}</text>
    ${rows}
  </svg>`;

  const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  await new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas not available'));
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error('Falha ao gerar imagem'));
        const a = document.createElement('a');
        const today = new Date().toISOString().split('T')[0];
        a.download = `relatorio_pendentes_${today}.png`;
        a.href = URL.createObjectURL(blob);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        resolve();
      }, 'image/png');
    };
    img.onerror = () => reject(new Error('Erro ao carregar imagem'));
    img.src = url;
  });
};
