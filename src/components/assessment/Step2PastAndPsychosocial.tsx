import React from 'react';
import { HeartPulse, Users, CheckSquare, Check, AlertCircle, Clock, Wine, Cigarette, Flame, Pill } from 'lucide-react';
import { AssessmentStepProps } from './AssessmentStepProps';
import { DebouncedInput } from './DebouncedInput';

const Step2PastAndPsychosocialComponent: React.FC<AssessmentStepProps> = ({
  data,
  onChange,
  onBlurField,
  toggleArrayItem,
}) => {
  return (
    <div className="space-y-6">
      {/* SECTION C: Psychiatric / Medical History (Mirrors A4 Document Page 1 Box 3) */}
      <section id="section-c" className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="px-6 py-3.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">
              C. Psychiatric / Medical / Medication History (ประวัติอดีต)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">ประวัติจิตเวช ทางกาย ยา และสารเสพติด</span>
        </div>

        <div className="p-6 space-y-6">
          {/* Psychiatric History */}
          <div className="border-b border-slate-100 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider sm:w-64 shrink-0">
                ประวัติจิตเวชเดิม:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onChange({ psychiatricHistory: 'ไม่มีประวัติ' })}
                  className={`px-4 py-2 min-h-[40px] text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    data.psychiatricHistory === 'ไม่มีประวัติ'
                      ? 'bg-slate-700 text-white border-slate-700 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  ไม่มีประวัติ
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ psychiatricHistory: 'มีประวัติ' })}
                  className={`px-4 py-2 min-h-[40px] text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    data.psychiatricHistory === 'มีประวัติ'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  มีประวัติ (ระบุกลุ่มโรค)
                </button>
              </div>
            </div>

            {data.psychiatricHistory === 'มีประวัติ' && (
              <div className="mt-3 p-3.5 bg-blue-50/40 rounded-xl border border-blue-200 space-y-3">
                <span className="text-xs font-semibold text-blue-900 block">เลือกกลุ่มโรคจิตเวชเดิม:</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Depressive d/o',
                    'Bipolar d/o',
                    'Schizophrenia/Psychotic d/o',
                    'Anxiety d/o',
                    'Substance Related d/o',
                    'Dementia',
                  ].map(dx => (
                    <button
                      key={dx}
                      type="button"
                      onClick={() => toggleArrayItem('psychiatricDisorders', dx)}
                      className={`text-xs px-3 py-2 min-h-[38px] rounded-lg border cursor-pointer transition-all ${
                        data.psychiatricDisorders.includes(dx)
                          ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {dx}
                    </button>
                  ))}
                </div>
                <DebouncedInput
                  type="text"
                  value={data.psychiatricDisorderOther}
                  onChangeValue={val => onChange({ psychiatricDisorderOther: val })}
                  onBlur={e => onBlurField && onBlurField('psychiatricDisorderOther', e.target.value)}
                  placeholder="ระบุโรคจิตเวชอื่นๆ..."
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            )}

            {/* Admit history */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-4 pt-4 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider sm:w-64 shrink-0">
                ประวัติเคย Admit:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onChange({ admitHistory: 'ไม่เคย', admitLastYear: '' })}
                    className={`px-4 py-2 min-h-[40px] text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      data.admitHistory === 'ไม่เคย'
                        ? 'bg-slate-700 text-white border-slate-700 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    ไม่เคย
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange({ admitHistory: 'เคย' })}
                    className={`px-4 py-2 min-h-[40px] text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      data.admitHistory === 'เคย'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    เคย Admit
                  </button>
                </div>
                {data.admitHistory === 'เคย' && (
                  <div className="flex items-center gap-1.5 ml-1 animate-fadeIn">
                    <span className="text-xs text-slate-600 font-medium">ปีล่าสุด:</span>
                    <input
                      type="text"
                      value={data.admitLastYear}
                      onChange={e => onChange({ admitLastYear: e.target.value })}
                      placeholder="เช่น 2566"
                      className="w-28 text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white font-mono"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Medical History */}
          <div className="border-b border-slate-100 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider sm:w-64 shrink-0">
                ประวัติโรคทางกาย (Medical Hx):
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onChange({ medicalHistory: 'ไม่มีโรคประจำตัว' })}
                  className={`px-4 py-2 min-h-[40px] text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    data.medicalHistory === 'ไม่มีโรคประจำตัว'
                      ? 'bg-slate-700 text-white border-slate-700 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  ไม่มีโรคประจำตัว
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ medicalHistory: 'มีโรคประจำตัว' })}
                  className={`px-4 py-2 min-h-[40px] text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    data.medicalHistory === 'มีโรคประจำตัว'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  มีโรคประจำตัว
                </button>
              </div>
            </div>

            {data.medicalHistory === 'มีโรคประจำตัว' && (
              <div className="mt-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-semibold text-slate-800 block">เลือกโรคทางกายที่มี:</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    'HT',
                    'DM',
                    'DLP',
                    'Thyroid',
                    'Epilepsy/Seizure',
                    'Stroke/Neuro',
                    'Heart disease',
                    'CKD',
                  ].map(cond => (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => toggleArrayItem('medicalConditions', cond)}
                      className={`text-xs px-3 py-2 min-h-[38px] rounded-lg border cursor-pointer transition-all ${
                        data.medicalConditions.includes(cond)
                          ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {cond}
                    </button>
                  ))}
                </div>
                <DebouncedInput
                  type="text"
                  value={data.medicalHistoryOther}
                  onChangeValue={val => onChange({ medicalHistoryOther: val })}
                  placeholder="ระบุโรคทางกายอื่นๆ..."
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Allergy */}
          <div className="border-b border-slate-100 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider sm:w-64 shrink-0">
                ประวัติแพ้ยา/อาหาร (Allergy):
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onChange({ allergy: 'ปฏิเสธการแพ้', allergyDetail: '' })}
                  className={`px-4 py-2 min-h-[40px] text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    data.allergy === 'ปฏิเสธการแพ้'
                      ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  ปฏิเสธการแพ้ (No known allergies)
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ allergy: 'แพ้' })}
                  className={`px-4 py-2 min-h-[40px] text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    data.allergy === 'แพ้'
                      ? 'bg-rose-600 text-white border-rose-600 font-bold shadow-xs ring-2 ring-rose-400/50'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  ⚠️ มีประวัติแพ้ (ระบุชื่อและอาการ)
                </button>
              </div>
            </div>

            {data.allergy === 'แพ้' && (
              <div className="mt-3 p-3.5 bg-rose-50 border border-rose-300 rounded-xl space-y-2">
                <label className="block text-xs font-bold text-rose-900">
                  ระบุรายละเอียดการแพ้ยา/อาหาร/สารเคมี:
                </label>
                <DebouncedInput
                  type="text"
                  value={data.allergyDetail}
                  onChangeValue={val => onChange({ allergyDetail: val })}
                  placeholder="ระบุชื่อยา/อาหาร และลักษณะอาการแพ้ เช่น ผื่น ลมพิษ แน่นหน้าอก หายใจไม่ออก..."
                  className="w-full text-xs bg-white border border-rose-300 rounded-lg px-3 py-2 text-rose-950 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            )}
          </div>

          {/* Substance History */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider sm:w-64 shrink-0">
                ประวัติการใช้สารเสพติด (Substance Hx):
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onChange({ substanceHistory: 'ปฏิเสธการใช้' })}
                  className={`px-4 py-2 min-h-[40px] text-xs font-semibold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                    data.substanceHistory === 'ปฏิเสธการใช้'
                      ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {data.substanceHistory === 'ปฏิเสธการใช้' && <Check className="w-3.5 h-3.5" />}
                  <span>ปฏิเสธการใช้สารเสพติดทุกชนิด</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ substanceHistory: 'มีประวัติ' })}
                  className={`px-4 py-2 min-h-[40px] text-xs font-semibold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                    data.substanceHistory === 'มีประวัติ'
                      ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs ring-2 ring-blue-300/60'
                      : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {data.substanceHistory === 'มีประวัติ' && <Check className="w-3.5 h-3.5" />}
                  <span>มีประวัติการใช้ (ระบุชนิดและความถี่)</span>
                </button>
              </div>
            </div>

            {/* Cascading Progressive Disclosure for Substance Use */}
            {data.substanceHistory === 'มีประวัติ' && (
              <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 animate-fadeIn">
                <div className="text-xs font-semibold text-slate-600 mb-1">
                  กรุณาเลือกสารเสพติดและระบุระดับความถี่/ระยะเวลาที่เกี่ยวข้อง:
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 1. Alcohol */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700">
                        <Wine className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">แอลกอฮอล์ / สุรา (Alcohol)</h4>
                        <span className="text-[11px] text-slate-500">ความถี่และระยะเวลาดื่มล่าสุด</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-slate-600 block">ความถี่ในการดื่ม:</span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { label: 'ไม่ดื่ม/ปฏิเสธ', val: '' },
                          { label: 'นานๆ ครั้ง', val: 'นานๆ ครั้ง' },
                          { label: 'ดื่มประจำ/ติด', val: 'ดื่มประจำ/ติด' },
                        ].map(item => {
                          const isSelected = item.val === '' ? !data.alcoholUse : data.alcoholUse === item.val || (item.val === 'ดื่มประจำ/ติด' && data.alcoholUse.includes('ดื่มประจำ'));
                          return (
                            <button
                              key={item.label}
                              type="button"
                              onClick={() => onChange({ alcoholUse: item.val as any })}
                              className={`py-2 px-1.5 text-xs rounded-lg border text-center font-medium transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-2xs'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {item.label}
                            </button>
                          );
                        })}
                      </div>

                      {/* Alcohol Time Modifier */}
                      <button
                        type="button"
                        onClick={() => {
                          const isRecent = data.alcoholUse === 'เพิ่งดื่มล่าสุด < 24 ชม.';
                          onChange({ alcoholUse: isRecent ? 'นานๆ ครั้ง' : 'เพิ่งดื่มล่าสุด < 24 ชม.' });
                        }}
                        className={`w-full mt-2 py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                          data.alcoholUse === 'เพิ่งดื่มล่าสุด < 24 ชม.'
                            ? 'bg-rose-50 border-rose-300 text-rose-800 ring-1 ring-rose-400 font-bold'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>เพิ่งดื่มล่าสุด &lt; 24 ชั่วโมง</span>
                        </span>
                        {data.alcoholUse === 'เพิ่งดื่มล่าสุด < 24 ชม.' ? (
                          <span className="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded-md font-bold">มีภาวะเสี่ยง</span>
                        ) : (
                          <span className="text-[10px] text-slate-400">คลิกหากมี</span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* 2. Smoking */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <div className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700">
                        <Cigarette className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">บุหรี่ / ยาสูบ (Smoking / Tobacco)</h4>
                        <span className="text-[11px] text-slate-500">ความถี่และปริมาณการสูบ</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-slate-600 block">ความถี่ในการสูบ:</span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { label: 'ไม่สูบ/ปฏิเสธ', val: '' },
                          { label: 'นานๆ ครั้ง', val: 'นานๆ ครั้ง' },
                          { label: 'สูบประจำ', val: 'สูบประจำ' },
                        ].map(item => {
                          const isSelected = item.val === '' ? !data.smokingUse : data.smokingUse === item.val;
                          return (
                            <button
                              key={item.label}
                              type="button"
                              onClick={() => onChange({ smokingUse: item.val as any })}
                              className={`py-2 px-1.5 text-xs rounded-lg border text-center font-medium transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-2xs'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {item.label}
                            </button>
                          );
                        })}
                      </div>

                      {/* Quantity Input when Regular */}
                      {data.smokingUse === 'สูบประจำ' && (
                        <div className="mt-2 p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg flex items-center justify-between gap-2 animate-fadeIn">
                          <label className="text-xs font-semibold text-blue-900 shrink-0">
                            ปริมาณที่สูบ:
                          </label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={data.cigarettesPerDay}
                              onChange={e => onChange({ cigarettesPerDay: e.target.value })}
                              placeholder="เช่น 10"
                              className="w-20 border border-blue-300 rounded-md px-2 py-1 bg-white text-xs font-mono text-center font-bold text-blue-950 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                            />
                            <span className="text-xs text-blue-800 font-medium">มวน/วัน</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 3. Meth / Stimulants */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <div className="p-1.5 rounded-lg bg-red-50 border border-red-200 text-red-700">
                        <Flame className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">ยาบ้า / ไอซ์ / สารกระตุ้นประสาท</h4>
                        <span className="text-[11px] text-slate-500">Amphetamine / Methamphetamine</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-slate-600 block">รูปแบบการใช้:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                        {[
                          { label: 'ไม่เคยใช้/ปฏิเสธ', val: '' },
                          { label: 'เคยใช้ในอดีต (เลิกแล้ว)', val: 'เคยใช้ในอดีต (เลิกแล้ว)' },
                          { label: 'ปัจจุบันยังใช้', val: 'ปัจจุบันยังใช้' },
                        ].map(item => {
                          const isSelected = item.val === '' ? !data.methUse : data.methUse === item.val;
                          return (
                            <button
                              key={item.label}
                              type="button"
                              onClick={() => onChange({ methUse: item.val as any })}
                              className={`py-2 px-1.5 text-xs rounded-lg border text-center font-medium transition-all cursor-pointer ${
                                isSelected
                                  ? item.val === 'ปัจจุบันยังใช้'
                                    ? 'bg-rose-600 text-white border-rose-600 font-bold shadow-2xs'
                                    : 'bg-blue-600 text-white border-blue-600 font-bold shadow-2xs'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {item.label}
                            </button>
                          );
                        })}
                      </div>

                      {/* Meth Time Modifier */}
                      <button
                        type="button"
                        onClick={() => {
                          const isRecent = data.methUse === 'เพิ่งใช้ล่าสุด < 24 ชม.';
                          onChange({ methUse: isRecent ? 'ปัจจุบันยังใช้' : 'เพิ่งใช้ล่าสุด < 24 ชม.' });
                        }}
                        className={`w-full mt-2 py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                          data.methUse === 'เพิ่งใช้ล่าสุด < 24 ชม.'
                            ? 'bg-rose-100 border-rose-400 text-rose-900 ring-2 ring-rose-400 font-bold'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>เพิ่งใช้ล่าสุด &lt; 24 ชั่วโมง</span>
                        </span>
                        {data.methUse === 'เพิ่งใช้ล่าสุด < 24 ชม.' ? (
                          <span className="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded-md font-bold">เฝ้าระวังถอนพิษ/ก้าวร้าว</span>
                        ) : (
                          <span className="text-[10px] text-slate-400">คลิกหากมี</span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* 4. Other Substances */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <div className="p-1.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-700">
                        <Pill className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">สารเสพติดอื่นๆ (Other Substances)</h4>
                        <span className="text-[11px] text-slate-500">เลือกได้หลายข้อ (Multi-select)</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-slate-600 block">ชนิดสารเสพติด:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { id: 'กัญชา', label: 'กัญชา (Cannabis)' },
                          { id: 'กระท่อม', label: 'กระท่อม (Kratom)' },
                          { id: 'สารระเหย', label: 'สารระเหย (Inhalants)' },
                          { id: 'Opioid', label: 'Opioid (มอร์ฟีน/เฮโรอีน/ทรามาดอล)' },
                          { id: 'อื่นๆ', label: 'อื่นๆ (ระบุ)' },
                        ].map(item => {
                          const isChecked = data.otherSubstances.includes(item.id) || (item.id === 'Opioid' && data.otherSubstances.some(s => s.includes('Opioid') || s.includes('ยานอนหลับ')));
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => toggleArrayItem('otherSubstances', item.id)}
                              className={`text-xs px-3 py-2 min-h-[38px] rounded-lg border cursor-pointer transition-all flex items-center gap-1.5 ${
                                isChecked
                                  ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              <div
                                className={`w-3.5 h-3.5 rounded flex items-center justify-center ${
                                  isChecked ? 'bg-white text-blue-600' : 'border border-slate-300 bg-white'
                                }`}
                              >
                                {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <span>{item.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Detail Input for other substances */}
                      {(data.otherSubstances.includes('อื่นๆ') || data.otherSubstances.length > 0 || data.otherSubstancesDetail) && (
                        <div className="mt-2 animate-fadeIn">
                          <DebouncedInput
                            type="text"
                            value={data.otherSubstancesDetail}
                            onChangeValue={val => onChange({ otherSubstancesDetail: val })}
                            placeholder="ระบุรายละเอียดเพิ่มเติมเกี่ยวกับสารเสพติดอื่นๆ..."
                            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION G: Psychosocial Assessment (Mirrors A4 Document Page 2 Box 4) */}
      <section id="section-g" className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="px-6 py-3.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">
              G. Psychosocial Assessment (การประเมินด้านจิตสังคม)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">ความเครียด สิ่งแวดล้อม และครอบครัว</span>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Psychosocial Stressors (ปัจจัยกระตุ้นความเครียด)
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                'ปัญหาความสัมพันธ์/ครอบครัว',
                'ปัญหาการเงิน/หนี้สิน',
                'ปัญหาการงาน/การเรียน',
                'การเจ็บป่วยทางกายรุนแรง',
                'การสูญเสีย (Bereavement)',
                'ปัญหาคดีความ/กฎหมาย',
                'ขาดผู้ดูแล/ถูกทอดทิ้ง',
                'ไม่มี/ไม่ชัดเจน',
              ].map(item => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleArrayItem('psychosocialStressors', item)}
                  className={`text-xs px-3 py-2 min-h-[38px] rounded-lg border cursor-pointer transition-all ${
                    data.psychosocialStressors.includes(item)
                      ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Living Environment (สภาพแวดล้อมความเป็นอยู่)
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onChange({ livingEnvironment: 'ปลอดภัยและเหมาะสม' })}
                className={`px-4 py-2 min-h-[40px] text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                  data.livingEnvironment === 'ปลอดภัยและเหมาะสม'
                    ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                ปลอดภัยและเหมาะสม
              </button>
              <button
                type="button"
                onClick={() => onChange({ livingEnvironment: 'ไม่ปลอดภัย/ไม่เหมาะสมต่อการฟื้นฟู' })}
                className={`px-4 py-2 min-h-[40px] text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                  data.livingEnvironment === 'ไม่ปลอดภัย/ไม่เหมาะสมต่อการฟื้นฟู'
                    ? 'bg-amber-600 text-white border-amber-600 font-bold shadow-xs ring-2 ring-amber-300/50'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                ⚠️ ไม่ปลอดภัย/ไม่เหมาะสมต่อการฟื้นฟู
              </button>
            </div>
            {data.livingEnvironment === 'ไม่ปลอดภัย/ไม่เหมาะสมต่อการฟื้นฟู' && (
              <DebouncedInput
                type="text"
                value={data.livingEnvironmentDetail}
                onChangeValue={val => onChange({ livingEnvironmentDetail: val })}
                placeholder="ระบุเหตุผล เช่น อยู่ลำพัง, สภาพแวดล้อมเสี่ยง, ขาดผู้ดูแล..."
                className="w-full text-xs border border-amber-300 rounded-lg px-3 py-2 mt-2 bg-amber-50/30 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export const Step2PastAndPsychosocial = React.memo(Step2PastAndPsychosocialComponent, (prevProps, nextProps) => {
  const step2Keys: (keyof typeof prevProps.data)[] = [
    'psychiatricHistory',
    'psychiatricDisorders',
    'psychiatricDisorderOther',
    'admitHistory',
    'admitLastYear',
    'medicalHistory',
    'medicalConditions',
    'medicalHistoryOther',
    'allergy',
    'allergyDetail',
    'substanceHistory',
    'alcoholUse',
    'smokingUse',
    'cigarettesPerDay',
    'methUse',
    'otherSubstances',
    'otherSubstancesDetail',
    'psychosocialStressors',
    'livingEnvironment',
    'livingEnvironmentDetail'
  ];

  for (const key of step2Keys) {
    if (prevProps.data[key] !== nextProps.data[key]) {
      return false;
    }
  }

  return true;
});
