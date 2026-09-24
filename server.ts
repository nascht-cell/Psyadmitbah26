import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const port = 3000;

// Body parser
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Initialize GoogleGenAI with server-side API key if available
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Could not initialize GoogleGenAI client:', err);
  }
}

// Smart rule-based fallback extractor for Thai clinical transcripts
function fallbackExtractThaiClinicalText(text: string) {
  const extracted: Record<string, any> = {};

  // Gender
  if (text.includes('ชาย') || text.includes('นาย') || text.includes('ผู้ป่วยชาย')) {
    extracted.gender = 'ชาย';
  } else if (text.includes('หญิง') || text.includes('นาง') || text.includes('ผู้ป่วยหญิง')) {
    extracted.gender = 'หญิง';
  }

  // Age (e.g. "ผู้ป่วยชายไทยอายุ 65 ปี", "อายุ 65", "65 ปี")
  const ageMatch =
    text.match(/อายุ\s*(\d{1,3})/i) ||
    text.match(/ผู้ป่วย(?:\w+)?\s*(\d{1,3})\s*ปี/i) ||
    text.match(/(\d{1,3})\s*ปี/i);
  if (ageMatch) {
    extracted.age = ageMatch[1];
  }

  // Duration (e.g. "3 วัน", "2 สัปดาห์", "1 เดือน", "เป็นมา 2 ปี") - ignore "อายุ 65 ปี"
  if (
    text.includes('สามวัน') ||
    text.includes('3 วัน') ||
    text.includes('2 วัน') ||
    text.includes('1 วัน') ||
    text.includes('เมื่อวาน') ||
    text.includes('วันนี้')
  ) {
    extracted.duration = 'น้อยกว่า 1 สัปดาห์';
  } else if (text.includes('สัปดาห์') || text.includes('อาทิตย์')) {
    extracted.duration = '1-4 สัปดาห์';
  } else if (text.includes('เดือน')) {
    extracted.duration = '1-6 เดือน';
  } else {
    // Check if "ปี" refers to illness duration, e.g. "ป่วยมา 2 ปี", not "อายุ 65 ปี"
    const hasIllnessYear = /(?:ป่วย|เป็น|อาการ|รักษา|มา|ประมาณ)\s*\d+\s*ปี/i.test(text);
    if (hasIllnessYear) {
      extracted.duration = 'มากกว่า 1 ปี';
    }
  }

  // Chief Complaint
  const ccList: string[] = [];
  if (
    text.includes('อยากตาย') ||
    text.includes('ทำร้ายตนเอง') ||
    text.includes('ฆ่าตัวตาย') ||
    text.includes('ไม่อยากมีชีวิต')
  ) {
    ccList.push('อยากตาย/พยายามทำร้ายตนเอง');
  }
  if (text.includes('ทำร้ายผู้อื่น') || text.includes('ก้าวร้าว') || text.includes('โวยวาย')) {
    ccList.push('ทำร้ายผู้อื่น/ก้าวร้าว');
  }
  if (text.includes('ซึมเศร้า') || text.includes('เศร้า') || text.includes('ท้อแท้') || text.includes('ร้องไห้')) {
    ccList.push('ซึมเศร้า/ท้อแท้');
  }
  if (text.includes('หูแว่ว') || text.includes('ประสาทหลอน')) {
    ccList.push('หูแว่ว/ประสาทหลอน');
  }
  if (text.includes('ระแวง') || text.includes('หลงผิด')) {
    ccList.push('หวาดระแวง/หลงผิด');
  }
  if (text.includes('นอนไม่หลับ') || text.includes('หลับยาก')) {
    ccList.push('นอนไม่หลับ/หลับยาก');
  }
  if (text.includes('กังวล') || text.includes('เครียด')) {
    ccList.push('วิตกกังวล/ตระหนก');
  }
  if (text.includes('พฤติกรรมเปลี่ยน') || text.includes('วุ่นวาย')) {
    ccList.push('พฤติกรรมเปลี่ยน/วุ่นวาย');
  }
  if (
    text.includes('สับสน') ||
    text.includes('หลงลืม') ||
    text.includes('delirium') ||
    text.includes('มึนงง')
  ) {
    ccList.push('ความจำเสื่อม/สับสน');
  }
  if (ccList.length > 0) {
    extracted.chiefComplaint = ccList;
  }

  // Precipitating Factors
  const precipList: string[] = [];
  if (text.includes('การงาน') || text.includes('เสียการเสียงาน') || text.includes('เรียน')) {
    precipList.push('ปัญหาการงาน/การเรียน');
  }
  if (text.includes('การเงิน') || text.includes('หนี้')) {
    precipList.push('ปัญหาการเงิน');
  }
  if (text.includes('ครอบครัว') || text.includes('ภาระ') || text.includes('ความสัมพันธ์')) {
    precipList.push('ปัญหาครอบครัว/ความสัมพันธ์');
  }
  if (
    text.includes('เบาหวาน') ||
    text.includes('เจ็บป่วย') ||
    text.includes('delirium') ||
    text.includes('โซเดียม') ||
    text.includes('น้ำตาล')
  ) {
    precipList.push('เจ็บป่วยกาย');
  }
  if (text.includes('ขาดยา') || text.includes('หยุดยา') || text.includes('ไม่ต่อเนื่อง')) {
    precipList.push('ขาดยา/หยุดยาเอง');
  }
  if (precipList.length > 0) {
    extracted.precipitatingFactors = precipList;
  }

  // Associated Symptoms
  const assocList: string[] = [];
  if (text.includes('นอนไม่หลับ')) assocList.push('นอนไม่หลับ');
  if (text.includes('กินได้น้อย') || text.includes('เบื่ออาหาร')) assocList.push('เบื่ออาหาร');
  if (text.includes('อ่อนเพลีย')) assocList.push('อ่อนเพลีย');
  if (assocList.length > 0) extracted.associatedSymptoms = assocList;

  // Thought Content & Suicide Risk
  if (text.includes('อยากตาย') || text.includes('ทำร้ายตนเอง') || text.includes('ฆ่าตัวตาย')) {
    extracted.thoughtContent = ['Suicidal ideation'];
    extracted.suicideRisk = 'High Risk';
  } else if (text.includes('ระแวง') || text.includes('หลงผิด')) {
    extracted.thoughtContent = ['Delusion'];
  }

  // HPI Details
  extracted.hpiDetails = text.trim();

  return extracted;
}

