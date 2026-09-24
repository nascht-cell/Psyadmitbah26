import React from 'react';
import { PsychiatricAssessment } from '../types/assessment';

interface Props {
  data: PsychiatricAssessment;
  showPageBadges?: boolean;
}

interface FooterProps {
  data: PsychiatricAssessment;
  pageNumber: number;
  totalPages: number;
}

/**
 * 1-line multi-page footer required for Page 2 onwards:
 * "ชื่อ-สกุล: [ชื่อ-สกุล]   |   อายุ: [อายุ]   |   เพศ: [เพศ]   |   HN: [HN]   |   AN: [AN]   (หน้า X/Y)"
 */
const DocumentFooter: React.FC<FooterProps> = ({ data, pageNumber, totalPages }) => {
  const fullName = data.fullName?.trim() || 'ไม่ระบุชื่อ-สกุล';
  const age = data.age?.trim() ? `${data.age.trim()} ปี` : '-';
  const gender = data.gender || '-';
  const hn = data.hn?.trim() || '-';
  const an = data.an?.trim() || '-';

  return (
    <div
      className="a4-document-footer mt-auto pt-1 border-t border-black text-black shrink-0"
      style={{ fontFamily: "'TH Sarabun PSK', 'Sarabun', 'THSarabunPSK', 'TH Sarabun New', sans-serif" }}
    >
      <div className="flex justify-between items-center text-[10pt] leading-tight">
        <div className="min-w-0 flex-1 truncate pr-2">
          <span className="font-normal">ชื่อ-สกุล:</span> {fullName} &nbsp;|&nbsp;{' '}
          <span className="font-normal">อายุ:</span> {age} &nbsp;|&nbsp;{' '}
          <span className="font-normal">เพศ:</span> {gender} &nbsp;|&nbsp;{' '}
          <span className="font-normal">HN:</span> <span className="font-normal">{hn}</span> &nbsp;|&nbsp;{' '}
          <span className="font-normal">AN:</span> <span className="font-normal">{an}</span>
        </div>
        <div className="shrink-0 font-normal text-[10pt] text-black whitespace-nowrap">
          (หน้า {pageNumber}/{totalPages})
        </div>
      </div>
    </div>
  );
};

const PageContinuationHeader: React.FC<{ data: PsychiatricAssessment; pageNumber: number; totalPages: number }> = ({
  data,
}) => (
  <div
    className="w-full max-w-full border-b border-black pb-0.5 mb-1.5 flex items-center justify-between leading-tight shrink-0"
    style={{ fontFamily: "'TH Sarabun PSK', 'Sarabun', 'THSarabunPSK', 'TH Sarabun New', sans-serif" }}
  >
    <div className="flex items-center gap-1.5 min-w-0 flex-1 text-[11pt] overflow-hidden pr-2">
      <img
        src="/Official_emblem_of_Bhumibol_Adulyadej_Hospital.jpg"
        alt="ตราสัญลักษณ์"
        className="w-auto h-4 object-contain shrink-0"
        style={{ aspectRatio: '200 / 283' }}
        referrerPolicy="no-referrer"
      />
      <span className="font-normal text-black truncate whitespace-nowrap">
        แบบบันทึกแรกรับผู้ป่วยจิตเวช (ต่อ) · กองจิตเวช รพ.ภูมิพลอดุลยเดช
      </span>
    </div>
    <div
      className="shrink-0 text-right text-black whitespace-nowrap flex items-center gap-2 text-[11pt]"
      style={{ fontFamily: "'TH Sarabun PSK', 'Sarabun', 'THSarabunPSK', 'TH Sarabun New', sans-serif" }}
    >
      <span className="flex items-center">
        <span className="font-normal">HN:</span>&nbsp;
        <span className="font-normal text-black">{data.hn || '-'}</span>
      </span>
      <span className="text-slate-400">|</span>
      <span className="flex items-center">
        <span className="font-normal">AN:</span>&nbsp;
        <span className="font-normal text-black">{data.an || '-'}</span>
      </span>
    </div>
  </div>
);

const renderCheck = (checked: boolean) => (
  <span className="inline-block font-mono font-bold mr-1 text-black">
    {checked ? '☑' : '☐'}
  </span>
);

const isNormalMseValue = (val: string): boolean => {
  const normalized = val.trim().toLowerCase();
  return (
    normalized === 'normal' ||
    normalized === 'intact' ||
    normalized === 'euthymic' ||
    normalized === 'logical/coherent' ||
    normalized === 'logical' ||
    normalized === 'none' ||
    normalized === 'ปกติ' ||
    normalized === 'grossly intact'
  );
};

const renderMseArray = (values: string[] | undefined) => {
  if (!values || values.length === 0) {
    return <span className="text-slate-400 font-normal">-</span>;
  }

  if (values.length === 1 && isNormalMseValue(values[0])) {
    return <span className="text-slate-700 font-normal">{values[0]}</span>;
  }

  return (
    <div className="flex flex-wrap gap-x-2 gap-y-0.5">
      {values.map((val, idx) => {
        const isNormal = isNormalMseValue(val);
        return (
          <span
            key={idx}
            className={isNormal ? 'text-slate-700 font-normal' : 'text-black font-bold'}
          >
            {val}
            {idx < values.length - 1 && <span className="text-slate-300 ml-1 font-normal">,</span>}
          </span>
        );
      })}
    </div>
  );
};

const renderSingleValue = (val: string | undefined) => {
  if (!val) return <span className="text-slate-400 font-normal">-</span>;
  const isNormal = isNormalMseValue(val);
  return (
    <span className={isNormal ? 'text-slate-700 font-normal' : 'text-black font-bold'}>
      {val}
    </span>
  );
};

