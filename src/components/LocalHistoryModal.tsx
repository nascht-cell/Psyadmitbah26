import React, { useState, useEffect, useRef } from 'react';
import {
  History,
  X,
  Search,
  Download,
  Upload,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  Calendar,
  Clock,
  ShieldCheck,
  User,
  ArrowRight,
  FileText,
  Sparkles,
} from 'lucide-react';
import { PsychiatricAssessment } from '../types/assessment';
import {
  SavedRecordItem,
  loadLocalHistory,
  saveToLocalHistory,
  deleteFromLocalHistory,
  clearAllLocalHistory,
} from '../utils/storage';

interface LocalHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadRecord: (record: PsychiatricAssessment) => void;
  currentData: PsychiatricAssessment;
}

export const LocalHistoryModal: React.FC<LocalHistoryModalProps> = ({
  isOpen,
  onClose,
  onLoadRecord,
  currentData,
}) => {
  const [records, setRecords] = useState<SavedRecordItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecordToLoad, setSelectedRecordToLoad] = useState<SavedRecordItem | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<SavedRecordItem | null>(null);
  const [isClearAllConfirmOpen, setIsClearAllConfirmOpen] = useState(false);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshList = async () => {
    setIsLoading(true);
    const list = await loadLocalHistory();
    setRecords(list);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      refreshList();
      setSelectedRecordToLoad(null);
      setRecordToDelete(null);
      setIsClearAllConfirmOpen(false);
      setStatusNotification(null);
    }
  }, [isOpen]);

  const showNotification = (msg: string) => {
    setStatusNotification(msg);
    setTimeout(() => {
      setStatusNotification(null);
    }, 4000);
  };

  if (!isOpen) return null;

  const filteredRecords = records.filter(rec => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      rec.hn.toLowerCase().includes(term) ||
      rec.fullName.toLowerCase().includes(term) ||
      rec.primaryDiagnosis.toLowerCase().includes(term) ||
      rec.assessmentDate.toLowerCase().includes(term) ||
      rec.admissionType.toLowerCase().includes(term)
    );
  });

  const formatThaiDateTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }) + ' น.';
    } catch {
      return isoString;
    }
  };

  const handleConfirmLoad = (rec: SavedRecordItem) => {
    onLoadRecord(rec.data);
    onClose();
  };

  const handleDelete = async (id: string) => {
    await deleteFromLocalHistory(id);
    setRecordToDelete(null);
    showNotification('ลบประวัติรายการดังกล่าวออกจากเครื่องเรียบร้อยแล้ว');
    refreshList();
  };

  const handleClearAll = async () => {
    await clearAllLocalHistory();
    setIsClearAllConfirmOpen(false);
    showNotification('ล้างประวัติการบันทึกทั้งหมดในเครื่องเรียบร้อยแล้ว');
    refreshList();
  };

  const handleExportSingleJson = (rec: SavedRecordItem) => {
    const jsonStr = JSON.stringify(rec.data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Assessment_${rec.hn || 'Draft'}_${rec.assessmentDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification(`ดาวน์โหลดไฟล์ .json ของ HN: ${rec.hn} ลงเครื่องแล้ว`);
  };

  const handleExportAllBackupJson = () => {
    const jsonStr = JSON.stringify(records, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Psychiatric_Assessments_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('สำรองไฟล์ประวัติทั้งหมด (.json) ลงเครื่องเรียบร้อยแล้ว');
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async event => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (Array.isArray(parsed)) {
          // Array of SavedRecordItems
          for (const item of parsed) {
            if (item.data) {
              await saveToLocalHistory(item.data);
            }
          }
          showNotification(`นำเข้าข้อมูลประวัติ ${parsed.length} รายการสำเร็จ`);
        } else if (parsed && typeof parsed === 'object') {
          // Single assessment object or record item
          const assessmentData = parsed.data || parsed;
          if (assessmentData.hospitalName !== undefined || assessmentData.hn !== undefined) {
            await saveToLocalHistory(assessmentData);
            onLoadRecord(assessmentData);
            showNotification(`นำเข้าและโหลดข้อมูล HN: ${assessmentData.hn || 'ผู้ป่วย'} สำเร็จ`);
            onClose();
            return;
          }
        }
        refreshList();
      } catch (err) {
        console.error('Error importing JSON file:', err);
        showNotification('ไฟล์ JSON ไม่ถูกต้องหรือไม่ตรงตามรูปแบบของแบบประเมิน');
      }
    };
    reader.readAsText(file);
    if (e.target) {
      e.target.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn no-print">
      <div className="clay-surface w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-slate-900 text-white flex items-center justify-between gap-4 rounded-t-[26px] shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-600/40 border border-blue-400/40 text-blue-300">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <span>ประวัติการบันทึก (Local Saved Records)</span>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-500/30 text-blue-200 rounded-full border border-blue-400/40">
                  {records.length} รายการ
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5 font-medium">
                เรียกดูและโหลดข้อมูลเก่ากลับมาแก้ไขใหม่ได้ทันที (100% Offline)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Local Storage Privacy & Security Banner */}
        <div className="px-6 py-3.5 bg-emerald-50/90 border-b border-emerald-200/80 flex items-start gap-3 shrink-0">
          <div className="p-1 rounded-lg bg-emerald-100 text-emerald-800 shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="text-xs text-emerald-950 leading-relaxed">
            <div className="font-extrabold text-emerald-950 flex items-center gap-1.5">
              <span>🔒 ความเป็นส่วนตัวสูงสุด: บันทึกเฉพาะในเครื่องของคุณ (Local Storage Only)</span>
            </div>
            <p className="text-emerald-900 font-medium mt-0.5">
              ข้อมูลประวัติทั้งหมดถูกเข้ารหัสและจัดเก็บอยู่ในพื้นที่หน่วยความจำของเบราว์เซอร์บนอุปกรณ์นี้เท่านั้น{' '}
              <strong className="underline decoration-emerald-600 font-bold">
                ไม่มีการส่งหรือจัดเก็บบนเซิร์ฟเวอร์อินเทอร์เน็ตใดๆ ทั้งสิ้น
              </strong>{' '}
              ข้อมูลจะคงอยู่แม้ปิดหน้าเว็บ ปลอดภัยตามมาตรฐานความลับผู้ป่วย
            </p>
          </div>
        </div>

        {/* Status Notification Toast */}
        {statusNotification && (
          <div className="px-6 py-2.5 bg-blue-50 text-blue-950 text-xs font-bold flex items-center justify-between border-b border-blue-200 animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>{statusNotification}</span>
            </div>
            <button
              onClick={() => setStatusNotification(null)}
              className="text-blue-500 hover:text-blue-800 font-bold text-sm"
            >
              &times;
            </button>
          </div>
        )}

        {/* Search & Tool Bar */}
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="ค้นหาตาม HN, ชื่อผู้ป่วย, การวินิจฉัย..."
              className="w-full clay-input pl-10 pr-8 py-2 text-xs text-slate-800 placeholder:text-slate-400 font-medium"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-0.5"
              >
                &times;
              </button>
            )}
          </div>

          {/* Action Buttons: Browse local file & backup */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
            {/* Hidden file input for Browse Local File */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportJsonFile}
              className="sr-only"
            />

            {/* Browse Local File (.json) Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="clay-btn clay-btn-pastel-amber text-xs px-3.5 py-2 font-bold flex items-center gap-1.5"
              title="เปิดไฟล์ประวัติ .json จากในคอมพิวเตอร์ของคุณ"
            >
              <FolderOpen className="w-4 h-4 text-amber-900 shrink-0" />
              <span>เปิดไฟล์จากเครื่อง (.json)</span>
            </button>

            {/* Export All Backup */}
            {records.length > 0 && (
              <button
                type="button"
                onClick={handleExportAllBackupJson}
                className="clay-btn clay-btn-secondary text-xs px-3 py-2 font-bold flex items-center gap-1.5"
                title="ดาวน์โหลดประวัติทั้งหมดเก็บไว้เป็นไฟล์ .json สำรอง"
              >
                <Download className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                <span className="hidden md:inline">สำรองประวัติทั้งหมด</span>
              </button>
            )}

            {/* Clear All */}
            {records.length > 0 && (
              <button
                type="button"
                onClick={() => setIsClearAllConfirmOpen(true)}
                className="clay-btn clay-btn-pastel-rose text-xs px-3 py-2 font-bold flex items-center gap-1"
                title="ล้างประวัติทั้งหมดที่บันทึกไว้ในเครื่องนี้"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ล้างประวัติ</span>
              </button>
            )}
          </div>
        </div>

        {/* Confirmation Modal for Clearing All */}
        {isClearAllConfirmOpen && (
          <div className="p-4 bg-rose-50 border-b border-rose-200 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn shrink-0">
            <div className="flex items-center gap-2.5 text-xs text-rose-900 font-medium">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>
                คุณแน่ใจหรือไม่ว่าต้องการลบประวัติการบันทึกทั้งหมด <strong>({records.length} รายการ)</strong> ออกจากเครื่องนี้?
              </span>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsClearAllConfirmOpen(false)}
                className="px-3 py-1 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
              >
                ยืนยันลบทั้งหมด
              </button>
            </div>
          </div>
        )}

        {/* Confirmation Banner for Loading a Record */}
        {selectedRecordToLoad && (
          <div className="p-4 bg-blue-50 border-b border-blue-300 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn shrink-0">
            <div className="flex items-start gap-2.5 text-xs text-blue-950">
              <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">
                  ต้องการโหลดข้อมูลผู้ป่วย "{selectedRecordToLoad.fullName}" (HN: {selectedRecordToLoad.hn}) เข้ามาในฟอร์มใช่หรือไม่?
                </div>
                <div className="text-slate-600 text-[11px] mt-0.5">
                  บันทึกเมื่อ: {formatThaiDateTime(selectedRecordToLoad.savedAt)} (ข้อมูลที่กำลังกรอกอยู่ปัจจุบันจะถูกแทนที่)
                </div>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedRecordToLoad(null)}
                className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => handleConfirmLoad(selectedRecordToLoad)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>โหลดข้อมูลมาแก้ไข</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Record List View */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-slate-50/50">
          {isLoading ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              กำลังโหลดรายการประวัติจาก Local Storage...
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-12 px-4 bg-white rounded-xl border border-dashed border-slate-300 max-w-lg mx-auto space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">
                  {searchTerm ? 'ไม่พบรายการที่ตรงกับคำค้นหา' : 'ยังไม่มีประวัติการบันทึกในเครื่องนี้'}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  {searchTerm
                    ? `ลองค้นหาด้วยคำอื่น เช่น HN หรือชื่อผู้ป่วย`
                    : `เมื่อคุณกรอกข้อมูลแบบประเมินและกดบันทึกหรือส่งออก PDF ระบบจะบันทึกประวัติลงใน Local Storage ของเครื่องให้อัตโนมัติ`}
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>เปิดไฟล์ .json จากเครื่อง</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRecords.map(rec => {
                const isSelected = selectedRecordToLoad?.id === rec.id;
                return (
                  <div
                    key={rec.id}
                    className={`clay-surface p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isSelected
                        ? 'ring-4 ring-blue-400 bg-blue-50/50'
                        : 'hover:translate-y-[-1px]'
                    }`}
                  >
                    {/* Patient & Assessment Details */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* HN Badge */}
                        <span className="px-2.5 py-0.5 bg-blue-100 text-blue-900 border border-blue-300 rounded-xl font-mono font-extrabold text-xs shadow-2xs">
                          HN: {rec.hn}
                        </span>

                        {/* Admission Type Badge */}
                        <span
                          className={`px-2.5 py-0.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider shadow-2xs ${
                            rec.admissionType === 'IPD'
                              ? 'bg-rose-100 text-rose-900 border border-rose-300'
                              : rec.admissionType === 'ER'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          }`}
                        >
                          {rec.admissionType || 'OPD'}
                        </span>

                        {/* Full Name */}
                        <span className="font-extrabold text-sm text-slate-900 truncate">
                          {rec.fullName}
                        </span>

                        {rec.age && (
                          <span className="text-xs text-slate-600 font-bold">
                            ({rec.age} ปี)
                          </span>
                        )}
                      </div>

                      {/* Primary Diagnosis */}
                      <div className="text-xs text-slate-700 truncate font-semibold flex items-center gap-1.5">
                        <span className="text-slate-400 font-normal">Dx:</span>
                        <span className="text-slate-900 font-bold">{rec.primaryDiagnosis}</span>
                      </div>

                      {/* Saved Timestamp */}
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600 pt-0.5 font-medium">
                        <span className="flex items-center gap-1 text-slate-700">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>วันที่ตรวจ: {rec.assessmentDate}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-blue-800 font-bold">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          <span>บันทึกล่าสุด: {formatThaiDateTime(rec.savedAt)}</span>
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      {/* Load to form button */}
                      <button
                        type="button"
                        onClick={() => setSelectedRecordToLoad(rec)}
                        className="clay-btn clay-btn-primary px-3.5 py-2 text-xs font-extrabold flex items-center gap-1.5"
                        title="โหลดข้อมูลนี้เข้าไปในแบบฟอร์มเพื่อแก้ไขหรือพิมพ์"
                      >
                        <FolderOpen className="w-4 h-4" />
                        <span>โหลดมาแก้ไข</span>
                      </button>

                      {/* Export single JSON file */}
                      <button
                        type="button"
                        onClick={() => handleExportSingleJson(rec)}
                        className="p-2 clay-btn clay-btn-secondary text-xs"
                        title="บันทึกข้อมูลผู้ป่วยรายนี้เป็นไฟล์ .json แยกเดี่ยว"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete single record */}
                      <button
                        type="button"
                        onClick={() => handleDelete(rec.id)}
                        className="p-2 clay-btn clay-btn-pastel-rose text-xs"
                        title="ลบรายการนี้ออกจากเครื่อง"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-slate-500">
            แสดง {filteredRecords.length} จากทั้งหมด {records.length} รายการที่บันทึกไว้ในเบราว์เซอร์
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};
