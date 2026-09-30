import React, { useRef } from 'react';
import { Check, User, Activity, Calendar, Clock, CheckSquare, History, FolderOpen, ShieldCheck, Upload } from 'lucide-react';
import { AssessmentStepProps } from './AssessmentStepProps';
import { parseFullName, constructFullName } from '../../types/assessment';
import { DebouncedInput } from './DebouncedInput';
import { DebouncedTextarea } from './DebouncedTextarea';

const Step1PatientAndComplaintComponent: React.FC<AssessmentStepProps> = ({
  data,
  onChange,
  errors,
  onBlurField,
  toggleArrayItem,
  handleDurationChange,
  onOpenHistoryModal,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDirectFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async event => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const assessmentData = parsed.data || parsed;
        if (assessmentData && (assessmentData.hospitalName !== undefined || assessmentData.hn !== undefined)) {
          if (assessmentData.fullName && (!assessmentData.firstName || !assessmentData.lastName)) {
            const parsedName = parseFullName(assessmentData.fullName);
            assessmentData.titlePrefix = assessmentData.titlePrefix || parsedName.titlePrefix;
            assessmentData.firstName = assessmentData.firstName || parsedName.firstName;
            assessmentData.lastName = assessmentData.lastName || parsedName.lastName;
          }
          onChange(assessmentData);
          const { saveToLocalHistory } = await import('../../utils/storage');
          await saveToLocalHistory(assessmentData);
        }
      } catch (err) {
        console.error('Error importing JSON file:', err);
      }
    };
    reader.readAsText(file);
    if (e.target) {
      e.target.value = '';
    }
  };
  return (
    <div className="space-y-6">
      {/* 0. Official Document Header Card (Mirrors A4 Document Header) */}
      <div className="clay-surface overflow-hidden">
        <div className="bg-slate-900 text-white px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-t-[26px]">
          <div className="flex items-center gap-3.5">
            <div className="h-14 w-auto flex items-center justify-center shrink-0 p-1 bg-white/10 rounded-2xl">
              <img
                src="/Official_emblem_of_Bhumibol_Adulyadej_Hospital.jpg"
                alt="ตราสัญลักษณ์โรงพยาบาลภูมิพลอดุลยเดช"
                className="h-12 w-auto object-contain shrink-0 drop-shadow-sm"
                style={{ aspectRatio: '200 / 283' }}
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Bhumibol Adulyadej Hospital · กองจิตเวชและประสาทวิทยา
              </div>
              <h2 className="text-lg font-extrabold text-white mt-0.5">
                แบบบันทึกแรกรับผู้ป่วยจิตเวช (Mental Health Admission Form)
              </h2>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-2 bg-slate-800/90 px-3.5 py-2 rounded-2xl border border-slate-700 shadow-2xs">
              <Calendar className="w-4 h-4 text-blue-400" />
              <input
                type="date"
                value={data.assessmentDate}
                onChange={e => onChange({ assessmentDate: e.target.value })}
                onBlur={e => onBlurField && onBlurField('assessmentDate', e.target.value)}
                className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-2 bg-slate-800/90 px-3.5 py-2 rounded-2xl border border-slate-700 shadow-2xs">
              <Clock className="w-4 h-4 text-blue-400" />
              <input
                type="time"
                value={data.assessmentTime}
                onChange={e => onChange({ assessmentTime: e.target.value })}
                onBlur={e => onBlurField && onBlurField('assessmentTime', e.target.value)}
                className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50/70 border-b border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                แผนก
              </label>
              <input
                type="text"
                value={data.department}
                onChange={e => onChange({ department: e.target.value })}
                className="w-full text-sm clay-input px-3.5 py-2 font-medium"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                ประเภทการรับผู้ป่วย <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2 mt-1">
                {(['OPD', 'IPD', 'ER'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => onChange({ admissionType: type })}
                    className={`px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                      data.admissionType === type
                        ? 'clay-pill-active'
                        : 'clay-pill-inactive'
                    }`}
                  >
                    <span>{type}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Clinical Presets Bar for Human Input Speed */}
          <div className="mt-5 pt-4 border-t border-slate-200/80">
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="text-amber-500 font-extrabold text-sm">⚡</span>
                <span>1 Click Fast fill</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {/* Preset 1: Severe MDD */}
              <button
                type="button"
                onClick={() => {
                  const indications = new Set(data.admissionIndications || []);
                  indications.add('เป็นอันตรายต่อตนเอง (Risk of Harm to Self)');
                  onChange({
                    admissionType: 'IPD',
                    chiefComplaint: ['ซึมเศร้า/ท้อแท้', 'อยากตาย/พยายามทำร้ายตนเอง'],
                    duration: '1-4 สัปดาห์',
                    onset: 'เฉียบพลัน (Acute)',
                    course: 'แย่ลงเรื่อยๆ (Progressive)',
                    associatedSymptoms: ['นอนไม่หลับ', 'เบื่ออาหาร', 'อ่อนเพลีย'],
                    appearanceBehavior: ['Retardation'],
                    speech: ['Slow/Poverty of speech'],
                    moodAffect: ['Depressed'],
                    thoughtProcess: ['Logical/Coherent'],
                    thoughtContent: ['Suicidal ideation'],
                    perception: ['Normal'],
                    suicideRisk: 'High Risk',
                    violenceRisk: 'No Risk',
                    admissionIndications: Array.from(indications),
                    safetyPlan: ['Admit สังเกตอาการใกล้ชิด', 'แจ้งญาติดูแล 24 ชม.'],
                    standardizedAssessmentStatus: 'ประเมิน',
                    phq9Score: '24',
                    nineQScore: '22',
                    diagnosticCategory: ['F30-F39 Mood d/o'],
                    primaryDiagnosis: 'Major Depressive Episode, Severe without Psychotic Features (F32.2)',
                    pharmPlan: 'ปรับ/เริ่มยาใหม่',
                    medicationGroups: ['Antidepressants', 'Anxiolytics/Sedatives'],
                    medicationDetails: 'Sertraline (100) 1 tab po pc morning, Lorazepam (1) 1 tab po hs',
                    generalAppearance: 'Normal', heent: 'Normal', cvsRs: 'Normal', abdomen: 'Normal', extremities: 'Normal',
                    cranialNerves: 'Grossly intact', motorPower: 'Grade V all', tone: 'Normal', sensory: 'Intact', reflexes: 'Normal', cerebellar: 'Normal'
                  });
                }}
                className="clay-btn clay-btn-pastel-rose px-3.5 py-2 text-xs font-bold gap-1.5"
                title="Severe MDD with High Suicide Risk & IPD Admission"
              >
                <span>🚨 Severe MDD</span>
              </button>

              {/* Preset 2: Psychosis Relapse */}
              <button
                type="button"
                onClick={() => {
                  onChange({
                    admissionType: 'IPD',
                    chiefComplaint: ['หูแว่ว/ประสาทหลอน', 'หวาดระแวง/หลงผิด'],
                    duration: '1-6 เดือน',
                    onset: 'ค่อยเป็นค่อยไป (Gradual)',
                    course: 'แย่ลงเรื่อยๆ (Progressive)',
                    precipitatingFactors: ['ขาดยา'],
                    associatedSymptoms: ['นอนไม่หลับ', 'พฤติกรรมแปลกไปจากเดิม'],
                    appearanceBehavior: ['Poor hygiene', 'Restless/Agitated'],
                    speech: ['Talkative/Pressured'],
                    moodAffect: ['Irritable/Angry'],
                    thoughtProcess: ['Circumstantial'],
                    thoughtContent: ['Delusion'],
                    delusionDetail: 'Persecutory delusion (ระแวงคนทำร้าย)',
                    perception: ['Auditory Hallucination'],
                    suicideRisk: 'No Risk',
                    violenceRisk: 'Moderate Risk',
                    admissionIndications: ['เป็นอันตรายต่อผู้อื่น (Risk of Harm to Others)'],
                    diagnosticCategory: ['F20-F29 Schizophrenia/Psychotic'],
                    primaryDiagnosis: 'Schizophrenia, Paranoid type (F20.0)',
                    pharmPlan: 'ปรับ/เริ่มยาใหม่',
                    medicationGroups: ['Antipsychotics'],
                    medicationDetails: 'Risperidone (2) 1 tab po hs',
                    generalAppearance: 'Normal', heent: 'Normal', cvsRs: 'Normal', abdomen: 'Normal', extremities: 'Normal',
                    cranialNerves: 'Grossly intact', motorPower: 'Grade V all', tone: 'Normal', sensory: 'Intact', reflexes: 'Normal', cerebellar: 'Normal'
                  });
                }}
                className="clay-btn clay-btn-pastel-purple px-3.5 py-2 text-xs font-bold gap-1.5"
                title="Psychosis Relapse with Agitation & IPD Admission"
              >
                <span>🧠 Psychosis Relapse</span>
              </button>

              {/* Preset 3: Mania Episode */}
              <button
                type="button"
                onClick={() => {
                  onChange({
                    admissionType: 'IPD',
                    chiefComplaint: ['อารมณ์ดีผิดปกติ/พูดมาก', 'นอนน้อยไม่เพลีย'],
                    duration: '1-4 สัปดาห์',
                    onset: 'เฉียบพลัน (Acute)',
                    course: 'แย่ลงเรื่อยๆ (Progressive)',
                    precipitatingFactors: ['ขาดยา'],
                    associatedSymptoms: ['ก้าวร้าว/หงุดหงิด', 'พฤติกรรมแปลกไปจากเดิม'],
                    appearanceBehavior: ['Restless/Agitated'],
                    speech: ['Talkative/Pressured'],
                    moodAffect: ['Elevated/Expansive'],
                    thoughtProcess: ['Flight of ideas'],
                    thoughtContent: ['Delusion'],
                    delusionDetail: 'Grandiose delusion',
                    perception: ['Normal'],
                    suicideRisk: 'No Risk',
                    violenceRisk: 'High Risk',
                    admissionIndications: ['เป็นอันตรายต่อผู้อื่น (Risk of Harm to Others)'],
                    safetyPlan: ['Admit สังเกตอาการใกล้ชิด', 'Restraint/Seclusion'],
                    standardizedAssessmentStatus: 'ประเมิน',
                    diagnosticCategory: ['F30-F39 Mood d/o'],
                    primaryDiagnosis: 'Bipolar I Disorder, Current Episode Manic with Psychotic Features (F31.2)',
                    pharmPlan: 'ปรับ/เริ่มยาใหม่',
                    medicationGroups: ['Mood Stabilizers', 'Antipsychotics'],
                    medicationDetails: 'Lithium Carbonate (300) 1x2 po pc, Olanzapine (10) 1 tab po hs',
                    generalAppearance: 'Normal', heent: 'Normal', cvsRs: 'Normal', abdomen: 'Normal', extremities: 'Normal',
                    cranialNerves: 'Grossly intact', motorPower: 'Grade V all', tone: 'Normal', sensory: 'Intact', reflexes: 'Normal', cerebellar: 'Normal'
                  });
                }}
                className="clay-btn clay-btn-pastel-amber px-3.5 py-2 text-xs font-bold gap-1.5"
                title="Bipolar Mania Episode with Agitation & IPD Admission"
              >
                <span>🔥 Mania Episode</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Local Storage & Saved Records Browser Quick Bar */}
      <div className="clay-card-blue p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-xs shrink-0 mt-0.5">
            <History className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-extrabold text-slate-900">
                ประวัติการบันทึกในเครื่อง (Local Storage Records)
              </h4>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-900 text-[11px] font-extrabold rounded-full border border-emerald-300 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>บันทึกเฉพาะในเครื่อง 100% (Offline & Private)</span>
              </span>
            </div>
            <p className="text-xs text-slate-700 mt-1 leading-relaxed font-medium">
              ดึงข้อมูลผู้ป่วยที่เคยบันทึกไว้ในเบราว์เซอร์ของเครื่องนี้กลับมาแก้ไขใหม่ได้ง่ายๆ พร้อมวันที่บันทึกกำกับชัดเจน (ข้อมูลไม่ถูกส่งขึ้นอินเทอร์เน็ต)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {/* Browse Saved Records in localStorage */}
          <button
            type="button"
            onClick={() => onOpenHistoryModal && onOpenHistoryModal()}
            className="clay-btn clay-btn-primary px-4 py-2 text-xs font-extrabold gap-1.5"
            title="เปิดดูรายการประวัติที่บันทึกไว้ในเครื่องเพื่อโหลดกลับมาแก้ไข"
          >
            <FolderOpen className="w-4 h-4" />
            <span>ดูประวัติการบันทึก</span>
          </button>

          {/* Hidden File Input for Native JSON Local File Browsing */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleDirectFileImport}
            className="sr-only"
          />

          {/* Browse Local File (.json) directly */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="clay-btn clay-btn-secondary px-3.5 py-2 text-xs font-bold gap-1.5"
            title="เปิดไฟล์แบบประเมิน .json จากเครื่องของคุณ"
          >
            <Upload className="w-4 h-4 text-slate-600" />
            <span>เปิดไฟล์จากเครื่อง (.json)</span>
          </button>
        </div>
      </div>

      {/* SECTION A: Patient Identification (Mirrors A4 Document Page 1 Box 1) */}
      <section id="section-a" className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="px-6 py-3.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">
              A. Patient Identification (ข้อมูลทั่วไป)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">ส่วนข้อมูลประจำตัวผู้ป่วย</span>
        </div>

        <div className="p-6 space-y-4">
          {/* Row 1: HN, AN, Title, First Name, Last Name (Separated with compact width) */}
          <div className="flex flex-wrap items-start gap-3.5">
            {/* HN */}
            <div className="w-32 shrink-0">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>
                  HN <span className="text-red-500">*</span>
                </span>
                {!data.hn?.trim() && (
                  <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 border border-rose-200/80 px-1 py-0.2 rounded">
                    จำเป็น
                  </span>
                )}
              </label>
              <input
                id="field-hn"
                type="text"
                value={data.hn}
                onChange={e => onChange({ hn: e.target.value.trim() })}
                onBlur={e => onBlurField && onBlurField('hn', e.target.value)}
                placeholder="เช่น 67001234"
                className={`w-full text-sm font-mono font-bold bg-white border rounded-lg px-3 py-1.5 transition-all focus:ring-2 focus:ring-blue-600 focus:outline-none ${
                  errors.hn
                    ? 'border-red-500 bg-red-50/50'
                    : !data.hn?.trim()
                    ? 'border-slate-300 border-l-4 border-l-rose-500 bg-rose-50/20'
                    : 'border-slate-300'
                }`}
              />
              {errors.hn && <p className="text-xs text-red-600 mt-1 font-medium">{errors.hn}</p>}
            </div>

            {/* AN */}
            <div className="w-28 shrink-0">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                AN (ถ้ามี)
              </label>
              <input
                type="text"
                value={data.an}
                onChange={e => onChange({ an: e.target.value.trim() })}
                onBlur={e => onBlurField && onBlurField('an', e.target.value)}
                placeholder="เช่น 67/0123"
                className="w-full text-sm font-mono bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            {/* Title Prefix */}
            <div className="w-24 shrink-0">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                คำนำหน้า
              </label>
              <DebouncedInput
                type="text"
                list="title-prefix-list"
                value={data.titlePrefix || (data.fullName ? parseFullName(data.fullName).titlePrefix : '')}
                onChangeValue={val => {
                  const currentFirst = data.firstName || (data.fullName ? parseFullName(data.fullName).firstName : '');
                  const currentLast = data.lastName || (data.fullName ? parseFullName(data.fullName).lastName : '');
                  const fullName = constructFullName(currentFirst, currentLast, val);
                  onChange({
                    titlePrefix: val,
                    firstName: currentFirst,
                    lastName: currentLast,
                    fullName,
                  });
                }}
                onBlur={e => onBlurField && onBlurField('titlePrefix', e.target.value)}
                placeholder="นาย/นาง"
                className="w-full text-sm bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
              <datalist id="title-prefix-list">
                <option value="นาย" />
                <option value="นาง" />
                <option value="น.ส." />
                <option value="ด.ช." />
                <option value="ด.ญ." />
                <option value="พลฯ" />
                <option value="พลทหาร" />
                <option value="จ.ส.อ." />
                <option value="ร.ต." />
              </datalist>
            </div>

            {/* First Name (Short box to prevent typing both names) */}
            <div className="w-40 shrink-0">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>
                  ชื่อ <span className="text-red-500">*</span>
                </span>
                {!(data.firstName?.trim() || (data.fullName ? parseFullName(data.fullName).firstName.trim() : '')) && (
                  <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 border border-rose-200/80 px-1 py-0.2 rounded">
                    จำเป็น
                  </span>
                )}
              </label>
              <DebouncedInput
                id="field-firstName"
                type="text"
                maxLength={45}
                value={data.firstName || (data.fullName ? parseFullName(data.fullName).firstName : '')}
                onChangeValue={val => {
                  const currentTitle = data.titlePrefix || (data.fullName ? parseFullName(data.fullName).titlePrefix : '');
                  const currentLast = data.lastName || (data.fullName ? parseFullName(data.fullName).lastName : '');
                  const fullName = constructFullName(val, currentLast, currentTitle);
                  onChange({
                    firstName: val,
                    lastName: currentLast,
                    titlePrefix: currentTitle,
                    fullName,
                  });
                }}
                onBlur={e => onBlurField && onBlurField('firstName', e.target.value)}
                placeholder="ระบุชื่อจริง"
                className={`w-full text-sm bg-white border rounded-lg px-3 py-1.5 transition-all focus:ring-2 focus:ring-blue-600 focus:outline-none ${
                  errors.firstName
                    ? 'border-red-500 bg-red-50/50'
                    : !(data.firstName?.trim() || (data.fullName ? parseFullName(data.fullName).firstName.trim() : ''))
                    ? 'border-slate-300 border-l-4 border-l-rose-500 bg-rose-50/20'
                    : 'border-slate-300'
                }`}
              />
              {errors.firstName && (
                <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name (Short box to ensure last name is entered separately) */}
            <div className="w-44 shrink-0">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>
                  นามสกุล <span className="text-red-500">*</span>
                </span>
                {!(data.lastName?.trim() || (data.fullName ? parseFullName(data.fullName).lastName.trim() : '')) && (
                  <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 border border-rose-200/80 px-1 py-0.2 rounded">
                    จำเป็น
                  </span>
                )}
              </label>
              <DebouncedInput
                id="field-lastName"
                type="text"
                maxLength={50}
                value={data.lastName || (data.fullName ? parseFullName(data.fullName).lastName : '')}
                onChangeValue={val => {
                  const currentTitle = data.titlePrefix || (data.fullName ? parseFullName(data.fullName).titlePrefix : '');
                  const currentFirst = data.firstName || (data.fullName ? parseFullName(data.fullName).firstName : '');
                  const fullName = constructFullName(currentFirst, val, currentTitle);
                  onChange({
                    firstName: currentFirst,
                    lastName: val,
                    titlePrefix: currentTitle,
                    fullName,
                  });
                }}
                onBlur={e => onBlurField && onBlurField('lastName', e.target.value)}
                placeholder="ระบุนามสกุล"
                className={`w-full text-sm bg-white border rounded-lg px-3 py-1.5 transition-all focus:ring-2 focus:ring-blue-600 focus:outline-none ${
                  errors.lastName
                    ? 'border-red-500 bg-red-50/50'
                    : !(data.lastName?.trim() || (data.fullName ? parseFullName(data.fullName).lastName.trim() : ''))
                    ? 'border-slate-300 border-l-4 border-l-rose-500 bg-rose-50/20'
                    : 'border-slate-300'
                }`}
              />
              {errors.lastName && (
                <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Row 2: Age, Gender, Marital Status */}
          <div className="flex flex-wrap items-start gap-4">
            {/* Age (Compact 2-3 digits input) */}
            <div className="w-24 shrink-0">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>
                  อายุ <span className="text-red-500">*</span>
                </span>
                {!data.age?.trim() && (
                  <span className="text-[10px] font-semibold text-rose-600">จำเป็น</span>
                )}
              </label>
              <input
                id="field-age"
                type="number"
                min="0"
                max="130"
                value={data.age}
                onChange={e => onChange({ age: e.target.value })}
                onBlur={e => onBlurField && onBlurField('age', e.target.value)}
                placeholder="เช่น 35"
                className={`w-full text-sm bg-white border rounded-lg px-2.5 py-1.5 transition-all focus:ring-2 focus:ring-blue-600 focus:outline-none ${
                  errors.age
                    ? 'border-red-500 bg-red-50/50'
                    : !data.age?.trim()
                    ? 'border-slate-300 border-l-4 border-l-rose-500 bg-rose-50/20'
                    : 'border-slate-300'
                }`}
              />
              {errors.age && (
                <p className="text-[11px] text-red-600 mt-0.5 font-medium">{errors.age}</p>
              )}
            </div>

            {/* Gender */}
            <div className="shrink-0">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                เพศ <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-1">
                {(['ชาย', 'หญิง', 'อื่นๆ'] as const).map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => onChange({ gender: g })}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                      data.gender === g
                        ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Marital Status */}
            <div className="shrink-0">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                สถานภาพสมรส
              </label>
              <div className="flex flex-wrap gap-1">
                {(['โสด', 'สมรส', 'หม้าย/หย่า/แยก'] as const).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => onChange({ maritalStatus: m })}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                      (data.maritalStatus || 'โสด') === m
                        ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Occupation (4 buttons: พลทหาร, ข้าราชการ, เอกชน, ว่างงาน with default ว่างงาน) */}
            <div className="shrink-0">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                อาชีพ (Occupation) <span className="text-slate-400 font-normal text-[11px]">(Default: ว่างงาน)</span>
              </label>
              <div className="flex flex-wrap gap-1">
                {(['พลทหาร', 'ข้าราชการ', 'เอกชน', 'ว่างงาน'] as const).map(occ => {
                  const isSelected = (data.occupation || 'ว่างงาน') === occ;
                  return (
                    <button
                      key={occ}
                      type="button"
                      onClick={() => onChange({ occupation: occ })}
                      className={`px-3.5 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-2xs ring-1 ring-blue-400'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {occ}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Row 3: Education Level, Informant, Reliability */}
          <div className="flex flex-wrap items-start gap-4 pt-1">
            {/* Education Level */}
            <div className="shrink-0">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                ระดับการศึกษาสูงสุด
              </label>
              <div className="flex flex-wrap gap-1">
                {(['ประถมศึกษา', 'มัธยมศึกษา', 'ปริญญาตรีหรือสูงกว่า'] as const).map(edu => (
                  <button
                    key={edu}
                    type="button"
                    onClick={() => onChange({ educationLevel: edu })}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                      (data.educationLevel || 'มัธยมศึกษา') === edu
                        ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {edu}
                  </button>
                ))}
              </div>
            </div>

            {/* Informant */}
            <div className="shrink-0">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                ผู้ให้ข้อมูลหลัก (Informant)
              </label>
              <div className="flex gap-3 items-center h-9">
                <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                  <input
                    type="radio"
                    name="informant"
                    checked={data.informant === 'ผู้ป่วยเอง'}
                    onChange={() => onChange({ informant: 'ผู้ป่วยเอง' })}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>ผู้ป่วยเอง</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                  <input
                    type="radio"
                    name="informant"
                    checked={data.informant === 'ญาติ/ผู้ดูแล'}
                    onChange={() => onChange({ informant: 'ญาติ/ผู้ดูแล' })}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>ญาติ/ผู้ดูแล</span>
                </label>
              </div>
            </div>

            {/* Informant Detail if relative */}
            {data.informant === 'ญาติ/ผู้ดูแล' && (
              <div className="w-36 shrink-0">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  ระบุความเกี่ยวข้อง
                </label>
                <DebouncedInput
                  type="text"
                  value={data.informantDetail}
                  onChangeValue={val => onChange({ informantDetail: val })}
                  placeholder="เช่น มารดา, สามี"
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            )}

            {/* Reliability */}
            <div className="shrink-0">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                ความน่าเชื่อถือของข้อมูล (Reliability)
              </label>
              <div className="flex gap-1">
                {(['ดี (Good)', 'พอใช้ (Fair)', 'เชื่อถือไม่ได้ (Poor)'] as const).map(rel => (
                  <button
                    key={rel}
                    type="button"
                    onClick={() => onChange({ reliability: rel })}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                      (data.reliability || 'ดี (Good)') === rel
                        ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {rel}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION B: Chief Complaint & HPI (Mirrors A4 Document Page 1 Box 2) */}
      <section id="section-b" className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="px-6 py-3.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">
              B. Chief Complaint & History of Present Illness (อาการสำคัญและประวัติปัจจุบัน)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">อาการสำคัญและประวัติเจ็บป่วย</span>
        </div>

        <div className="p-6 space-y-5">
          {/* Chief Complaint */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              อาการสำคัญ (Chief Complaint) <span className="text-xs font-normal text-slate-500">(เลือกได้มากกว่า 1 ข้อ)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                'ซึมเศร้า/ท้อแท้',
                'หงุดหงิด/ก้าวร้าว',
                'หูแว่ว/ประสาทหลอน',
                'หวาดระแวง/หลงผิด',
                'สับสน/หลงลืม',
                'ทำร้ายตนเอง',
                'มีปัญหาพฤติกรรม',
              ].map(item => {
                const isSelected = (data.chiefComplaint || []).includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleArrayItem('chiefComplaint', item)}
                    className={`px-3.5 py-2 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                      isSelected ? 'clay-pill-active' : 'clay-pill-inactive'
                    }`}
                  >
                    {isSelected ? (
                      <Check className="w-3.5 h-3.5 stroke-[3] text-white shrink-0" />
                    ) : (
                      <span className="w-3 h-3 rounded-full border border-slate-400/80 shrink-0" />
                    )}
                    <span>{item}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-3 space-y-1 max-w-md">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 font-medium">ระบุอาการสำคัญอื่นๆ เพิ่มเติม (ถ้ามี)</span>
              </div>
              <DebouncedInput
                type="text"
                value={data.chiefComplaintOther}
                onChangeValue={val => onChange({ chiefComplaintOther: val })}
                onBlur={e => onBlurField && onBlurField('chiefComplaintOther', e.target.value)}
                placeholder="ระบุอาการสำคัญอื่นๆ สั้นๆ..."
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Duration, Onset, Course */}
          <div className="flex flex-wrap items-start gap-4 pt-3 border-t border-slate-100">
            {/* Duration */}
            <div className="shrink-0">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                ระยะเวลาที่มีอาการ (Duration)
              </label>
              <div className="flex flex-wrap gap-1">
                {(['1 วัน', '< 1 สัปดาห์', '1-4 สัปดาห์', '1-6 เดือน', '> 6 เดือน'] as const).map(dur => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => handleDurationChange(dur)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                      data.duration === dur
                        ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {dur}
                  </button>
                ))}
              </div>
            </div>

            {/* Onset */}
            <div className="shrink-0">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                ลักษณะการเกิดอาการ (Onset)
              </label>
              <div className="flex gap-1">
                {(['เฉียบพลัน (Acute)', 'ค่อยเป็นค่อยไป (Gradual)'] as const).map(on => (
                  <button
                    key={on}
                    type="button"
                    onClick={() => onChange({ onset: on })}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                      (data.onset || 'ค่อยเป็นค่อยไป (Gradual)') === on
                        ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {on}
                  </button>
                ))}
              </div>
            </div>

            {/* Course */}
            <div className="shrink-0">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                การดำเนินโรค (Course)
              </label>
              <div className="flex flex-wrap gap-1">
                {(['ดีขึ้นสลับแย่ลง (Fluctuating)', 'แย่ลงเรื่อยๆ (Progressive)', 'คงที่ (Stable)'] as const).map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => onChange({ course: c })}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                      (data.course || 'แย่ลงเรื่อยๆ (Progressive)') === c
                        ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Precipitating Factors & Associated Symptoms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                ปัจจัยกระตุ้น (Precipitating factors)
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  'ขาดยา',
                  'ปัญหาครอบครัว/ความสัมพันธ์',
                  'การเงิน/การงาน',
                  'ใช้สารเสพติด',
                  'โรคทางกายกำเริบ',
                  'ไม่พบปัจจัยชัดเจน',
                ].map(item => {
                  const isSelected = (data.precipitatingFactors || []).includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleArrayItem('precipitatingFactors', item)}
                      className={`px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                        isSelected ? 'clay-pill-active' : 'clay-pill-inactive'
                      }`}
                    >
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 stroke-[3] text-white shrink-0" />
                      ) : (
                        <span className="w-3 h-3 rounded-full border border-slate-400/80 shrink-0" />
                      )}
                      <span>{item}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                อาการร่วมที่สำคัญ (Associated symptoms)
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  'นอนไม่หลับ',
                  'เบื่ออาหาร',
                  'น้ำหนักลด/เพิ่ม',
                  'อ่อนเพลีย',
                  'แยกตัว',
                  'พฤติกรรมแปลกไปจากเดิม',
                ].map(item => {
                  const isSelected = (data.associatedSymptoms || []).includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleArrayItem('associatedSymptoms', item)}
                      className={`px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                        isSelected ? 'clay-pill-active' : 'clay-pill-inactive'
                      }`}
                    >
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 stroke-[3] text-white shrink-0" />
                      ) : (
                        <span className="w-3 h-3 rounded-full border border-slate-400/80 shrink-0" />
                      )}
                      <span>{item}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Detailed HPI text */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                รายละเอียดประวัติปัจจุบันเพิ่มเติม (HPI Details)
              </label>
            </div>

            <DebouncedTextarea
              rows={3}
              value={data.hpiDetails}
              onChangeValue={val => onChange({ hpiDetails: val })}
              onBlur={e => onBlurField && onBlurField('hpiDetails', e.target.value)}
              placeholder="บันทึกเรื่องราวการเจ็บป่วย เหตุการณ์นำมา ลำดับอาการ พฤติกรรมที่สังเกตได้..."
              className="w-full text-sm bg-white border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          {/* Previous treatment & response */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                การรักษาก่อนหน้า
              </label>
              <div className="flex flex-wrap gap-1">
                {(['ไม่เคยรักษาจิตเวชมาก่อน', 'เคยรักษา'] as const).map(pt => (
                  <button
                    key={pt}
                    type="button"
                    onClick={() => {
                      onChange({
                        previousTreatment: pt,
                        ...(pt === 'ไม่เคยรักษาจิตเวชมาก่อน' ? { previousHospital: '', previousResponse: '' } : {}),
                      });
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                      (data.previousTreatment || 'ไม่เคยรักษาจิตเวชมาก่อน') === pt
                        ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {pt}
                  </button>
                ))}
              </div>
            </div>

            {data.previousTreatment === 'เคยรักษา' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    เคยรักษาที่ (ระบุ รพ./คลินิก)
                  </label>
                  <DebouncedInput
                    type="text"
                    value={data.previousHospital}
                    onChangeValue={val => onChange({ previousHospital: val })}
                    placeholder="ระบุสถานพยาบาลเดิม"
                    className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    ผลการรักษาเดิม
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {(['ร่วมมือดี อาการสงบ', 'ขาดยาบ่อย', 'ปฏิเสธการเจ็บป่วย/ไม่ยอมทานยา'] as const).map(resp => (
                      <button
                        key={resp}
                        type="button"
                        onClick={() => onChange({ previousResponse: resp })}
                        className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                          data.previousResponse === resp
                            ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {resp}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export const Step1PatientAndComplaint = React.memo(Step1PatientAndComplaintComponent, (prevProps, nextProps) => {
  const step1Keys: (keyof typeof prevProps.data)[] = [
    'assessmentDate',
    'assessmentTime',
    'admissionType',
    'fullName',
    'age',
    'gender',
    'hn',
    'an',
    'maritalStatus',
    'occupation',
    'educationLevel',
    'informant',
    'informantDetail',
    'reliability',
    'chiefComplaint',
    'chiefComplaintOther',
    'duration',
    'onset',
    'course',
    'precipitatingFactors',
    'precipitatingFactorsOther',
    'associatedSymptoms',
    'hpiDetails',
    'previousTreatment',
    'previousHospital',
    'previousResponse'
  ];

  for (const key of step1Keys) {
    if (prevProps.data[key] !== nextProps.data[key]) {
      return false;
    }
  }

  const errorKeys = ['hn', 'fullName', 'age', 'gender'];
  for (const key of errorKeys) {
    if (prevProps.errors[key] !== nextProps.errors[key]) {
      return false;
    }
  }

  return true;
});
