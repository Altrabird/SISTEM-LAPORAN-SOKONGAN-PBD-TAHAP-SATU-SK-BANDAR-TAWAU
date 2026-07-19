import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

// Body parser
app.use(express.json({ limit: '10mb' }));

// Lazy initialized Gemini Client helper
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY" || key === "") {
      throw new Error("GEMINI_API_KEY is not configured in environment secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// 1. POST Endpoint: generate PBD intervention strategy
app.post("/api/gemini/generate-strategies", async (req, res) => {
  const { subject, topic, currentTp, targetTp, studentCount } = req.body;

  if (!subject || !topic || !currentTp || !targetTp) {
    return res.status(400).json({ error: "Missing required parameters (subject, topic, currentTp, targetTp)." });
  }

  try {
    const ai = getGeminiClient();
    
    // Construct pedagogical structured prompt
    const languageStr = subject === 'BM' ? 'Bahasa Melayu (KSSR Tahap 1)' : 'English (KSSR Level 1)';
    const outputLanguage = subject === 'BM' ? 'Bahasa Melayu' : 'English';

    const systemPrompt = `You are an expert Malaysian primary school pedagogical consultant specialized in PBD (Pentaksiran Bilik Darjah) for Year 1 to Year 3 pupils (Tahap 1).
Your objective is to provide highly structured, active, and fun intervention strategies to help a small group of students (${studentCount} pupils) improve their mastery level (Tahap Penguasaan/TP) from TP ${currentTp} to TP ${targetTp} in ${languageStr}.
All output must be returned strictly in JSON format as per the specified schema.
The language of the response should be: ${outputLanguage}. Let it be warm, extremely professional, and easy to execute.`;

    const prompt = `Generate a customized support activity for:
Subject: ${subject}
Topic Focus: ${topic}
Current student level: TP ${currentTp}
Target level to achieve: TP ${targetTp}
Number of students in group: ${studentCount} pupils

Suggest an activity that is interactive, utilizes low-cost materials or gamified learning, and specifically scaffolds the student weaknesses at TP ${currentTp} (e.g. lack of confidence, syllable recognition or sight-word blending gaps).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            activityName: {
              type: Type.STRING,
              description: "The name of the suggested PBD support activity."
            },
            pedagogicalApproach: {
              type: Type.STRING,
              description: "The pedagogical approach used, e.g., Gamifikasi, Bimbingan Terarah, Hands-on, Multi-sensori."
            },
            detailedSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Step-by-step instructions for the teacher to execute the activity with the pupils. (Between 4 and 6 steps)."
            },
            teachingMaterials: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of teaching materials or aids needed (Bahan Bantu Mengajar / BBM)."
            },
            assessmentMethods: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of classroom assessment instruments or observation indicators to confirm pupils reached TP " + targetTp + "."
            }
          },
          required: ["activityName", "pedagogicalApproach", "detailedSteps", "teachingMaterials", "assessmentMethods"]
        }
      }
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("Empty response received from Gemini.");
    }

    const strategyJson = JSON.parse(textOutput.trim());
    return res.json(strategyJson);

  } catch (err: any) {
    console.error("Gemini Error:", err);
    return res.status(500).json({ 
      error: err.message || "Ralat dalam penjanaan AI. Sila semak GEMINI_API_KEY anda." 
    });
  }
});

// 2. Serve static/dev assets based on environment
async function start() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server mounted.");
  } else {
    // Production mode
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Static production assets mounted.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express custom server running on http://localhost:${PORT}`);
  });
}

start();
