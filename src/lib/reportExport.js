/**
 * Export report to PDF or PPTX.
 * PDF: data-driven (jsPDF native) – no screenshots, no trimming, no UI controls.
 * PPTX: data-driven with native charts.
 */

import { CHART_DATASETS } from '../data/omanMockData';
import NCSI_LOGO_DATA from '../data/ncsiLogoBase64.js';

/** Get NCSI logo as base64 PNG data URL (for PDF) */
function getLogoDataUrl() {
  return NCSI_LOGO_DATA || null;
}

/** PptxGenJS expects "image/png;base64,..." without the "data:" prefix */
function toPptxImageData(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') return null;
  if (dataUrl.startsWith('data:')) return dataUrl.slice(5);
  return dataUrl;
}

/** Fallback: fetch PNG from public folder and return data URL */
async function fetchLogoDataUrl() {
  try {
    const res = await fetch('/ncsi-logo.png');
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
  } catch (_) {
    return null;
  }
}

/** Parse __CHART__|type|datasetKey format */
function parseChartContent(content) {
  if (typeof content !== 'string' || !content.startsWith('__CHART__|')) return null;
  const parts = content.slice('__CHART__|'.length).split('|');
  return { type: parts[0] || 'bar', datasetKey: parts[1] || 'governorates' };
}

/** Parse __TABLE__|json format */
function parseTableContent(content) {
  if (typeof content !== 'string' || !content.startsWith('__TABLE__|')) return null;
  try {
    const json = content.slice('__TABLE__|'.length);
    const rows = JSON.parse(json);
    return Array.isArray(rows) ? rows : null;
  } catch (_) {
    return null;
  }
}

/** Format date for report header */
function formatReportDate() {
  const d = new Date();
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Chart data to table rows for PDF */
function chartDataToTableRows(spec) {
  const data = CHART_DATASETS[spec?.datasetKey] || CHART_DATASETS.governorates;
  if (!data || !Array.isArray(data) || data.length === 0) return null;
  const hasYear = data[0]?.year != null;
  const header = hasYear ? ['Year', 'Value'] : ['Category', 'Value'];
  const rows = data.map((d) => [String(d.name ?? d.year ?? ''), String(d.value ?? '')]);
  return [header, ...rows];
}

/** Render chart to base64 PNG using Chart.js (for PDF) */
async function renderChartToDataUrl(spec) {
  try {
    const { Chart, registerables } = await import('chart.js');
    Chart.register(...registerables);

    const data = CHART_DATASETS[spec?.datasetKey] || CHART_DATASETS.governorates;
    if (!data || !Array.isArray(data) || data.length === 0) return null;

    const labels = data.map((d) => String(d.name ?? d.year ?? ''));
    const values = data.map((d) => (typeof d.value === 'number' ? d.value : Number(d.value) || 0));
    const type = spec?.type === 'line' ? 'line' : 'bar';

    const canvas = document.createElement('canvas');
    canvas.width = 560;
    canvas.height = 280;
    const ctx = canvas.getContext('2d');

    new Chart(ctx, {
      type,
      data: {
        labels,
        datasets: [{
          label: 'Value',
          data: values,
          backgroundColor: type === 'bar' ? ['#005287', '#4A90D9', '#7BB3E8', '#A8D0F0', '#182F5B', '#6D6E71'] : 'rgba(0,82,135,0.8)',
          borderColor: '#005287',
          borderWidth: 1,
          fill: type === 'line',
          tension: 0.3,
        }],
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        animation: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: '#E7E7E8' }, ticks: { color: '#6D6E71', font: { size: 10 } } },
          x: { grid: { display: false }, ticks: { color: '#6D6E71', font: { size: 10 }, maxRotation: 45 } },
        },
      },
    });

    return canvas.toDataURL('image/png');
  } catch (_) {
    return null;
  }
}

/**
 * Build PDF from report data (no html2canvas – proper PDF with text, tables).
 * @param {object} report - { title, sections }
 * @param {string} fileName - Output filename without extension
 */
