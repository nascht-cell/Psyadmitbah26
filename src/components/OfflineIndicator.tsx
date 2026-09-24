import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-2xl bg-amber-600 border border-amber-500 px-4 py-3 text-xs font-semibold text-white shadow-xl max-w-xs animate-slide-up select-none">
      <div className="relative flex h-3 w-3 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-200 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
      </div>
      <div className="flex items-center gap-1.5">
        <WifiOff className="w-4 h-4 shrink-0" />
        <span>โหมดออฟไลน์: กำลังใช้ข้อมูลที่ถูกบันทึกในอุปกรณ์</span>
      </div>
    </div>
  );
};
