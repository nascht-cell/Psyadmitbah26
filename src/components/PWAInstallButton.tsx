import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Info, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 active:scale-95 transition-all min-h-[44px] touch-manipulation cursor-pointer"
      >
        <Download className="w-4 h-4 shrink-0" />
        <span>ติดตั้งแอปบนอุปกรณ์ (Install App)</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-100 hover:bg-slate-700 active:scale-95 transition-all min-h-[44px] touch-manipulation cursor-pointer"
        >
          <Download className="w-4 h-4 text-blue-400 shrink-0" />
          <span>ติดตั้งแอปบน iPad/iPhone</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-slide-up">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 text-blue-600">
                  <Info className="w-5 h-5 shrink-0" />
                  <h3 className="text-base font-bold text-slate-900">ติดตั้งบน iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="rounded-full p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 min-w-[32px] min-h-[32px] flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3.5 text-sm text-slate-600 leading-relaxed">
                <p>เปิดใช้แอปได้รวดเร็วขึ้น ทำงานลื่นไหล เหมือนแอปแท้บนเครื่อง:</p>
                <ol className="list-decimal list-inside space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100 font-medium">
                  <li>
                    แตะปุ่ม <strong className="text-blue-600 font-bold">แชร์ (Share)</strong> 
                    <span className="inline-block mx-1 bg-white p-1.5 rounded border border-slate-200 shadow-2xs">
                      <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 10.742l4.943-2.471m0 0l-4.943-2.471m4.943 2.471v10.556" />
                      </svg>
                    </span>
                    บน Safari แถบควบคุมด้านล่าง
                  </li>
                  <li>
                    เลื่อนลงด้านล่างแล้วเลือก <strong className="text-blue-600 font-bold">เพิ่มไปยังหน้าโฮม (Add to Home Screen)</strong>
                  </li>
                  <li>
                    แตะ <strong className="text-blue-600 font-bold">เพิ่ม (Add)</strong> เพื่อยืนยันการติดตั้ง
                  </li>
                </ol>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-md hover:bg-slate-800 active:scale-95 transition-all min-h-[44px] cursor-pointer"
              >
                เข้าใจแล้ว (Close)
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