export async function exportToPDF(report = {}, fileName = 'NCSI-Report') {
  try {
    const [jspdfMod, autoTableMod] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
    ]);
    const { default: JsPDF } = jspdfMod;
    const autoTable = autoTableMod.autoTable ?? autoTableMod.default;

    const pdf = new JsPDF('p', 'mm', 'a4');
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const margin = 18;
    const contentW = pageW - 2 * margin;
    const lineH = 6;
    const sectionGap = 8;

    let y = margin;

    const checkPage = (needed) => {
      if (y + needed > pageH - margin) {
        pdf.addPage();
        y = margin;
      }
    };

    const addSectionTitle = (title, fontSize = 12) => {
      checkPage(lineH * 2);
      pdf.setFontSize(fontSize);
      pdf.setFont(undefined, 'bold');
      pdf.setTextColor(0, 82, 135); // #005287
      const lines = pdf.splitTextToSize(title, contentW);
      pdf.text(lines, margin, y);
      y += lines.length * lineH + 2;
    };

    const addSectionHeader = (text) => {
      if (!text) return;
      checkPage(lineH);
      pdf.setFontSize(9);
      pdf.setFont(undefined, 'bold');
      pdf.setTextColor(109, 110, 113);
      pdf.text(text, margin, y);
      y += lineH + 2;
    };

    const addBodyText = (text) => {
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(22, 22, 22); // #161616
      const lines = pdf.splitTextToSize(text, contentW);
      for (let i = 0; i < lines.length; i++) {
        checkPage(lineH);
        pdf.text(lines[i], margin, y);
        y += lineH;
      }
    };

    const addTable = (rows) => {
      if (!rows || rows.length === 0) return;
      checkPage(30);
      autoTable(pdf, {
        head: [rows[0]],
        body: rows.slice(1),
        startY: y,
        margin: { left: margin, right: margin },
        tableWidth: contentW,
        theme: 'grid',
        headStyles: { fillColor: [245, 246, 248], textColor: [24, 47, 91], fontStyle: 'bold' },
        bodyStyles: { textColor: [22, 22, 22], fontSize: 9 },
        alternateRowStyles: { fillColor: [250, 250, 250] },
      });
      y = (pdf.lastAutoTable?.finalY ?? y) + sectionGap;
    };

    // —— Page 1: Title page ——
    pdf.setFillColor(0, 82, 135);
    pdf.rect(0, 0, pageW, 12, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(11);
    pdf.setFont(undefined, 'bold');
    pdf.text('NCSI SMART Portal', margin, 8);
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(231, 231, 232);
    pdf.text('Sultanate of Oman · National Centre for Statistics & Information', margin, 11);

    let logoData = getLogoDataUrl();
    if (!logoData) logoData = await fetchLogoDataUrl();
    if (logoData) {
      try {
        pdf.addImage(logoData, 'PNG', pageW / 2 - 18, 18, 36, 12);
      } catch (e) {
        console.warn('PDF logo add failed:', e);
      }
    }

    pdf.setTextColor(24, 47, 91);
    pdf.setFontSize(24);
    pdf.setFont(undefined, 'bold');
    const title = report.title || 'Untitled Report';
    const titleLines = pdf.splitTextToSize(title, contentW);
    pdf.text(titleLines, pageW / 2, 55, { align: 'center' });

    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(11);
    pdf.setTextColor(109, 110, 113);
    pdf.text(`Date: ${formatReportDate()}`, pageW / 2, 75, { align: 'center' });
    pdf.text('Author: NCSI SMART Portal', pageW / 2, 82, { align: 'center' });

    pdf.setDrawColor(231, 231, 232);
    pdf.setLineWidth(0.3);
    pdf.line(margin, 95, pageW - margin, 95);

    pdf.addPage();
    y = margin;

    // —— Report content ——
    const sections = (report.sections || [])
      .filter((s) => s.content !== '__TITLE_ONLY__')
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    for (const sec of sections) {
      addSectionHeader(sec.sectionHeader);
      addSectionTitle(sec.title, 14);

      if (sec.type === 'text' && typeof sec.content === 'string' && !sec.content.startsWith('__')) {
        const full = sec.content.trim();
        const isBullets = full.startsWith('•') || full.startsWith('- ');
        const lines = isBullets
          ? full.split('\n').map((ln) => ln.replace(/^[-•]\s*/, '').trim()).filter(Boolean)
          : full.split('\n\n');
        for (const line of lines) {
          checkPage(lineH * 2);
          addBodyText(isBullets ? `• ${line}` : line);
          y += 2;
        }
      } else if (sec.type === 'table' || (typeof sec.content === 'string' && sec.content.startsWith('__TABLE__|'))) {
        const rows = parseTableContent(sec.content);
        addTable(rows);
      } else if (sec.type === 'chart' || (typeof sec.content === 'string' && sec.content.startsWith('__CHART__'))) {
        const spec = parseChartContent(sec.content) || { type: 'bar', datasetKey: 'governorates' };
        const chartImg = await renderChartToDataUrl(spec);
        if (chartImg) {
          try {
            checkPage(80);
            pdf.addImage(chartImg, 'PNG', margin, y, contentW, 70);
            y += 75;
          } catch (_) {
            const chartRows = chartDataToTableRows(spec);
            addTable(chartRows);
          }
        } else {
          const chartRows = chartDataToTableRows(spec);
          addTable(chartRows);
        }
      }

      y += sectionGap;
    }

    pdf.save(`${fileName}.pdf`);
    return true;
  } catch (e) {
    console.error('PDF export failed', e);
    return false;
  }
}

