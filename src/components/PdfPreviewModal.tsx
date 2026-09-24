import React, { useState, useEffect } from 'react';
import { Download, Printer, X, Check, Loader2, FileText } from 'lucide-react';
import { AssessmentPdfDocument } from './AssessmentPdfDocument';
import { PsychiatricAssessment } from '../types/assessment';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: PsychiatricAssessment;
}

export const PdfPreviewModal: React.FC<Props> = ({ isOpen, onClose, data }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Prevent background scrolling when preview modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadSuccess(false);
    try {
      const { exportElementToA4Pdf } = await import('../utils/pdfGenerator');
      const fileName = `Psychiatric_Assessment_HN_${data.hn || 'Draft'}_${data.assessmentDate || 'Report'}.pdf`;
      const success = await exportElementToA4Pdf('psychiatric-assessment-pdf-document', fileName, data);
      setIsDownloading(false);
      if (success) {
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3500);
      }
    } catch (err) {
      console.error('Error generating PDF download:', err);
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-hidden animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label="ตัวอย่างเอกสาร A4"
    >
      <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-5xl h-[95vh] flex flex-col overflow-hidden border border-slate-700">
        {/* Streamlined Clean Header Bar */}
        <div className="px-4 sm:px-6 py-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0 gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-blue-400" />
            </div>
            <div className="truncate">
              <h3 className="font-bold text-sm sm:text-base text-white leading-tight truncate">
                ตัวอย่างเอกสารบันทึกแรกรับ (A4 Preview)
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span className="font-mono text-blue-300 font-semibold">
                  HN: {data.hn || 'รอระบุ'}
                </span>
                {data.fullName && (
                  <>
                    <span>•</span>
                    <span className="text-slate-300 truncate max-w-[150px] sm:max-w-xs font-medium">
                      {data.fullName}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {downloadSuccess && (
              <span className="hidden sm:flex text-xs text-emerald-400 font-semibold items-center gap-1 bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-1 rounded-lg">
                <Check className="w-3.5 h-3.5" /> สำเร็จ
              </span>
            )}

            {/* Native Browser Print Button (window.print) */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 sm:px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
              title="สั่งพิมพ์เอกสารผ่านหน้าต่างพิมพ์ของเบราว์เซอร์หรือ iPad AirPrint (A4)"
            >
              <Printer className="w-4 h-4 text-white shrink-0" />
              <span>พิมพ์เอกสาร (Print)</span>
            </button>

            {/* Download PDF Button */}
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              title="ดาวน์โหลดเป็นไฟล์ PDF คุณภาพสูง"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span className="hidden xs:inline">กำลังประมวลผล...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 shrink-0" />
                  <span className="hidden xs:inline">ดาวน์โหลด PDF</span>
                </>
              )}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors ml-1 cursor-pointer"
              aria-label="ปิดหน้าต่าง"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Preview Area (Maximized viewport for iPad & Desktop) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-800/90 flex flex-col items-center select-none">
          <AssessmentPdfDocument data={data} showPageBadges={true} />
        </div>
      </div>
    </div>
  );
};
