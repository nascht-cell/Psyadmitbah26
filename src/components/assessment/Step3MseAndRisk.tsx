import React from 'react';
import { Brain, ShieldAlert, Sparkles, AlertTriangle } from 'lucide-react';
import { AssessmentStepProps } from './AssessmentStepProps';
import { DebouncedInput } from './DebouncedInput';

const Step3MseAndRiskComponent: React.FC<AssessmentStepProps> = ({
  data,
  onChange,
  onApplyWnlMse,
  toggleArrayItem,
  toggleMseItem,
  handleSuicideRiskChange,
  handleViolenceRiskChange,
}) => {
  return (
    <div className="space-y-6">
      {/* SECTION D: Mental Status Examination (Mirrors A4 Document Page 2 Box 1) */}
      <section id="section-d" className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="px-6 py-3.5 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-base">
                D. Mental Status Examination (การตรวจสภาพจิต)
              </h3>
            </div>
            {onApplyWnlMse && (
              <button
                type="button"
                onClick={onApplyWnlMse}
                className="text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 font-semibold px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
                title="ตั้งค่า MSE ทั้งหมดเป็นปกติ (Normal / WNL)"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>ปกติทั้งหมด (WNL)</span>
              </button>
            )}
          </div>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">การประเมินสภาพจิต 9 มิติ (ปุ่มสีแดง/ส้ม = พบความผิดปกติ)</span>
        </div>

        <div className="p-6 space-y-5">
          {/* Appearance & Speech */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Appearance & Psychomotor
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Normal', isNormal: true },
                  { name: 'Poor hygiene', isNormal: false },
                  { name: 'Restless/Agitated', isNormal: false },
                  { name: 'Retardation', isNormal: false },
                  { name: 'Uncooperative', isNormal: false },
                  { name: 'EPS', isNormal: false },
                ].map(({ name: item, isNormal }) => {
                  const isSelected =
                    data.appearanceBehavior.includes(item) ||
                    (item === 'Poor hygiene' &&
                      (data.appearanceBehavior.includes('Unkempt') ||
                        data.appearanceBehavior.includes('Poor hygeine')));
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleMseItem('appearanceBehavior', item)}
                      className={`text-xs px-3 py-2 min-h-[38px] rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? isNormal
                            ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-2xs'
                            : 'bg-rose-600 text-white border-rose-600 font-bold shadow-xs ring-2 ring-rose-300/50'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Speech
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Normal', isNormal: true },
                  { name: 'Talkative/Pressured', isNormal: false },
                  { name: 'Slow/Poverty of speech', isNormal: false },
                  { name: 'Mute', isNormal: false },
                  { name: 'Slurred', isNormal: false },
                ].map(({ name: item, isNormal }) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleMseItem('speech', item)}
                    className={`text-xs px-3 py-2 min-h-[38px] rounded-lg border cursor-pointer transition-all ${
                      data.speech.includes(item)
                        ? isNormal
                          ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-2xs'
                          : 'bg-amber-600 text-white border-amber-600 font-bold shadow-xs ring-2 ring-amber-300/50'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mood & Thought Process */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Mood & Affect
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Euthymic', isNormal: true },
                  { name: 'Depressed', isNormal: false },
                  { name: 'Irritable/Angry', isNormal: false },
                  { name: 'Elevated/Expansive', isNormal: false },
                  { name: 'Blunted/Flat', isNormal: false },
                  { name: 'Inappropriate', isNormal: false },
                ].map(({ name: item, isNormal }) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleMseItem('moodAffect', item)}
                    className={`text-xs px-3 py-2 min-h-[38px] rounded-lg border cursor-pointer transition-all ${
                      data.moodAffect.includes(item)
                        ? isNormal
                          ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-2xs'
                          : 'bg-rose-600 text-white border-rose-600 font-bold shadow-xs ring-2 ring-rose-300/50'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Thought Process
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Logical/Coherent', isNormal: true },
                  { name: 'Circumstantial', isNormal: false },
                  { name: 'Tangential', isNormal: false },
                  { name: 'Flight of ideas', isNormal: false },
                  { name: 'Loosening of association', isNormal: false },
                  { name: 'Incoherent/Word salad', isNormal: false },
                ].map(({ name: item, isNormal }) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleMseItem('thoughtProcess', item)}
                    className={`text-xs px-3 py-2 min-h-[38px] rounded-lg border cursor-pointer transition-all ${
                      data.thoughtProcess.includes(item)
                        ? isNormal
                          ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-2xs'
                          : 'bg-amber-600 text-white border-amber-600 font-bold shadow-xs ring-2 ring-amber-300/50'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Thought Content & Perception */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Thought Content
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {[
                  { name: 'Normal', isNormal: true },
                  { name: 'Delusion', isNormal: false },
                  { name: 'Obsession/Compulsion', isNormal: false },
                  { name: 'Phobia', isNormal: false },
                  { name: 'Suicidal ideation', isNormal: false },
                  { name: 'Homicidal ideation', isNormal: false },
                ].map(({ name: item, isNormal }) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleMseItem('thoughtContent', item)}
                    className={`text-xs px-3 py-2 min-h-[38px] rounded-lg border cursor-pointer transition-all ${
                      data.thoughtContent.includes(item)
                        ? isNormal
                          ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-2xs'
                          : 'bg-rose-600 text-white border-rose-600 font-bold shadow-xs ring-2 ring-rose-300/50'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              {data.thoughtContent.includes('Delusion') && (
                <DebouncedInput
                  type="text"
                  value={data.delusionDetail}
                  onChangeValue={val => onChange({ delusionDetail: val })}
                  placeholder="ระบุประเภทและรายละเอียด Delusion เช่น Persecutory, Grandiose..."
                  className="w-full text-xs border border-rose-300 rounded-lg px-3 py-2 bg-rose-50/30 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Perception
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Normal', isNormal: true },
                  { name: 'Auditory Hallucination', isNormal: false },
                  { name: 'Visual Hallucination', isNormal: false },
                  { name: 'Illusion', isNormal: false },
                  { name: 'Depersonalization', isNormal: false },
                ].map(({ name: item, isNormal }) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleMseItem('perception', item)}
                    className={`text-xs px-3 py-2 min-h-[38px] rounded-lg border cursor-pointer transition-all ${
                      data.perception.includes(item)
                        ? isNormal
                          ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-2xs'
                          : 'bg-rose-600 text-white border-rose-600 font-bold shadow-xs ring-2 ring-rose-300/50'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cognition, Insight & Judgment */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-3 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Cognition - Orientation
              </label>
              <div className="flex gap-2">
                <label className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 min-h-[40px] rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                  data.orientationTime
                    ? 'bg-blue-50 border-blue-400 text-blue-900 font-semibold shadow-2xs'
                    : 'bg-slate-50 border-slate-300 text-slate-600 hover:bg-slate-100'
                }`}>
                  <input
                    type="checkbox"
                    checked={data.orientationTime}
                    onChange={e => onChange({ orientationTime: e.target.checked })}
                    className="rounded text-blue-600 w-4 h-4"
                  />
                  <span>Time</span>
                </label>
                <label className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 min-h-[40px] rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                  data.orientationPlace
                    ? 'bg-blue-50 border-blue-400 text-blue-900 font-semibold shadow-2xs'
                    : 'bg-slate-50 border-slate-300 text-slate-600 hover:bg-slate-100'
                }`}>
                  <input
                    type="checkbox"
                    checked={data.orientationPlace}
                    onChange={e => onChange({ orientationPlace: e.target.checked })}
                    className="rounded text-blue-600 w-4 h-4"
                  />
                  <span>Place</span>
                </label>
                <label className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 min-h-[40px] rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                  data.orientationPerson
                    ? 'bg-blue-50 border-blue-400 text-blue-900 font-semibold shadow-2xs'
                    : 'bg-slate-50 border-slate-300 text-slate-600 hover:bg-slate-100'
                }`}>
                  <input
                    type="checkbox"
                    checked={data.orientationPerson}
                    onChange={e => onChange({ orientationPerson: e.target.checked })}
                    className="rounded text-blue-600 w-4 h-4"
                  />
                  <span>Person</span>
                </label>
              </div>
              <div className="mt-3">
                <span className="text-xs text-slate-600 font-semibold block mb-1">Attention/Memory:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onChange({ attentionMemory: 'Intact' })}
                    className={`py-2 px-3 min-h-[38px] text-xs font-semibold rounded-lg border text-center transition-all cursor-pointer ${
                      data.attentionMemory === 'Intact'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    Intact (ปกติ)
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange({ attentionMemory: 'Impaired' })}
                    className={`py-2 px-3 min-h-[38px] text-xs font-semibold rounded-lg border text-center transition-all cursor-pointer ${
                      data.attentionMemory === 'Impaired'
                        ? 'bg-rose-600 text-white border-rose-600 font-bold shadow-xs ring-2 ring-rose-300/50'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    Impaired (บกพร่อง)
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Insight (1 - 6)
              </label>
              <select
                value={data.insight}
                onChange={e => onChange({ insight: e.target.value as any })}
                className={`w-full text-sm bg-white border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-600 focus:outline-none transition-colors ${
                  data.insight === '1(Denial)' || data.insight === '2' || data.insight === '3'
                    ? 'border-amber-400 bg-amber-50/40 text-amber-900 font-medium'
                    : 'border-slate-300 text-slate-800'
                }`}
              >
                <option value="1(Denial)">1 (Complete Denial of illness) - ปฏิเสธโรค</option>
                <option value="2">2 (Slight awareness but denying) - รู้สึกเล็กน้อยแต่ปฏิเสธ</option>
                <option value="3">3 (Aware but blaming others/external) - โทษผู้อื่น</option>
                <option value="4">4 (Aware illness is due to unknown internal) - รู้ว่าป่วยจากในตัว</option>
                <option value="5">5 (Intellectual insight) - ทราบแต่ปรับใช้ไม่ได้</option>
                <option value="6(True)">6 (True emotional insight) - เข้าใจอย่างแท้จริง</option>
              </select>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {data.insight === '6(True)' ? '🟢 ระดับความเข้าใจโรคสมบูรณ์' : data.insight === '1(Denial)' ? '🔴 ไม่ยอมรับว่ามีความเจ็บป่วย' : '🟡 มีความตระหนักรู้บางส่วน'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Judgment
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onChange({ judgment: 'Intact' })}
                  className={`py-2 px-3 min-h-[38px] text-xs font-semibold rounded-lg border text-center transition-all cursor-pointer ${
                    data.judgment === 'Intact'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Intact (ปกติ)
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ judgment: 'Impaired' })}
                  className={`py-2 px-3 min-h-[38px] text-xs font-semibold rounded-lg border text-center transition-all cursor-pointer ${
                    data.judgment === 'Impaired'
                      ? 'bg-rose-600 text-white border-rose-600 font-bold shadow-xs ring-2 ring-rose-300/50'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Impaired (บกพร่อง)
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION E: Safety & Risk Assessment (Mirrors A4 Document Page 2 Box 2) */}
      <section id="section-e" className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="px-6 py-3.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            <h3 className="font-bold text-slate-900 text-base">
              E. Safety & Risk Assessment (การประเมินความเสี่ยงด้านความปลอดภัย)
            </h3>
          </div>
          <span className="text-xs text-red-600 font-semibold flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            เกณฑ์เฝ้าระวังความปลอดภัย (Semantic Colors)
          </span>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Suicide Risk */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  1. Suicide / Self-harm Risk <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] font-semibold">
                  {data.suicideRisk === 'High Risk' && <span className="text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full font-bold">ความเสี่ยงสูงมาก</span>}
                  {data.suicideRisk === 'Moderate Risk' && <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-bold">ความเสี่ยงปานกลาง</span>}
                  {data.suicideRisk === 'Low Risk' && <span className="text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full">ความเสี่ยงต่ำ</span>}
                  {data.suicideRisk === 'No Risk' && <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">ไม่มีความเสี่ยง</span>}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { risk: 'No Risk', label: 'No Risk (ไม่มี)', activeCls: 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs' },
                  { risk: 'Low Risk', label: 'Low Risk (ต่ำ)', activeCls: 'bg-teal-600 text-white border-teal-600 font-bold shadow-xs' },
                  { risk: 'Moderate Risk', label: 'Moderate Risk (ปานกลาง)', activeCls: 'bg-amber-500 text-white border-amber-500 font-bold shadow-xs ring-2 ring-amber-300/50' },
                  { risk: 'High Risk', label: 'High Risk (สูง)', activeCls: 'bg-rose-600 text-white border-rose-600 font-bold shadow-xs ring-2 ring-rose-400/60 animate-pulse-once' },
                ].map(({ risk, label, activeCls }) => (
                  <button
                    key={risk}
                    type="button"
                    onClick={() => handleSuicideRiskChange(risk as any)}
                    className={`py-2.5 px-3 min-h-[42px] text-xs rounded-lg border text-center transition-all cursor-pointer ${
                      data.suicideRisk === risk
                        ? activeCls
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Violence Risk */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  2. Violence / Aggression Risk <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] font-semibold">
                  {data.violenceRisk === 'High Risk' && <span className="text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full font-bold">ความเสี่ยงสูงมาก</span>}
                  {data.violenceRisk === 'Moderate Risk' && <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-bold">ความเสี่ยงปานกลาง</span>}
                  {data.violenceRisk === 'Low Risk' && <span className="text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full">ความเสี่ยงต่ำ</span>}
                  {data.violenceRisk === 'No Risk' && <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">ไม่มีความเสี่ยง</span>}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { risk: 'No Risk', label: 'No Risk (ไม่มี)', activeCls: 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs' },
                  { risk: 'Low Risk', label: 'Low Risk (ต่ำ)', activeCls: 'bg-teal-600 text-white border-teal-600 font-bold shadow-xs' },
                  { risk: 'Moderate Risk', label: 'Moderate Risk (ปานกลาง)', activeCls: 'bg-amber-500 text-white border-amber-500 font-bold shadow-xs ring-2 ring-amber-300/50' },
                  { risk: 'High Risk', label: 'High Risk (สูง)', activeCls: 'bg-rose-600 text-white border-rose-600 font-bold shadow-xs ring-2 ring-rose-400/60 animate-pulse-once' },
                ].map(({ risk, label, activeCls }) => (
                  <button
                    key={risk}
                    type="button"
                    onClick={() => handleViolenceRiskChange(risk as any)}
                    className={`py-2.5 px-3 min-h-[42px] text-xs rounded-lg border text-center transition-all cursor-pointer ${
                      data.violenceRisk === risk
                        ? activeCls
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Other Risks */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              3. Other Risks (ความเสี่ยงอื่นๆ)
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { risk: 'None', label: 'None (ไม่มีความเสี่ยงอื่น)', isSafe: true },
                { risk: 'Falls', label: 'Falls (พลัดตกหกล้ม)', isSafe: false },
                { risk: 'Escape', label: 'Escape (หลบหนี)', isSafe: false },
                { risk: 'Abuse/Neglect', label: 'Abuse/Neglect (ถูกทอดทิ้ง/ทำร้าย)', isSafe: false },
                { risk: 'Medication ADR', label: 'Medication ADR (แพ้ยา/ผลข้างเคียง)', isSafe: false },
              ].map(({ risk, label, isSafe }) => {
                const isSelected =
                  data.otherRisks.includes(risk) ||
                  (risk === 'Escape' && data.otherRisks.includes('Wandering/Elopement'));
                return (
                  <button
                    key={risk}
                    type="button"
                    onClick={() => toggleArrayItem('otherRisks', risk)}
                    className={`text-xs px-3.5 py-2 min-h-[38px] rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? isSafe
                          ? 'bg-emerald-600 text-white border-emerald-600 font-semibold shadow-2xs'
                          : 'bg-amber-600 text-white border-amber-600 font-bold shadow-xs ring-2 ring-amber-300/40'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Safety Plan if Moderate or High */}
          {(data.suicideRisk === 'Moderate Risk' ||
            data.suicideRisk === 'High Risk' ||
            data.violenceRisk === 'Moderate Risk' ||
            data.violenceRisk === 'High Risk') && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-3">
              <label className="block text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Safety Plan (แผนความปลอดภัยเนื่องจากมีความเสี่ยง Moderate/High)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  'Admit สังเกตอาการใกล้ชิด',
                  'แจ้งญาติดูแล 24 ชม.',
                  'Restraint/Seclusion',
                ].map(plan => (
                  <button
                    key={plan}
                    type="button"
                    onClick={() => toggleArrayItem('safetyPlan', plan)}
                    className={`text-xs px-3.5 py-2 min-h-[38px] rounded-lg border cursor-pointer transition-all ${
                      data.safetyPlan.includes(plan)
                        ? 'bg-rose-700 text-white border-rose-700 font-bold shadow-xs'
                        : 'bg-white text-rose-900 border-rose-300 hover:bg-rose-100'
                    }`}
                  >
                    {plan}
                  </button>
                ))}
              </div>
              <DebouncedInput
                type="text"
                value={data.safetyPlanOther}
                onChangeValue={val => onChange({ safetyPlanOther: val })}
                placeholder="ระบุแผนความปลอดภัยอื่นๆ เพิ่มเติม..."
                className="w-full text-xs bg-white border border-rose-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-rose-600 focus:outline-none"
              />
            </div>
          )}
        </div>
      </section>

      {/* SECTION H: Standardized Assessment */}
      <section id="section-h" className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="px-6 py-3.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">
            H. Standardized Assessment (เครื่องมือประเมินมาตรฐาน)
          </h3>
          <span className="text-xs text-slate-500 font-medium">PHQ-9, 9Q, MMSE-Thai</span>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex flex-wrap gap-2 mb-2">
            <button
              type="button"
              onClick={() => onChange({ standardizedAssessmentStatus: 'ไม่ได้ประเมิน' })}
              className={`px-4 py-2 min-h-[40px] text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                data.standardizedAssessmentStatus === 'ไม่ได้ประเมิน'
                  ? 'bg-slate-700 text-white border-slate-700 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              ไม่ได้ประเมิน
            </button>
            <button
              type="button"
              onClick={() => onChange({ standardizedAssessmentStatus: 'ประเมิน' })}
              className={`px-4 py-2 min-h-[40px] text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                data.standardizedAssessmentStatus === 'ประเมิน'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              ประเมิน (ระบุคะแนน)
            </button>
          </div>

          {data.standardizedAssessmentStatus === 'ประเมิน' && (
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs p-2 bg-slate-50 rounded-lg">
                <span className="font-semibold text-slate-800">PHQ-9 (แบบประเมินโรคซึมเศร้า):</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max="27"
                    value={data.phq9Score}
                    onChange={e => onChange({ phq9Score: e.target.value })}
                    placeholder="0-27"
                    className="w-24 text-center border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white font-mono font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                  <span className="font-medium text-slate-600">คะแนน</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs p-2 bg-slate-50 rounded-lg">
                <span className="font-semibold text-slate-800">9Q (แบบคัดกรองโรคซึมเศร้า):</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max="27"
                    value={data.nineQScore}
                    onChange={e => onChange({ nineQScore: e.target.value })}
                    placeholder="0-27"
                    className="w-24 text-center border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white font-mono font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                  <span className="font-medium text-slate-600">คะแนน</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs p-2 bg-slate-50 rounded-lg">
                <span className="font-semibold text-slate-800">MMSE-Thai / MoCA:</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={data.mmseMocaScore}
                    onChange={e => onChange({ mmseMocaScore: e.target.value })}
                    placeholder="0-30"
                    className="w-24 text-center border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white font-mono font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                  <span className="font-medium text-slate-600">คะแนน</span>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-2 pt-1">
                <DebouncedInput
                  type="text"
                  value={data.otherToolName}
                  onChangeValue={val => onChange({ otherToolName: val })}
                  placeholder="ชื่อเครื่องมืออื่นๆ..."
                  className="col-span-8 text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
                <DebouncedInput
                  type="text"
                  value={data.otherToolScore}
                  onChangeValue={val => onChange({ otherToolScore: val })}
                  placeholder="คะแนน"
                  className="col-span-4 text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white font-mono font-bold text-center focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export const Step3MseAndRisk = React.memo(Step3MseAndRiskComponent, (prevProps, nextProps) => {
  const step3Keys: (keyof typeof prevProps.data)[] = [
    'appearanceBehavior',
    'speech',
    'moodAffect',
    'thoughtProcess',
    'thoughtContent',
    'delusionDetail',
    'perception',
    'orientationTime',
    'orientationPlace',
    'orientationPerson',
    'attentionMemory',
    'insight',
    'judgment',
    'suicideRisk',
    'violenceRisk',
    'otherRisks',
    'safetyPlan',
    'safetyPlanOther',
    'standardizedAssessmentStatus',
    'phq9Score',
    'nineQScore',
    'mmseMocaScore',
    'otherToolName',
    'otherToolScore'
  ];

  for (const key of step3Keys) {
    if (prevProps.data[key] !== nextProps.data[key]) {
      return false;
    }
  }

  return true;
});
