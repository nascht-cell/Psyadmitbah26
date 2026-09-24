import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const port = 3000;

// Body parser with high limit for audio payloads
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

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

// Audio transcription endpoint
app.post('/api/transcribe', async (req, res) => {
  try {
    const { audioData, mimeType } = req.body;
    if (!audioData) {
      return res.status(400).json({ error: 'audioData is required' });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'ระบบถอดความบนเซิร์ฟเวอร์ไม่ได้เปิดใช้งาน (ไม่มี GEMINI_API_KEY) กรุณาใช้ระบบแปลงเสียงพูดสดในเบราว์เซอร์',
      });
    }

    const audioPart = {
      inlineData: {
        mimeType: mimeType || 'audio/webm',
        data: audioData, // base64 encoded string
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          audioPart,
          {
            text: 'ถอดความบันทึกเสียงนี้เป็นข้อความภาษาไทยอย่างถูกต้อง ชัดเจน และคงศัพท์ทางการแพทย์/จิตเวชอย่างแม่นยำ (Transcribe this clinical psychiatric audio accurately in Thai)',
          },
        ],
      },
    });

    const transcribedText = response.text || '';
    res.json({ text: transcribedText });
  } catch (error: any) {
    console.error('Transcription error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to transcribe audio with gemini-3.5-transcribe',
    });
  }
});

// AI Psychiatric Assessment Text Parser & Field Extractor
app.post('/api/extract-assessment', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'text is required' });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'ระบบ AI บนเซิร์ฟเวอร์ไม่ได้เปิดใช้งาน (ไม่มี GEMINI_API_KEY)',
      });
    }

    const prompt = `คุณเป็นผู้ช่วยแพทย์จิตเวชในการวิเคราะห์คำพูดบรรยายประวัติผู้ป่วยภาษาไทย (Clinical Psychiatric Transcript Parser)
หน้าที่ของคุณคือรับข้อความบรรยายประวัติจากคำพูดผู้ใช้/แพทย์ แล้วสกัดข้อมูลลงในฟอร์มประเมินจิตเวชเป็น JSON

กฎเหล็กเคร่งครัดที่สุด:
1. สกัดเฉพาะข้อมูลที่มีอยู่ในข้อความบรรยายเท่านั้น
2. ห้ามมโน ห้ามคิดหรือแต่งข้อมูลขึ้นมาเองเด็ดขาด! หากข้อความไม่ได้กล่าวถึงฟิลด์ใด ให้ใส่เป็น null
3. หากผู้ป่วยมีอาการหลายระดับ ใน chiefComplaint ให้เลือกข้อที่มีความรุนแรงสูงที่สุด (Severity สูงสุด) เช่น มีความคิดทำร้ายตนเอง ให้เลือก 'อยากตาย/พยายามทำร้ายตนเอง' เป็นหลัก
4. ระยะเวลา (duration): แปลงจากข้อความ เช่น "3 สัปดาห์" -> "1-4 สัปดาห์"

รูปแบบ JSON Output Schema ที่ต้องส่งกลับ (คืนเฉพาะ JSON Object):
{
  "gender": "ชาย" | "หญิง" | null,
  "maritalStatus": "โสด" | "คู่" | "หย่า/ร้าง/แยก" | "หม้าย" | null,
  "age": string | null,
  "duration": "น้อยกว่า 1 สัปดาห์" | "1-4 สัปดาห์" | "1-6 เดือน" | "6-12 เดือน" | "มากกว่า 1 ปี" | null,
  "chiefComplaint": string[] | null,
  "precipitatingFactors": string[] | null,
  "associatedSymptoms": string[] | null,
  "hpiDetails": string | null,
  "thoughtContent": string[] | null,
  "suicideRisk": "High Risk" | "Moderate Risk" | "Low Risk" | "No Risk" | null
}

ตัวเลือกมาตรฐานสำหรับแต่ละฟิลด์:
- gender: "ชาย", "หญิง"
- maritalStatus: "โสด", "คู่", "หย่า/ร้าง/แยก", "หม้าย"
- duration: "น้อยกว่า 1 สัปดาห์", "1-4 สัปดาห์", "1-6 เดือน", "6-12 เดือน", "มากกว่า 1 ปี"
- chiefComplaint เลือกจาก:
  - "อยากตาย/พยายามทำร้ายตนเอง"
  - "ทำร้ายผู้อื่น/ก้าวร้าว"
  - "ซึมเศร้า/ท้อแท้"
  - "หูแว่ว/ประสาทหลอน"
  - "หวาดระแวง/หลงผิด"
  - "อารมณ์ดีผิดปกติ/พูดมาก"
  - "นอนไม่หลับ/หลับยาก"
  - "วิตกกังวล/ตระหนก"
  - "พฤติกรรมเปลี่ยน/วุ่นวาย"
  - "ติดสารเสพติด/สุรา"
  - "ความจำเสื่อม/สับสน"
- precipitatingFactors เลือกจาก:
  - "ปัญหาการงาน/การเรียน"
  - "ปัญหาการเงิน"
  - "ปัญหาครอบครัว/ความสัมพันธ์"
  - "ความสูญเสีย/พลัดพราก"
  - "เจ็บป่วยกาย"
  - "ขาดยา/หยุดยาเอง"
  - "ใช้สารเสพติด/สุรา"
- associatedSymptoms เลือกจาก:
  - "นอนไม่หลับ"
  - "เบื่ออาหาร"
  - "น้ำหนักลด"
  - "อ่อนเพลีย"
  - "สมาธิลดลง"
  - "ก้าวร้าว/หงุดหงิด"
- thoughtContent เลือกจาก:
  - "Suicidal ideation"
  - "Delusion"
  - "Obsession/Compulsion"
  - "Normal"
- suicideRisk เลือกจาก:
  - "High Risk"
  - "Moderate Risk"
  - "Low Risk"
  - "No Risk"

ข้อความที่ต้องวิเคราะห์:
"${text.trim()}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const jsonText = response.text || '{}';
    let extractedData = {};
    try {
      extractedData = JSON.parse(jsonText);
    } catch (e) {
      console.warn('Failed to parse AI JSON response:', jsonText);
    }

    res.json({ extracted: extractedData });
  } catch (error: any) {
    console.error('Extraction error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to extract form data from text with Gemini AI',
    });
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
