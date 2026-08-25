import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// In-memory cache for generated TTS audio to serve repeated requests instantly
const ttsCache = new Map<string, { audio: string; mimeType: string }>();

// High-quality Vietnamese voice generator (Google TTS & Gemini AI)
async function generateVietnameseAudio(text: string): Promise<{ audio: string; mimeType: string } | null> {
  // 1. High-speed, natural Vietnamese Voice (matching the preschool teacher sample)
  try {
    const cleanText = text.replace(/[*_~`#]/g, '').trim().slice(0, 300);
    const encoded = encodeURIComponent(cleanText);
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encoded}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Referer': 'https://translate.google.com/',
      },
    });

    if (response.ok) {
      const arrayBuf = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuf);
      if (buffer.length > 100) {
        return {
          audio: buffer.toString('base64'),
          mimeType: 'audio/mp3',
        };
      }
    }
  } catch (err) {
    console.warn("Standard Vietnamese TTS error:", err);
  }
  return null;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Lazy initialize Gemini client
  let aiClient: GoogleGenAI | null = null;
  function getAI(): GoogleGenAI | null {
    if (!aiClient && process.env.GEMINI_API_KEY) {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return aiClient;
  }

  // API endpoint for natural preschool Vietnamese speech generation
  app.post("/api/tts", async (req, res) => {
    try {
      const { text, tone } = req.body;
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: "Missing text parameter" });
      }

      const cacheKey = `${tone || 'female'}:${text.trim()}`;
      if (ttsCache.has(cacheKey)) {
        const cached = ttsCache.get(cacheKey)!;
        return res.json(cached);
      }

      // 1. Primary: High-speed authentic Vietnamese voice generator
      const viAudio = await generateVietnameseAudio(text);
      if (viAudio) {
        if (ttsCache.size > 800) {
          const firstKey = ttsCache.keys().next().value;
          if (firstKey) ttsCache.delete(firstKey);
        }
        ttsCache.set(cacheKey, viAudio);
        return res.json(viAudio);
      }

      // 2. Secondary: Gemini TTS Preview if configured
      const ai = getAI();
      if (ai) {
        const promptText = `Đọc bằng giọng Tiếng Việt của cô giáo mầm non dạy bé (Bé Nem) học tập. Giọng đọc nữ trong trẻo, ngọt ngào, truyền cảm, phát âm tròn vành rõ chữ, nhịp điệu chậm rãi vừa phải, vui tươi, ấm áp, thân thiện và tràn đầy tình cảm yêu thương dành cho bé: "${text.trim()}"`;

        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-tts-preview",
          contents: [
            {
              parts: [{ text: promptText }],
            },
          ],
          config: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: tone === 'male' ? 'Fenrir' : 'Kore' },
              },
            },
          },
        });

        const candidate = response.candidates?.[0];
        const audioPart = candidate?.content?.parts?.[0];
        if (audioPart?.inlineData?.data) {
          const result = {
            audio: audioPart.inlineData.data,
            mimeType: audioPart.inlineData.mimeType || "audio/pcm;rate=24000",
          };
          ttsCache.set(cacheKey, result);
          return res.json(result);
        }
      }

      return res.status(500).json({ error: "No audio stream generated" });
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      const isRateLimit = error?.status === 429 || errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('Quota exceeded');
      
      if (isRateLimit) {
        return res.status(429).json({ 
          error: "TTS rate limit reached. Falling back to local high-quality voice.",
          rateLimited: true,
          retryAfter: 30
        });
      }

      console.warn("TTS generation notice:", errorMsg);
      return res.status(500).json({ error: errorMsg });
    }
  });

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "Be Vui Hoc Server" });
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