const renderInsight = (val: string | undefined) => {
  if (!val) return <span className="text-slate-400 font-normal">-</span>;
  if (val === '6' || val.toLowerCase().includes('true insight') || val.toLowerCase().includes('level 6')) {
    return <span className="text-slate-700 font-normal">True insight (Level 6)</span>;
  }
  if (val === '5' || val.toLowerCase().includes('intellectual')) {
    return <span className="text-black font-bold">Intellectual insight (Level 5)</span>;
  }
  const isNormal = val.includes('6') || val.toLowerCase().includes('true');
  return (
    <span className={isNormal ? 'text-slate-700 font-normal' : 'text-black font-bold'}>
      {val}
    </span>
  );
};

const renderOrientation = (time: boolean, place: boolean, person: boolean) => {
  if (time && place && person) {
    return <span className="text-slate-700 font-normal">Intact (Time, Place, Person)</span>;
  }
  const parts = [];
  if (time) {
    parts.push(<span className="text-slate-700 font-normal">Time ✓</span>);
  } else {
    parts.push(<span className="text-black font-bold">Time ✗</span>);
  }

  if (place) {
    parts.push(<span className="text-slate-700 font-normal">Place ✓</span>);
  } else {
    parts.push(<span className="text-black font-bold">Place ✗</span>);
  }

  if (person) {
    parts.push(<span className="text-slate-700 font-normal">Person ✓</span>);
  } else {
    parts.push(<span className="text-black font-bold">Person ✗</span>);
  }

  return (
    <div className="flex gap-x-2 flex-wrap items-center">
      {parts.map((p, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && <span className="text-slate-300 text-[11pt] font-normal">·</span>}
          {p}
        </React.Fragment>
      ))}
    </div>
  );
};

const pageSheetStyle: React.CSSProperties = {
  width: '210mm',
  minHeight: '297mm',
  maxHeight: '297mm',
  height: '297mm',
  padding: '8mm 12mm 8mm 12mm',
  fontFamily: "'TH Sarabun PSK', 'Sarabun', 'THSarabunPSK', 'TH Sarabun New', sans-serif",
  fontSize: '14pt',
  lineHeight: '1.3',
  boxSizing: 'border-box',
  color: '#000000',
  backgroundColor: '#ffffff',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  position: 'relative',
  overflow: 'hidden',
};

