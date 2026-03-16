/**
 * Export report to PDF or PPTX.
 * Uses dynamic imports so missing deps don't break the app.
 */

/**
 * @param {HTMLElement} element - Root element to capture (e.g. report canvas content)
 * @param {string} fileName - Output filename without extension
 */
export async function exportToPDF(element, fileName = 'NCSI-Report') {
  try {
    const [html2canvas, jspdfMod] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ]);
    const canvas = await html2canvas.default(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      // Force a clean white background so the PDF looks like a formal report
      backgroundColor: '#ffffff',
    });
    const imgData = canvas.toDataURL('image/jpeg', 0.92);
    const JsPDF = jspdfMod.default;
    const pdf = new JsPDF('p', 'mm', 'a4');
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    // Slightly wider margins for a cleaner print look
    const margin = 15;
    const contentW = pageW - 2 * margin;
    const imgW = contentW;
    const imgH = (canvas.height * contentW) / canvas.width;
    let heightLeft = imgH;
    let position = margin;
    // First page
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pageW, pageH, 'F');
    pdf.addImage(imgData, 'JPEG', margin, position, imgW, imgH);
    heightLeft -= pageH;
    while (heightLeft > 0) {
      pdf.addPage();
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pageW, pageH, 'F');
      position = -pageH + margin + heightLeft - imgH;
      pdf.addImage(imgData, 'JPEG', margin, position, imgW, imgH);
      heightLeft -= pageH;
    }
    pdf.save(`${fileName}.pdf`);
    return true;
  } catch (e) {
    console.error('PDF export failed', e);
    return false;
  }
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

    // Title slide
    const titleSlide = pres.addSlide();
    // Soft background band at top for NCSI identity
    titleSlide.background = { fill: 'FFFFFF' };
    titleSlide.addShape(pres.ShapeType.rect, {
      x: 0,
      y: 0,
      w: pres.width,
      h: 1.3,
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
      y: 0.65,
      w: 7,
      fontSize: 11,
      color: 'E7E7E8',
    });
    titleSlide.addText(report.title || 'Untitled Report', {
      x: 0.9,
      y: 1.8,
      w: 8.2,
      h: 1.6,
      fontSize: 30,
      bold: true,
      color: '182F5B',
    });
    titleSlide.addText('Prepared with NCSI SMART Portal (demo)', {
      x: 0.9,
      y: 3.1,
      w: 8.2,
      fontSize: 12,
      color: '6D6E71',
    });

    const sections = report.sections || [];
    for (const sec of sections) {
      const slide = pres.addSlide();
      slide.background = { fill: 'FFFFFF' };
      // Simple bottom footer strip
      slide.addShape(pres.ShapeType.rect, {
        x: 0,
        y: pres.height - 0.4,
        w: pres.width,
        h: 0.4,
        fill: { color: 'F5F6F8' },
      });
      slide.addText('NCSI SMART Portal · Demo', {
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
        y: 0.6,
        w: 8.2,
        h: 0.5,
        fontSize: 18,
        bold: true,
        color: '005287',
      });
      if (sec.type === 'text' && typeof sec.content === 'string' && !sec.content.startsWith('__')) {
        // Try to keep bullets looking like real bullet lists
        const full = sec.content.trim();
        const isBullets = full.startsWith('•') || full.startsWith('- ');
        if (isBullets) {
          const bulletLines = full.split('\n').map((ln) => ln.replace(/^[-•]\s*/, '').trim()).filter(Boolean).slice(0, 10);
          slide.addText(
            bulletLines.map((text) => `• ${text}`),
            {
              x: 0.9,
              y: 1.1,
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
            y: 1.1,
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
              y: 1.2,
              w: 8.2,
              fontSize: 11,
              border: { type: 'solid', pt: 0.5, color: 'E7E7E8' },
              valign: 'middle',
            });
          }
        } catch (_) {}
      } else if (sec.type === 'chart' || (typeof sec.content === 'string' && sec.content.startsWith('__CHART__'))) {
        slide.addText(sec.title + ' — see full report for interactive chart', {
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

    pres.writeFile({ fileName: `${fileName}.pptx` });
    return true;
  } catch (e) {
    console.error('PPTX export failed', e);
    return false;
  }
}
