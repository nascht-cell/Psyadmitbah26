export interface PatientFooterData {
  fullName?: string;
  age?: string;
  gender?: string;
  hn?: string;
  an?: string;
}

const renderFooterToDataUrl = (
  patient: PatientFooterData,
  pageNumber: number,
  totalPages: number
): string => {
  const canvas = document.createElement('canvas');
  // High-res canvas: 180mm @ 2x screen scale ~ 1360px
  const width = 1360;
  const height = 56;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background white
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Top dividing line for footer
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, 2);
  ctx.lineTo(width, 2);
  ctx.stroke();

  // Typography - TH Sarabun PSK
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 22px "TH Sarabun PSK", "TH Sarabun New", "Sarabun", sans-serif';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';

  const fullName = patient.fullName?.trim() || 'ไม่ระบุชื่อ';
  const age = patient.age?.trim() ? `${patient.age.trim()} ปี` : '-';
  const gender = patient.gender || '-';
  const hn = patient.hn?.trim() || '-';
  const an = patient.an?.trim() || '-';

  // 1-line footer: ชื่อ-สกุล: ...  อายุ: ...  เพศ: ...  HN: ...  AN: ...
  const leftText = `ชื่อ-สกุล: ${fullName}   |   อายุ: ${age}   |   เพศ: ${gender}   |   HN: ${hn}   |   AN: ${an}`;
  ctx.fillText(leftText, 4, 30);

  // Right text with page count
  ctx.textAlign = 'right';
  ctx.font = 'normal 20px "TH Sarabun PSK", "TH Sarabun New", "Sarabun", sans-serif';
  ctx.fillStyle = '#374151';
  const rightText = `หน้า ${pageNumber}/${totalPages} · แบบบันทึกแรกรับผู้ป่วยจิตเวช รพ.ภูมิพลอดุลยเดช`;
  ctx.fillText(rightText, width - 4, 30);

  return canvas.toDataURL('image/png');
};

const savePdfFile = (pdf: any, filename: string): void => {
  try {
    pdf.save(filename);
  } catch (err) {
    console.warn('Standard pdf.save failed, using legacy Blob anchor download:', err);
    try {
      const blob = pdf.output('blob');
      if (window.navigator && (window.navigator as any).msSaveOrOpenBlob) {
        (window.navigator as any).msSaveOrOpenBlob(blob, filename);
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 1000);
    } catch (fallbackError) {
      console.error('Blob save fallback failed:', fallbackError);
      window.print();
    }
  }
};

export const exportElementToA4Pdf = async (
  elementId: string,
  fileName: string = 'Psychiatric_Assessment.pdf',
  patientInfo?: PatientFooterData
): Promise<boolean> => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id #${elementId} not found`);
    return false;
  }

  try {
    // Wait for fonts to be ready across legacy & modern browsers
    if (document.fonts) {
      try {
        await document.fonts.ready;
      } catch (fontErr) {
        console.warn('document.fonts.ready warning:', fontErr);
      }
    }

    // Dynamically load heavy libraries for tree-shaking / bundle splitting
    const [jsPDFModule, html2canvasModule] = await Promise.all([
      import('jspdf'),
      import('html2canvas-pro')
    ]);
    const jsPDF = jsPDFModule.default || jsPDFModule;
    const html2canvas = html2canvasModule.default || html2canvasModule;

    // Extract patient info from element dataset if not explicitly passed
    const effectivePatientInfo: PatientFooterData = {
      fullName: patientInfo?.fullName || element.getAttribute('data-fullname') || '',
      age: patientInfo?.age || element.getAttribute('data-age') || '',
      gender: patientInfo?.gender || element.getAttribute('data-gender') || '',
      hn: patientInfo?.hn || element.getAttribute('data-hn') || '',
      an: patientInfo?.an || element.getAttribute('data-an') || '',
    };

    // If the document is structured as distinct A4 page sheets (.a4-page-sheet),
    // capture each page individually for exact 1:1 fidelity with zero cutting across sections!
    const pageSheets = element.querySelectorAll<HTMLElement>('.a4-page-sheet');
    if (pageSheets && pageSheets.length > 0) {
      const pdf = new jsPDF('p', 'mm', 'a4');
      for (let i = 0; i < pageSheets.length; i++) {
        const sheet = pageSheets[i];
        let canvas: HTMLCanvasElement;
        const renderOpts = {
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: 1024,
          onclone: (_clonedDoc: any, clonedElement: HTMLElement | null) => {
            if (clonedElement) {
              clonedElement.style.visibility = 'visible';
              clonedElement.style.display = 'flex';
              clonedElement.style.position = 'static';
              let parent = clonedElement.parentElement;
              while (parent) {
                parent.style.visibility = 'visible';
                parent.style.display = 'block';
                parent.style.position = 'static';
                parent.style.left = 'auto';
                parent.style.top = 'auto';
                parent = parent.parentElement;
              }
            }
          },
        };

        try {
          canvas = await html2canvas(sheet, { scale: 2, ...renderOpts });
        } catch (canvasErr) {
          console.warn('html2canvas scale 2 failed, trying scale 1.5 for low-spec memory:', canvasErr);
          try {
            canvas = await html2canvas(sheet, { scale: 1.5, ...renderOpts });
          } catch (_) {
            canvas = await html2canvas(sheet, { scale: 1, ...renderOpts });
          }
        }

        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        if (i > 0) {
          pdf.addPage();
        }
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
      }

      savePdfFile(pdf, fileName);
      return true;
    }

    // Fallback: Continuous DOM capture using html2canvas-pro
    const canvas = await html2canvas(element, {
      scale: 2, // 2x scale for sharp print quality
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1024,
      onclone: (clonedDoc, clonedElement) => {
        // Ensure element is visible in the cloned DOM (especially when rendered offscreen)
        if (clonedElement) {
          clonedElement.style.visibility = 'visible';
          clonedElement.style.display = 'block';
          clonedElement.style.position = 'static';
          clonedElement.style.left = 'auto';
          clonedElement.style.top = 'auto';
        }
      },
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    const pdf = new jsPDF('p', 'mm', 'a4');
    let position = 0;

    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    // Add first page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
    }

    // If final A4 PDF has multiple pages, starting from page 2 until the last page,
    // inject a 1-line footer with patient identifiers to prevent document mix-ups if dropped
    const totalPages: number =
      typeof (pdf as any).getNumberOfPages === 'function'
        ? (pdf as any).getNumberOfPages()
        : (pdf.internal.pages ? pdf.internal.pages.length - 1 : 1);
    if (totalPages > 1) {
      for (let p = 2; p <= totalPages; p++) {
        pdf.setPage(p);

        // White out bottom margin area to ensure clean footer placement without overlapping text
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 287, 210, 10, 'F');

        const footerImgData = renderFooterToDataUrl(effectivePatientInfo, p, totalPages);
        if (footerImgData) {
          pdf.addImage(footerImgData, 'PNG', 15, 288, 180, 7.4, undefined, 'FAST');
        }
      }
    }

    savePdfFile(pdf, fileName);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    // Fallback: trigger native browser print dialog
    window.print();
    return false;
  }
};