/** Convert chart data to pptxgenjs format */
function toPptxChartData(spec) {
  const data = CHART_DATASETS[spec?.datasetKey] || CHART_DATASETS.governorates;
  if (!data || !Array.isArray(data) || data.length === 0) return null;

  const labels = data.map((d) => d.name || d.year || String(d));
  const values = data.map((d) => (typeof d.value === 'number' ? d.value : Number(d) || 0));

  return [{ name: spec?.datasetKey || 'Data', labels, values }];
}

/**
 * @param {object} report - { title, sections }
 * @param {string} fileName - Output filename without extension
 */
export async function exportToPPTX(report, fileName = 'NCSI-Report') {
  try {
    const pptxgenMod = await import('pptxgenjs');
    const pptxgen = pptxgenMod.default || pptxgenMod;
    const pres = new pptxgen();
    pres.layout = 'LAYOUT_16x9';
    pres.title = report.title || 'NCSI Report';
    pres.author = 'NCSI SMART Portal';

    const reportDate = formatReportDate();

    const titleSlide = pres.addSlide();
    titleSlide.background = { fill: 'FFFFFF' };
    titleSlide.addShape(pres.ShapeType.rect, {
      x: 0,
      y: 0,
      w: pres.width,
      h: 1.4,
      fill: { color: '005287' },
    });
    titleSlide.addText('NCSI SMART Portal', {
      x: 0.6,
      y: 0.25,
      w: 4,
      fontSize: 14,
      bold: true,
      color: 'FFFFFF',
    });
    titleSlide.addText('Sultanate of Oman · National Centre for Statistics & Information', {
      x: 0.6,
      y: 0.7,
      w: 7,
      fontSize: 10,
      color: 'E7E7E8',
    });
    try {
      let logoDataPptx = toPptxImageData(getLogoDataUrl());
      if (!logoDataPptx) {
        const fallback = await fetchLogoDataUrl();
        logoDataPptx = toPptxImageData(fallback);
      }
      if (logoDataPptx) {
        titleSlide.addImage({
          data: logoDataPptx,
          x: pres.width / 2 - 0.9,
          y: 1.5,
          w: 1.8,
          h: 0.6,
        });
      }
    } catch (e) {
      console.warn('PPTX logo add failed:', e);
    }
    titleSlide.addText(report.title || 'Untitled Report', {
      x: 0.9,
      y: 1.9,
      w: 8.2,
      h: 1.4,
      fontSize: 28,
      bold: true,
      color: '182F5B',
    });
    titleSlide.addText(`Date: ${reportDate}`, {
      x: 0.9,
      y: 3.2,
      w: 8.2,
      fontSize: 12,
      color: '6D6E71',
    });
    titleSlide.addText('Author: NCSI SMART Portal', {
      x: 0.9,
      y: 3.5,
      w: 8.2,
      fontSize: 12,
      color: '6D6E71',
    });

    const sections = (report.sections || []).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    const chartTypeMap = { bar: 'bar', line: 'line', area: 'area', pie: 'pie', scatter: 'scatter', funnel: 'bar' };

    for (const sec of sections) {
      const slide = pres.addSlide();
      slide.background = { fill: 'FFFFFF' };
      slide.addShape(pres.ShapeType.rect, {
        x: 0,
        y: pres.height - 0.4,
        w: pres.width,
        h: 0.4,
        fill: { color: 'F5F6F8' },
      });
      slide.addText(`NCSI SMART Portal · ${reportDate}`, {
        x: 0.6,
        y: pres.height - 0.33,
        w: 6,
        fontSize: 9,
        color: '6D6E71',
      });

      if (sec.content === '__TITLE_ONLY__') {
        slide.addText(sec.title, {
          x: 0.7,
          y: 0.9,
          w: 8.2,
          h: 0.8,
          fontSize: 24,
          bold: true,
          color: '161616',
        });
        continue;
      }

      slide.addText(sec.title, {
        x: 0.7,
        y: 0.5,
        w: 8.2,
        h: 0.5,
        fontSize: 18,
        bold: true,
        color: '005287',
      });

      if (sec.type === 'text' && typeof sec.content === 'string' && !sec.content.startsWith('__')) {
        const full = sec.content.trim();
        const isBullets = full.startsWith('•') || full.startsWith('- ');
        if (isBullets) {
          const bulletLines = full.split('\n').map((ln) => ln.replace(/^[-•]\s*/, '').trim()).filter(Boolean).slice(0, 10);
          slide.addText(
            bulletLines.map((text) => `• ${text}`),
            {
              x: 0.9,
              y: 1.05,
              w: 7.8,
              h: 4.5,
              fontSize: 12,
              color: '161616',
              bullet: { type: 'bullet', indent: 0.4 },
              lineSpacing: 18,
            },
          );
        } else {
          const paragraphs = full.split('\n\n').slice(0, 4);
          slide.addText(paragraphs, {
            x: 0.9,
            y: 1.05,
            w: 7.8,
            h: 4.8,
            fontSize: 12,
            color: '161616',
            lineSpacing: 18,
          });
        }
      } else if (sec.type === 'table' && typeof sec.content === 'string' && sec.content.startsWith('__TABLE__|')) {
        try {
          const json = sec.content.slice('__TABLE__|'.length);
          const rows = JSON.parse(json);
          if (Array.isArray(rows) && rows.length > 0) {
            const header = rows[0];
            const body = rows.slice(1);
            const tableData = [
              header.map((cell) => ({
                text: String(cell),
                options: {
                  bold: true,
                  fill: 'F5F6F8',
                  color: '182F5B',
                },
              })),
              ...body.map((row) =>
                row.map((cell) => ({
                  text: String(cell),
                  options: { color: '161616' },
                })),
              ),
            ];
            slide.addTable(tableData, {
              x: 0.7,
              y: 1.15,
              w: 8.2,
              fontSize: 11,
              border: { type: 'solid', pt: 0.5, color: 'E7E7E8' },
              valign: 'middle',
            });
          }
        } catch (_) {}
      } else if (sec.type === 'chart' || (typeof sec.content === 'string' && sec.content.startsWith('__CHART__'))) {
        const spec = parseChartContent(sec.content) || { type: 'bar', datasetKey: 'governorates' };
        const chartData = toPptxChartData(spec);
        const pptxType = chartTypeMap[spec.type] || 'bar';

        if (chartData && pres.ChartType?.[pptxType]) {
          try {
            slide.addChart(pres.ChartType[pptxType], chartData, {
              x: 0.7,
              y: 1.1,
              w: 8.2,
              h: 4.2,
              chartColors: ['005287', '4A90D9', '7BB3E8', 'A8D0F0', '182F5B', '6D6E71'],
              showLegend: pptxType === 'pie',
              showTitle: false,
            });
          } catch (_) {
            slide.addText(sec.title + ' — Chart data included in report', {
              x: 0.9,
              y: 1.3,
              w: 7.8,
              h: 1.2,
              fontSize: 12,
              color: '6D6E71',
              italic: true,
            });
          }
        } else {
          slide.addText(sec.title + ' — Chart data included in report', {
            x: 0.9,
            y: 1.3,
            w: 7.8,
            h: 1.2,
            fontSize: 12,
            color: '6D6E71',
            italic: true,
          });
        }
      }
    }

    await pres.writeFile({ fileName: `${fileName}.pptx` });
    return true;
  } catch (e) {
    console.error('PPTX export failed', e);
    return false;
  }
}