const AssessmentPdfDocumentComponent: React.FC<Props> = ({ data, showPageBadges = false }) => {
  const hasPage4 = React.useMemo(() => {
    // Standard layout is strictly 3 pages.
    // Only expand to Page 4 if explicitly requested by user (allowPage4 === true)
    // or if free-text fields are exceptionally long (> 1200 chars total) causing actual page overflow.
    if (data.allowPage4 === true) return true;
    if (data.allowPage4 === false) return false;

    const totalFreeTextLength =
      (data.hpiDetails?.length || 0) +
      (data.medicationDetails?.length || 0) +
      (data.differentialDiagnosis?.length || 0) +
      (data.concernsDetail?.length || 0);

    return totalFreeTextLength > 1200;
  }, [data]);

  const renderSectionI = () => (
    <div className="avoid-break-inside">
      <div className="border-b border-black pb-0.5 mb-1 text-black font-normal text-[12.5pt]">
        I. Investigation (การตรวจทางห้องปฏิบัติการและการตรวจพิเศษ)
      </div>
      <div className="space-y-0.5 text-[12.5pt]">
        <div>
          <span className="font-normal text-slate-800">การตรวจทางห้องปฏิบัติการ:</span> <span className="font-normal text-slate-800">{data.investigationStatus}</span>
          {data.investigationStatus === 'ส่งตรวจ Lab' && (
            <span className="ml-2 font-normal text-slate-800">[{data.labTests && data.labTests.join(', ')} {data.labOther && `, ${data.labOther}`}]</span>
          )}
          {data.neuroimaging && <span className="ml-3 font-normal text-slate-800">Neuroimaging/EEG/EKG: {data.neuroimaging}</span>}
        </div>
      </div>
    </div>
  );

  const renderSectionJ = () => (
    <div className="avoid-break-inside">
      <div className="border-b border-black pb-0.5 mb-1 text-black font-normal text-[12.5pt]">
        J. Diagnosis (การวินิจฉัยโรค)
      </div>
      <div className="space-y-0.5 text-[12.5pt]">
        <div>
          <span className="font-normal text-slate-800">กลุ่มโรค (Category):</span>{' '}
          <span className="font-normal text-slate-800">
            {data.diagnosticCategory && data.diagnosticCategory.join(', ') || '-'}
            {data.diagnosticCategoryOther && ` (${data.diagnosticCategoryOther})`}
          </span>
        </div>
        <div className="mt-0.5">
          <span className="font-normal text-black">Primary Diagnosis (ICD-10):</span>{' '}
          <span className="underline text-black font-bold">{data.primaryDiagnosis || '-'}</span>
        </div>
        {data.differentialDiagnosis && (
          <div className="mt-0.5">
            <span className="font-normal text-slate-800">Differential Dx:</span> <span className="font-normal text-slate-800">{data.differentialDiagnosis}</span>
          </div>
        )}
        {data.comorbidDiagnosis && (
          <div className="mt-0.5">
            <span className="font-normal text-slate-800">Comorbidity:</span> <span className="font-normal text-slate-800">{data.comorbidDiagnosis}</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderSectionK = () => (
    <div className="avoid-break-inside">
      <div className="border-b border-black pb-0.5 mb-1 text-black font-normal text-[12.5pt]">
        K. Care Plan & Medical Intervention (แผนการดูแลและรักษา)
      </div>
      <div className="space-y-0.5 text-[12.5pt]">
        <div>
          <span className="font-normal text-slate-800">1. Pharmacological:</span> <span className="font-normal text-slate-800">{data.pharmPlan}</span>
          {data.medicationGroups && data.medicationGroups.length > 0 && (
            <span className="ml-2 font-normal text-slate-800">[{data.medicationGroups.join(', ')}]</span>
          )}
          {data.medicationDetails && (
            <div className="pl-3 font-normal text-black">
              <span className="font-normal text-slate-800">คำสั่งยา:</span> {data.medicationDetails}
            </div>
          )}
        </div>
        <div>
          <span className="font-normal text-slate-800">2. Non-Pharmacological:</span>{' '}
          <span className="font-normal text-slate-800">{data.nonPharmTreatments && data.nonPharmTreatments.join(', ') || '-'}</span>
        </div>
        <div>
          <span className="font-normal text-slate-800">3. Multidisciplinary Team ที่จำเป็นต้องร่วมดูแลผู้ป่วย:</span> <span className="font-normal text-slate-800">{data.mdtConsult}</span>
          {data.mdtConsult === 'ส่ง' && (
            <span className="ml-2 font-normal text-slate-800">
              [{data.mdtRoles && data.mdtRoles.join(', ')} {data.mdtOther && `, ${data.mdtOther}`}]
            </span>
          )}
        </div>
      </div>
    </div>
  );

  const renderSectionL = () => (
    <div className="avoid-break-inside">
      <div className="border-b border-black pb-0.5 mb-1 text-black font-normal text-[12.5pt]">
        L. Patient Involvement (การมีส่วนร่วมในการรักษา)
      </div>
      <div className="space-y-0.5 text-[12.5pt]">
        <div className="grid grid-cols-2 gap-1.5 font-normal">
          <span>{renderCheck(data.explainedDiagnosis)} อธิบายการวินิจฉัยแล้ว</span>
          <span>{renderCheck(data.explainedCarePlan)} อธิบายแผนการรักษา/ทางเลือกแล้ว</span>
          <span>{renderCheck(data.explainedSideEffects)} อธิบายผลข้างเคียงยาแล้ว</span>
          <span>{renderCheck(data.explainedWarningSigns)} แนะนำอาการเตือนที่ต้องรีบมาพบแพทย์</span>
        </div>
        <div>
          <span className="font-normal text-slate-800">ข้อกังวลของผู้ป่วย/ญาติ:</span> <span className="font-normal text-slate-800">{data.concernsStatus}{' '}{data.concernsDetail && `(${data.concernsDetail})`}</span>
        </div>
      </div>
    </div>
  );

  const renderSectionM = () => (
    <div className="avoid-break-inside">
      <div className="border-b border-black pb-0.5 mb-1 text-black font-normal text-[12.5pt]">
        M. Indication for Admission (ข้อบ่งชี้ในการรับไว้รักษาในโรงพยาบาล)
      </div>
      {data.admissionIndications && data.admissionIndications.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[12.5pt]">
          {data.admissionIndications.map((item, idx) => (
            <span key={item} className="flex items-start font-normal text-black">
              {renderCheck(true)}{' '}
              <span>{idx + 1}. {item}</span>
            </span>
          ))}
        </div>
      ) : (
        <div className="text-[12.5pt] text-slate-600 font-normal">
          - ไม่มีข้อบ่งชี้การรับไว้รักษาในโรงพยาบาล (รักษาแบบผู้ป่วยนอก OPD) -
        </div>
      )}
    </div>
  );

  const renderSignature = () => (
    <div className="pt-2 flex justify-end">
      <div className="w-80 text-center space-y-0.5 text-[12.5pt]">
        <div className="pb-0.5 font-normal whitespace-nowrap">
          ลงชื่อ ............................................................................
        </div>
        <div className="font-normal text-black">
          แพทย์ผู้ประเมิน
        </div>
        <div className="font-normal text-black">
          ({data.physicianName || '............................................................................'})
        </div>
        <div className="font-normal">
          เลขที่ใบประกอบวิชาชีพ: {data.licenseNumber || '....................................'}
        </div>
        <div className="text-slate-600 text-[11pt] font-normal">
          วันที่บันทึก: {data.assessmentDate} {data.assessmentTime} น.
        </div>
      </div>
    </div>
  );

  const page1Fn = (pageNumber: number, totalPages: number) => (
    <div className="a4-page-sheet shadow-xl print:shadow-none" style={pageSheetStyle}>
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Official Header */}
          <div className="border-b-2 border-black pb-1.5 mb-2">
            {/* Top Row: Authentic Full-Color Emblem + Hospital Name | Date & Time Box */}
            <div className="flex justify-between items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="shrink-0 flex items-center justify-center">
                  <img
                    src="/Official_emblem_of_Bhumibol_Adulyadej_Hospital.jpg"
                    alt="ตราสัญลักษณ์ โรงพยาบาลภูมิพลอดุลยเดช"
                    className="w-auto object-contain shrink-0"
                    style={{
                      height: '48pt',
                      maxHeight: '48pt',
                      aspectRatio: '200 / 283',
                    }}
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <div
                    className="uppercase tracking-wider font-normal text-black leading-tight"
                    style={{ fontSize: '12pt' }}
                  >
                    Bhumibol Adulyadej Hospital
                  </div>
                  <div
                    className="text-black font-normal leading-snug"
                    style={{ fontSize: '11.5pt' }}
                  >
                    กองจิตเวชและประสาทวิทยา โรงพยาบาลภูมิพลอดุลยเดช
                  </div>
                </div>
              </div>

              {/* Dept, Date, Time Box */}
              <div
                className="text-right leading-snug border border-black p-1 px-2.5 rounded-xs bg-white shrink-0 min-w-40 text-black"
                style={{ fontSize: '11pt' }}
              >
                <div>
                  <span className="font-normal">แผนก:</span> <span className="font-normal">{data.department || 'จิตเวชศาสตร์'}</span>
                </div>
                <div>
                  <span className="font-normal">วันที่:</span> <span className="font-normal">{data.assessmentDate || '-'}</span>
                </div>
                <div>
                  <span className="font-normal">เวลา:</span> <span className="font-normal">{data.assessmentTime || '-'} น.</span>
                </div>
              </div>
            </div>

            {/* Framed Title Box: แบบบันทึกแรกรับผู้ป่วยจิตเวช (Mental Health Admission Form) */}
            <div className="border-2 border-black rounded-xs px-3 py-1 text-center bg-[#fcfcfc] my-1.5">
              <h1
                className="font-normal text-black tracking-wide"
                style={{ fontSize: '14.5pt', lineHeight: '1.2' }}
              >
                แบบบันทึกแรกรับผู้ป่วยจิตเวช
              </h1>
              <div
                className="font-normal text-black tracking-wide"
                style={{ fontSize: '12pt', lineHeight: '1.1' }}
              >
                (Mental Health Admission Form)
              </div>
            </div>

            {/* Admission Type & Identification Strip */}
            <div
              className="flex items-center justify-between pt-0.5 border-t border-black text-black"
              style={{ fontSize: '13pt' }}
            >
              <div className="flex items-center space-x-6">
                <span className="font-normal">ประเภทการรับผู้ป่วย:</span>
                <span>{renderCheck(data.admissionType === 'OPD')} OPD</span>
                <span>{renderCheck(data.admissionType === 'IPD')} IPD</span>
                <span>{renderCheck(data.admissionType === 'ER')} ER</span>
              </div>
              <div className="text-[13pt]">
                <span className="font-normal">HN:</span> <span className="font-normal text-black">{data.hn || '________'}</span>
                <span className="ml-4">
                  <span className="font-normal">AN:</span> <span className="font-normal text-black">{data.an || '-'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* SECTION A: Patient Identification */}
          <div className="mb-2 avoid-break-inside">
            <div className="border-b border-black pb-0.5 mb-1 text-black font-normal text-[12.5pt]">
              A. Patient Identification (ข้อมูลระบุตัวผู้ป่วย)
            </div>
            <div className="space-y-0.5 text-[12.5pt]">
              <div className="grid grid-cols-12 gap-1.5">
                <div className="col-span-5">
                  <span className="font-normal text-slate-800">ชื่อ-สกุล:</span> <span className="font-normal">{data.fullName || '-'}</span>
                </div>
                <div className="col-span-3">
                  <span className="font-normal text-slate-800">อายุ:</span> <span className="font-normal">{data.age ? `${data.age} ปี` : '-'}</span>
                </div>
                <div className="col-span-4">
                  <span className="font-normal text-slate-800">เพศ:</span> <span className="font-normal">{data.gender || '-'}</span>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-1.5">
                <div className="col-span-3">
                  <span className="font-normal text-slate-800">สถานภาพ:</span> <span className="font-normal">{data.maritalStatus || '-'}</span>
                </div>
                <div className="col-span-4">
                  <span className="font-normal text-slate-800">อาชีพ:</span> <span className="font-normal">{data.occupation || '-'}</span>
                </div>
                <div className="col-span-5">
                  <span className="font-normal text-slate-800">ระดับการศึกษา:</span> <span className="font-normal">{data.educationLevel || '-'}</span>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-1.5 pt-0.5 border-t border-dotted border-slate-300">
                <div className="col-span-8">
                  <span className="font-normal text-slate-800">ผู้ให้ข้อมูลหลัก:</span>{' '}
                  {renderCheck(data.informant === 'ผู้ป่วยเอง')} ผู้ป่วยเอง{' '}
                  {renderCheck(data.informant === 'ญาติ/ผู้ดูแล')} ญาติ/ผู้ดูแล
                  {data.informantDetail && ` (${data.informantDetail})`}
                </div>
                <div className="col-span-4">
                  <span className="font-normal text-slate-800">ความน่าเชื่อถือ:</span> <span className="font-normal">{data.reliability || '-'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION B: Chief Complaint & HPI */}
          <div className="mb-2 avoid-break-inside">
            <div className="border-b border-black pb-0.5 mb-1 text-black font-normal text-[12.5pt]">
              B. Chief Complaint & History of Present Illness (อาการสำคัญและประวัติปัจจุบัน)
            </div>
            <div className="space-y-0.5 text-[12.5pt]">
              <div>
                <span className="font-normal text-slate-800">อาการสำคัญ (CC):</span>{' '}
                <span className="font-semibold text-black">
                  {data.chiefComplaint && data.chiefComplaint.length > 0 ? data.chiefComplaint.join(', ') : '-'}
                  {data.chiefComplaintOther && ` (${data.chiefComplaintOther})`}
                </span>
              </div>

              <div className="grid grid-cols-12 gap-1.5">
                <div className="col-span-4">
                  <span className="font-normal text-slate-800">ระยะเวลา:</span> <span className="font-normal">{data.duration || '-'}</span>
                </div>
                <div className="col-span-4">
                  <span className="font-normal text-slate-800">Onset:</span> <span className="font-normal">{data.onset || '-'}</span>
                </div>
                <div className="col-span-4">
                  <span className="font-normal text-slate-800">Course:</span> <span className="font-normal">{data.course || '-'}</span>
                </div>
              </div>

              {data.precipitatingFactors && data.precipitatingFactors.length > 0 && (
                <div>
                  <span className="font-normal text-slate-800">ปัจจัยกระตุ้น:</span> <span className="font-normal">{data.precipitatingFactors.join(', ')}{data.precipitatingFactorsOther && ` (${data.precipitatingFactorsOther})`}</span>
                </div>
              )}

              {data.associatedSymptoms && data.associatedSymptoms.length > 0 && (
                <div>
                  <span className="font-normal text-slate-800">อาการร่วม:</span> <span className="font-normal">{data.associatedSymptoms.join(', ')}</span>
                </div>
              )}

              {data.hpiDetails && (
                <div className="p-1 bg-[#fcfcfc] border border-slate-300 rounded mt-0.5">
                  <span className="font-normal text-slate-800">รายละเอียดประวัติปัจจุบัน (HPI):</span>
                  <p className="whitespace-pre-wrap mt-0.5 text-justify leading-snug line-clamp-4 font-normal">
                    {data.hpiDetails}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-12 gap-1.5 pt-0.5">
                <div className="col-span-6">
                  <span className="font-normal text-slate-800">ประวัติการรักษาเดิม:</span> <span className="font-normal">{data.previousTreatment || '-'}{data.previousHospital && ` (รพ. ${data.previousHospital})`}</span>
                </div>
                <div className="col-span-6">
                  <span className="font-normal text-slate-800">การตอบสนอง:</span> <span className="font-normal">{data.previousResponse || '-'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION C: Psychiatric, Medical & Substance History */}
          <div className="mb-1 avoid-break-inside">
            <div className="border-b border-black pb-0.5 mb-1 text-black font-normal text-[12.5pt]">
              C. Psychiatric, Medical & Substance History (ประวัติการเจ็บป่วยและสารเสพติด)
            </div>
            <div className="space-y-0.5 text-[12.5pt]">
              <div className="grid grid-cols-12 gap-1.5">
                <div className="col-span-6">
                  <span className="font-normal text-slate-800">ประวัติจิตเวชเดิม:</span>{' '}
                  <span className={data.psychiatricHistory === 'มีประวัติ' ? 'font-semibold text-black' : 'font-normal text-slate-700'}>
                    {data.psychiatricHistory}
                    {data.psychiatricDisorders && data.psychiatricDisorders.length > 0 && (
                      <span> [{data.psychiatricDisorders.join(', ')}]</span>
                    )}
                    {data.psychiatricDisorderOther && ` (${data.psychiatricDisorderOther})`}
                  </span>
                </div>
                <div className="col-span-6">
                  <span className="font-normal text-slate-800">ประวัติ Admit จิตเวช:</span>{' '}
                  <span className={data.admitHistory && data.admitHistory !== 'ไม่เคย' ? 'font-semibold text-black' : 'font-normal text-slate-700'}>
                    {data.admitHistory}
                    {data.admitLastYear && ` (ช่วง 1 ปี: ${data.admitLastYear})`}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-1.5">
                <div className="col-span-6">
                  <span className="font-normal text-slate-800">โรคประจำตัวทางกาย:</span>{' '}
                  <span className={data.medicalHistory === 'มีโรคประจำตัว' ? 'font-semibold text-black' : 'font-normal text-slate-700'}>
                    {data.medicalHistory}
                    {data.medicalConditions && data.medicalConditions.length > 0 && (
                      <span> [{data.medicalConditions.join(', ')}]</span>
                    )}
                    {data.medicalHistoryOther && ` (${data.medicalHistoryOther})`}
                  </span>
                </div>
                <div className="col-span-6">
                  <span className="font-normal text-slate-800">ประวัติการแพ้:</span>{' '}
                  <span className={data.allergy === 'แพ้' ? 'font-bold text-black' : 'font-normal text-slate-700'}>
                    {data.allergy}
                    {data.allergyDetail && ` (แพ้: ${data.allergyDetail})`}
                  </span>
                </div>
              </div>

              <div className="pt-0.5 border-t border-dotted border-slate-300">
                <span className="font-normal text-slate-800">ประวัติสารเสพติด:</span>{' '}
                <span className="font-normal">{data.substanceHistory}</span>
                <div className="grid grid-cols-4 gap-1.5 mt-0.5 text-slate-800">
                  <div>
                    • สุรา: <span className={data.alcoholUse === 'ดื่มประจำ/ติด' || data.alcoholUse === 'เพิ่งดื่มล่าสุด < 24 ชม.' ? 'font-bold text-black' : 'font-normal'}>{data.alcoholUse || 'ปฏิเสธ'}</span>
                  </div>
                  <div>
                    • บุหรี่: <span className={data.smokingUse === 'สูบประจำ' ? 'font-bold text-black' : 'font-normal'}>{data.smokingUse || 'ปฏิเสธ'}</span>
                    {data.cigarettesPerDay && ` (${data.cigarettesPerDay} มวน/วัน)`}
                  </div>
                  <div>
                    • ยาบ้า: <span className={data.methUse === 'ปัจจุบันยังใช้' || data.methUse === 'เพิ่งใช้ล่าสุด < 24 ชม.' ? 'font-bold text-black' : 'font-normal'}>{data.methUse || 'ปฏิเสธ'}</span>
                  </div>
                  <div>
                    • อื่นๆ: <span className={data.otherSubstances && data.otherSubstances.length > 0 ? 'font-bold text-black' : 'font-normal'}>{data.otherSubstances && data.otherSubstances.length > 0 ? data.otherSubstances.join(', ') : 'ไม่มี'}</span>
                    {data.otherSubstancesDetail && ` (${data.otherSubstancesDetail})`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const page2Fn = (pageNumber: number, totalPages: number) => (
    <div className="a4-page-sheet shadow-xl print:shadow-none" style={pageSheetStyle}>
      <div className="flex-1 flex flex-col justify-between min-h-0">
        <div className="space-y-1.5">
          <PageContinuationHeader data={data} pageNumber={pageNumber} totalPages={totalPages} />

          {/* SECTION D: Mental Status Examination (MSE) */}
          <div className="avoid-break-inside">
            <div className="border-b border-black pb-0.5 mb-1 text-black font-normal text-[12.5pt]">
              D. Mental Status Examination (การตรวจสภาพจิต - MSE)
            </div>
            
            <div className="border-t border-[#cbd5e1] text-[12pt]" style={{ borderTopWidth: '0.5px' }}>
              {/* Row 1 */}
              <div className="flex border-b border-[#cbd5e1] py-0.5 items-start" style={{ borderBottomWidth: '0.5px' }}>
                <div className="w-1/2 flex items-start pr-2">
                  <span className="font-normal w-[125px] shrink-0 text-slate-800 leading-tight">1. Appearance:</span>
                  <div className="flex-1 leading-tight text-justify">
                    {renderMseArray(data.appearanceBehavior)}
                  </div>
                </div>
                <div className="w-1/2 flex items-start pl-2">
                  <span className="font-normal w-[125px] shrink-0 text-slate-800 leading-tight">2. Speech:</span>
                  <div className="flex-1 leading-tight text-justify">
                    {renderMseArray(data.speech)}
                  </div>
                </div>
              </div>

              {/* Row 2 */}
              <div className="flex border-b border-[#cbd5e1] py-0.5 items-start" style={{ borderBottomWidth: '0.5px' }}>
                <div className="w-1/2 flex items-start pr-2">
                  <span className="font-normal w-[125px] shrink-0 text-slate-800 leading-tight">3. Mood & Affect:</span>
                  <div className="flex-1 leading-tight text-justify">
                    {renderMseArray(data.moodAffect)}
                  </div>
                </div>
                <div className="w-1/2 flex items-start pl-2">
                  <span className="font-normal w-[125px] shrink-0 text-slate-800 leading-tight">4. Thought Process:</span>
                  <div className="flex-1 leading-tight text-justify">
                    {renderMseArray(data.thoughtProcess)}
                  </div>
                </div>
              </div>

              {/* Row 3 */}
              <div className="flex border-b border-[#cbd5e1] py-0.5 items-start" style={{ borderBottomWidth: '0.5px' }}>
                <div className="w-1/2 flex items-start pr-2">
                  <span className="font-normal w-[125px] shrink-0 text-slate-800 leading-tight">5. Thought Content:</span>
                  <div className="flex-1 leading-tight text-justify">
                    {renderMseArray(data.thoughtContent)}
                    {data.delusionDetail && (
                      <div className="text-[11pt] text-black font-bold mt-0.5">
                        (Delusion: {data.delusionDetail})
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-1/2 flex items-start pl-2">
                  <span className="font-normal w-[125px] shrink-0 text-slate-800 leading-tight">6. Perception:</span>
                  <div className="flex-1 leading-tight text-justify">
                    {renderMseArray(data.perception)}
                  </div>
                </div>
              </div>

              {/* Row 4 */}
              <div className="flex border-b border-[#cbd5e1] py-0.5 items-start" style={{ borderBottomWidth: '0.5px' }}>
                <div className="w-1/2 flex items-start pr-2">
                  <span className="font-normal w-[125px] shrink-0 text-slate-800 leading-tight">7. Orientation:</span>
                  <div className="flex-1 leading-tight text-justify">
                    {renderOrientation(data.orientationTime, data.orientationPlace, data.orientationPerson)}
                  </div>
                </div>
                <div className="w-1/2 flex items-start pl-2">
                  <span className="font-normal w-[125px] shrink-0 text-slate-800 leading-tight">8. Attention & Memory:</span>
                  <div className="flex-1 leading-tight text-justify">
                    {renderSingleValue(data.attentionMemory)}
                  </div>
                </div>
              </div>

              {/* Row 5 */}
              <div className="flex border-b border-[#cbd5e1] py-0.5 items-start" style={{ borderBottomWidth: '0.5px' }}>
                <div className="w-1/2 flex items-start pr-2">
                  <span className="font-normal w-[125px] shrink-0 text-slate-800 leading-tight">9. Insight:</span>
                  <div className="flex-1 leading-tight text-justify">
                    {renderInsight(data.insight)}
                  </div>
                </div>
                <div className="w-1/2 flex items-start pl-2">
                  <span className="font-normal w-[125px] shrink-0 text-slate-800 leading-tight">10. Judgment:</span>
                  <div className="flex-1 leading-tight text-justify">
                    {renderSingleValue(data.judgment)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION E: Safety & Risk Assessment */}
          <div className="avoid-break-inside">
            <div className="border-b border-black pb-0.5 mb-1 text-black font-normal text-[12.5pt]">
              E. Safety & Risk Assessment (การประเมินความเสี่ยงและความปลอดภัย)
            </div>
            <div className="grid grid-cols-12 gap-1.5 text-[12.5pt]">
              <div className="col-span-6 p-0.5 px-1.5 border border-slate-300 rounded bg-[#fcfcfc]">
                <span className="font-normal text-slate-800">1. ความเสี่ยงฆ่าตัวตาย/ทำร้ายตนเอง:</span>{' '}
                <span className={data.suicideRisk && data.suicideRisk !== 'No Risk' && data.suicideRisk !== 'Low Risk' ? 'font-bold text-black underline' : 'font-normal text-slate-700'}>
                  {data.suicideRisk || 'No Risk'}
                </span>
              </div>
              <div className="col-span-6 p-0.5 px-1.5 border border-slate-300 rounded bg-[#fcfcfc]">
                <span className="font-normal text-slate-800">2. ความเสี่ยงก้าวร้าวรุนแรง (Violence):</span>{' '}
                <span className={data.violenceRisk && data.violenceRisk !== 'No Risk' && data.violenceRisk !== 'Low Risk' ? 'font-bold text-black underline' : 'font-normal text-slate-700'}>
                  {data.violenceRisk || 'No Risk'}
                </span>
              </div>
              {data.otherRisks && data.otherRisks.length > 0 && (
                <div className="col-span-12">
                  <span className="font-normal text-slate-800">ความเสี่ยงอื่นๆ:</span> <span className="font-normal text-slate-800">{data.otherRisks.join(', ')}</span>
                </div>
              )}
              {data.safetyPlan && data.safetyPlan.length > 0 && (
                <div className="col-span-12 p-0.5 px-1.5 bg-[#fffdf0] border border-amber-300 rounded">
                  <span className="font-normal text-[#451a03]">Safety Plan:</span>{' '}
                  <span className="font-normal text-slate-800">
                    {data.safetyPlan.join(', ')}
                    {data.safetyPlanOther && ` (${data.safetyPlanOther})`}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* SECTION F: Physical & Functional Assessment */}
          <div className="avoid-break-inside">
            <div className="border-b border-black pb-0.5 mb-1 text-black font-normal text-[12.5pt]">
              F. Physical & Functional Assessment
            </div>
            <div className="space-y-0.5 text-[12.5pt]">
              <div className="p-0.5 border border-slate-300 rounded bg-[#fcfcfc] grid grid-cols-6 gap-1 text-center text-[11.5pt]">
                <div>BP: <span className="font-normal">{data.bpSys && data.bpDia ? `${data.bpSys}/${data.bpDia}` : '-'}</span> mmHg</div>
                <div>PR: <span className="font-normal">{data.pulseRate || '-'}</span> bpm</div>
                <div>RR: <span className="font-normal">{data.respRate || '-'}</span> /min</div>
                <div>Temp: <span className="font-normal">{data.temperature || '-'}</span> °C</div>
                <div>SpO2: <span className="font-normal">{data.spo2 || '-'}</span> %</div>
                <div>Pain: <span className="font-normal">{data.painScore || '-'}</span></div>
              </div>

              <div className="grid grid-cols-12 gap-x-2 text-[12pt]">
                <div className="col-span-5 space-y-0.5">
                  <span className="font-normal text-slate-800 block">Physical Exam:</span>
                  <div>• GA: <span className={data.generalAppearance && data.generalAppearance !== 'Normal' ? 'font-bold text-black' : 'font-normal text-slate-700'}>{data.generalAppearance || '-'}{data.generalAppearanceDetail && ` (${data.generalAppearanceDetail})`}</span></div>
                  <div>• HEENT: <span className={data.heent && data.heent !== 'Normal' ? 'font-bold text-black' : 'font-normal text-slate-700'}>{data.heent || '-'}{data.heentDetail && ` (${data.heentDetail})`}</span></div>
                  <div>• CVS/RS: <span className={data.cvsRs && data.cvsRs !== 'Normal' ? 'font-bold text-black' : 'font-normal text-slate-700'}>{data.cvsRs || '-'}{data.cvsRsDetail && ` (${data.cvsRsDetail})`}</span></div>
                  <div>• Abd: <span className={data.abdomen && data.abdomen !== 'Normal' ? 'font-bold text-black' : 'font-normal text-slate-700'}>{data.abdomen || '-'}{data.abdomenDetail && ` (${data.abdomenDetail})`}</span>, Ext: <span className={data.extremities && data.extremities !== 'Normal' ? 'font-bold text-black' : 'font-normal text-slate-700'}>{data.extremities || '-'}</span></div>
                </div>
                <div className="col-span-7 space-y-0.5 border-l border-slate-200 pl-2">
                  <span className="font-normal text-slate-800 block">Neurological Exam:</span>
                  <div>• CN: <span className={data.cranialNerves && !data.cranialNerves.toLowerCase().includes('intact') ? 'font-bold text-black' : 'font-normal text-slate-700'}>{data.cranialNerves || 'Intact'}{data.cranialNervesDetail && ` (${data.cranialNervesDetail})`}</span></div>
                  <div>• Motor Power: <span className={data.motorPower && !data.motorPower.includes('Grade V') ? 'font-bold text-black' : 'font-normal text-slate-700'}>{data.motorPower || data.motorSensory || 'Grade V all'}{data.motorPowerDetail && ` (${data.motorPowerDetail})`}</span></div>
                  <div>• Tone: <span className="font-normal text-slate-700">{data.tone || 'Normal'}</span> | Sensory: <span className="font-normal text-slate-700">{data.sensory || 'Intact'}{data.sensoryDetail && ` (${data.sensoryDetail})`}</span></div>
                  <div>
                    • Reflex: <span className="font-normal text-slate-700">{data.reflexes || data.reflexesCerebellar || 'Normal'}{data.reflexesDetail && ` (${data.reflexesDetail})`}</span>
                    {' | '}Cerebellar: <span className="font-normal text-slate-700">{data.cerebellar || 'Normal'}{data.cerebellarDetail && ` (${data.cerebellarDetail})`}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-0.5 border-t border-dotted border-slate-300">
                <div><span className="font-normal text-slate-800">โภชนาการ:</span> <span className={data.nutrition && data.nutrition !== 'Normal' ? 'font-bold text-black' : 'font-normal text-slate-700'}>{data.nutrition || '-'}</span></div>
                <div><span className="font-normal text-slate-800">กิจวัตรประจำวัน (ADL):</span> <span className={data.adl && data.adl !== 'Independent' ? 'font-bold text-black' : 'font-normal text-slate-700'}>{data.adl || '-'}</span></div>
              </div>
            </div>
          </div>

          {/* SECTION G & H: Psychosocial & Standardized Assessment */}
          <div className="avoid-break-inside">
            <div className="border-b border-black pb-0.5 mb-1 text-black font-normal text-[12.5pt]">
              G. Psychosocial & H. Standardized Assessment (จิตสังคมและแบบประเมินมาตรฐาน)
            </div>
            <div className="grid grid-cols-2 gap-3 text-[12.5pt]">
              <div>
                <div>
                  <span className="font-normal text-slate-800">Psychosocial Stressors:</span>{' '}
                  <span className="font-normal text-slate-800">
                    {data.psychosocialStressors && data.psychosocialStressors.length > 0 ? data.psychosocialStressors.join(', ') : 'ไม่มี'}
                  </span>
                </div>
                <div>
                  <span className="font-normal text-slate-800">สภาพแวดล้อมที่อยู่:</span> <span className="font-normal text-slate-800">{data.livingEnvironment || '-'}{data.livingEnvironmentDetail && ` (${data.livingEnvironmentDetail})`}</span>
                </div>
              </div>
              <div>
                <span className="font-normal text-slate-800">ผลแบบประเมินมาตรฐาน:</span>
                {data.standardizedAssessmentStatus === 'ไม่ได้ประเมิน' ? (
                  <span className="ml-1 text-slate-600 font-normal">ไม่ได้ประเมิน</span>
                ) : (
                  <div className="space-y-0.5 mt-0.5 text-slate-800">
                    {data.phq9Score && <div>• PHQ-9: <span className={Number(data.phq9Score) >= 10 ? 'font-bold text-black' : 'font-normal'}>{data.phq9Score}</span> คะแนน</div>}
                    {data.nineQScore && <div>• 9Q: <span className={Number(data.nineQScore) >= 7 ? 'font-bold text-black' : 'font-normal'}>{data.nineQScore}</span> คะแนน</div>}
                    {data.mmseMocaScore && <div>• MMSE/MoCA: <span className={Number(data.mmseMocaScore) < 24 ? 'font-bold text-black' : 'font-normal'}>{data.mmseMocaScore}</span> คะแนน</div>}
                    {data.otherToolName && (
                      <div>• {data.otherToolName}: <span className="font-normal">{data.otherToolScore}</span> คะแนน</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <DocumentFooter data={data} pageNumber={pageNumber} totalPages={totalPages} />
      </div>
    </div>
  );

  const pages = React.useMemo(() => {
    if (hasPage4) {
      return [
        page1Fn,
        page2Fn,
        (pageNumber: number, totalPages: number) => (
          <div className="a4-page-sheet shadow-xl print:shadow-none" style={pageSheetStyle}>
            <div className="flex-1 flex flex-col justify-between min-h-0">
              <div className="space-y-2">
                <PageContinuationHeader data={data} pageNumber={pageNumber} totalPages={totalPages} />
                {renderSectionI()}
                {renderSectionJ()}
                {renderSectionK()}
                {renderSectionL()}
              </div>
              <DocumentFooter data={data} pageNumber={pageNumber} totalPages={totalPages} />
            </div>
          </div>
        ),
        (pageNumber: number, totalPages: number) => (
          <div className="a4-page-sheet shadow-xl print:shadow-none" style={pageSheetStyle}>
            <div className="flex-1 flex flex-col justify-between min-h-0">
              <div className="space-y-3">
                <PageContinuationHeader data={data} pageNumber={pageNumber} totalPages={totalPages} />
                {renderSectionM()}
                {renderSignature()}
              </div>
              <DocumentFooter data={data} pageNumber={pageNumber} totalPages={totalPages} />
            </div>
          </div>
        ),
      ];
    }

    return [
      page1Fn,
      page2Fn,
      (pageNumber: number, totalPages: number) => (
        <div className="a4-page-sheet shadow-xl print:shadow-none" style={pageSheetStyle}>
          <div className="flex-1 flex flex-col justify-between min-h-0">
            <div className="space-y-1.5">
              <PageContinuationHeader data={data} pageNumber={pageNumber} totalPages={totalPages} />
              {renderSectionI()}
              {renderSectionJ()}
              {renderSectionK()}
              {renderSectionL()}
              {renderSectionM()}
              {renderSignature()}
            </div>
            <DocumentFooter data={data} pageNumber={pageNumber} totalPages={totalPages} />
          </div>
        </div>
      ),
    ];
  }, [data, hasPage4]);

  const totalPagesCount = pages.length;

  return (
    <div
      id="psychiatric-assessment-pdf-document"
      data-fullname={data.fullName || ''}
      data-age={data.age || ''}
      data-gender={data.gender || ''}
      data-hn={data.hn || ''}
      data-an={data.an || ''}
      className="sarabun-document bg-transparent text-black mx-auto flex flex-col items-center gap-6 print:gap-0"
    >
      {pages.map((renderPage, index) => {
        const pageNumber = index + 1;
        return (
          <div key={pageNumber} className="w-full flex flex-col items-center">
            {showPageBadges && (
              <div
                className="w-[210mm] text-xs font-semibold text-slate-400 mb-2 flex items-center justify-between no-print px-1"
                data-html2canvas-ignore="true"
              >
                <span className="bg-slate-700/80 text-slate-200 px-3 py-1 rounded-full text-xs font-medium shadow-xs">
                  หน้า {pageNumber} จาก {totalPagesCount}
                </span>
              </div>
            )}
            {renderPage(pageNumber, totalPagesCount)}
          </div>
        );
      })}
    </div>
  );
};

export const AssessmentPdfDocument = React.memo(AssessmentPdfDocumentComponent);