// AI Psychiatric Assessment Text Parser & Field Extractor
app.post('/api/extract-assessment', async (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'text is required' });
  }

  const cleanText = text.trim();

  if (!ai) {
    // If Gemini client is not initialized, use rule-based fallback
    const fallbackData = fallbackExtractThaiClinicalText(cleanText);
    return res.json({ extracted: fallbackData });
  }

  try {
    const prompt = `คุณเป็นผู้ช่วยแพทย์จิตเวชในการวิเคราะห์ข้อความบรรยายประวัติผู้ป่วยภาษาไทย (Clinical Psychiatric Transcript Parser)
หน้าที่ของคุณคือรับข้อความบรรยายประวัติแล้วสกัดข้อมูลลงในฟอร์มประเมินจิตเวชเป็น JSON

กฎเหล็กเคร่งครัดที่สุด:
1. สกัดเฉพาะข้อมูลที่มีอยู่ในข้อความบรรยายเท่านั้น
2. หากข้อความสั้นมาก เช่น "ผู้ป่วยชายไทยอายุ 65 ปี" ให้สกัดข้อมูลเท่าที่มี เช่น gender="ชาย", age="65" ส่วนฟิลด์ที่ไม่ปรากฏในข้อความให้ใส่เป็น null
3. สังเกตอายุของผู้ป่วยให้ดี เช่น "อายุ 65 ปี" คือ age="65" (อย่าสับสนว่า 65 ปีเป็น duration ระยะเวลาการป่วย)
4. หากผู้ป่วยมีอาการหลายอย่าง ให้เลือกตัวเลือกทั้งหมดที่ตรงกับข้อความ
5. ระยะเวลา (duration): แปลงจากข้อความ เช่น "3 วัน" -> "น้อยกว่า 1 สัปดาห์"

ตัวเลือกมาตรฐานสำหรับแต่ละฟิลด์:
- gender: "ชาย", "หญิง"
- maritalStatus: "โสด", "คู่", "หย่า/ร้าง/แยก", "หม้าย"
- duration: "น้อยกว่า 1 สัปดาห์", "1-4 สัปดาห์", "1-6 เดือน", "6-12 เดือน", "มากกว่า 1 ปี"
- chiefComplaint เลือกจาก:
  "อยากตาย/พยายามทำร้ายตนเอง", "ทำร้ายผู้อื่น/ก้าวร้าว", "ซึมเศร้า/ท้อแท้", "หูแว่ว/ประสาทหลอน", "หวาดระแวง/หลงผิด", "อารมณ์ดีผิดปกติ/พูดมาก", "นอนไม่หลับ/หลับยาก", "วิตกกังวล/ตระหนก", "พฤติกรรมเปลี่ยน/วุ่นวาย", "ติดสารเสพติด/สุรา", "ความจำเสื่อม/สับสน"
- precipitatingFactors เลือกจาก:
  "ปัญหาการงาน/การเรียน", "ปัญหาการเงิน", "ปัญหาครอบครัว/ความสัมพันธ์", "ความสูญเสีย/พลัดพราก", "เจ็บป่วยกาย", "ขาดยา/หยุดยาเอง", "ใช้สารเสพติด/สุรา"
- associatedSymptoms เลือกจาก:
  "นอนไม่หลับ", "เบื่ออาหาร", "น้ำหนักลด", "อ่อนเพลีย", "สมาธิลดลง", "ก้าวร้าว/หงุดหงิด"
- thoughtContent เลือกจาก:
  "Suicidal ideation", "Delusion", "Obsession/Compulsion", "Normal"
- suicideRisk เลือกจาก:
  "High Risk", "Moderate Risk", "Low Risk", "No Risk"

ข้อความที่ต้องวิเคราะห์:
"${cleanText}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            gender: { type: Type.STRING, description: 'เพศของผู้ป่วย: "ชาย" หรือ "หญิง"' },
            maritalStatus: { type: Type.STRING, description: 'สถานภาพ: "โสด", "คู่", "หย่า/ร้าง/แยก", "หม้าย"' },
            age: { type: Type.STRING, description: 'อายุของผู้ป่วย เช่น "65"' },
            duration: { type: Type.STRING, description: 'ระยะเวลา: "น้อยกว่า 1 สัปดาห์", "1-4 สัปดาห์", "1-6 เดือน", "6-12 เดือน", "มากกว่า 1 ปี"' },
            chiefComplaint: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'รายการอาการสำคัญ'
            },
            precipitatingFactors: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'รายการปัจจัยกระตุ้น'
            },
            associatedSymptoms: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'รายการอาการร่วม'
            },
            hpiDetails: { type: Type.STRING, description: 'รายละเอียดประวัติปัจจุบัน HPI' },
            thoughtContent: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'เนื้อหาความคิด'
            },
            suicideRisk: { type: Type.STRING, description: 'ระดับความเสี่ยงทำร้ายตนเอง' }
          }
        }
      },
    });

    let jsonText = response.text || '{}';
    jsonText = jsonText.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    }

    let extractedData = {};
    try {
      extractedData = JSON.parse(jsonText);
    } catch (e) {
      console.warn('Failed to parse AI JSON response, falling back to rule extractor:', e);
      extractedData = fallbackExtractThaiClinicalText(cleanText);
    }

    res.json({ extracted: extractedData });
  } catch (error: any) {
    console.error('Extraction error with Gemini, using fallback:', error);
    // If Gemini call fails for any reason (e.g. rate limit / network), transparently fallback
    const fallbackData = fallbackExtractThaiClinicalText(cleanText);
    res.json({ extracted: fallbackData });
  }
});

// Mount Vite or serve static
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve('.', 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('.', 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening at http://0.0.0.0:${port}`);
  });
}

startServer();

