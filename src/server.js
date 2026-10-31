// src/server.js - XIONG AI 2.0 - TITAN 744 - GROQ SDK ONLY - FIX 404 - ESM - FREE KEY WORKS
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

// GROQ CLIENT
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// GROQ MODELS - NEW FREE TIER OCT 2026 - FIX YOUR SCREENSHOT 404
// OLD DELETED: llama-3-70b-versatile (your error) + llama-3.3-70b-versatile (now Enterprise only)
const GROQ_MODELS = {
  SMART: "openai/gpt-oss-120b",      // 120B - 500 t/s - FREE - Works with free gsk_ keys
  FAST: "openai/gpt-oss-20b",        // 20B - 1000 t/s - FREE - Works with free gsk_ keys
  VISION: "meta-llama/llama-4-scout-17b-16e-instruct", // Llama 4 Scout vision - FREE
  FALLBACKS: [
    "openai/gpt-oss-20b",
    "openai/gpt-oss-120b",
    "llama-3.1-8b-instant", // Some free keys still work
    "llama-3.3-70b-versatile" // Enterprise only - last try
  ]
};

console.log("⚡ Xiong Ai Titan 744 - Groq SDK - Models:", GROQ_MODELS);
console.log("🔑 GROQ_API_KEY set:", !!process.env.GROQ_API_KEY);

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve frontend - your public is at project root /public not /src/public
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));

// Helper - Call Groq with fallback - Fixes 404
async function callGroqWithFallback(messages, preferredModel = "SMART", stream = false) {
  const primary = GROQ_MODELS[preferredModel] || GROQ_MODELS.SMART;
  const modelsToTry = [...new Set([primary, ...GROQ_MODELS.FALLBACKS])];
  
  let lastError = null;

  for (const model of modelsToTry) {
    try {
      console.log(`🤖 Xiong Ai trying Groq model: ${model} (stream: ${stream})`);

      if (stream) {
        // Streaming
        const streamRes = await groq.chat.completions.create({
          model: model,
          messages: messages,
          temperature: 0.7,
          max_tokens: 2048,
          stream: true
        });
        return { stream: streamRes, modelUsed: model, isStream: true };
      } else {
        // Non-streaming
        const completion = await groq.chat.completions.create({
          model: model,
          messages: messages,
          temperature: 0.7,
          max_tokens: 2048,
          stream: false
        });
        return {
          content: completion.choices[0]?.message?.content || "",
          modelUsed: model,
          usage: completion.usage,
          isStream: false
        };
      }

    } catch (err) {
      const msg = err?.error?.message || err?.message || String(err);
      console.log(`❌ ${model} failed: ${msg}`);
      lastError = msg;
      
      // If model not found / decommissioned - try next
      if (msg.includes("does not exist") || msg.includes("decommissioned") || msg.includes("model_not_found") || msg.includes("model_decommissioned") || err?.status === 404) {
        continue;
      }
      // Rate limit - throw
      if (msg.includes("rate_limit") || err?.status === 429) {
        throw new Error(`Groq rate limit - wait 60s: ${msg}`);
      }
      // Auth error - stop
      if (msg.includes("Invalid API Key") || msg.includes("Unauthorized") || err?.status === 401) {
        throw new Error(`Invalid GROQ_API_KEY - check Render Env: ${msg}`);
      }
      continue;
    }
  }
  
  throw new Error(`All Groq models failed. Last: ${lastError}. Your free key needs openai/gpt-oss-20b model.`);
}

// API STATUS
app.get('/api/status', (req, res) => {
  res.json({
    status: "Xiong Ai Titan 744 - Groq SDK Only - ESM",
    groq_key_set: !!process.env.GROQ_API_KEY,
    key_preview: process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.slice(0, 10) + "..." : "MISSING",
    models: GROQ_MODELS,
    note: "Old llama-3-70b-versatile deleted by Groq - now using openai/gpt-oss-20b free",
    location: "Ikare, Ondo State / Delta 🇳🇬",
    time: new Date().toISOString()
  });
});

// FILE UPLOAD
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file" });
    let content = "";
    try {
      const { default: pdfParse } = await import('pdf-parse');
      if (req.file.originalname.endsWith('.pdf')) {
        const data = await pdfParse(req.file.buffer);
        content = data.text.slice(0, 10000);
      } else {
        content = req.file.buffer.toString('utf-8').slice(0, 10000);
      }
    } catch {
      content = req.file.buffer.toString('utf-8').slice(0, 10000);
    }
    res.json({ success: true, filename: req.file.originalname, content, text: content, size: req.file.size });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CHAT - GROQ ONLY - FIXES YOUR SCREENSHOT ERROR
app.post('/chat', async (req, res) => {
  try {
    const { message, history = [], modelType = "SMART", stream = true, files = [] } = req.body;
    if (!message) return res.status(400).json({ error: "Message required" });
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ reply: "⚠️ GROQ_API_KEY missing in Render. Add gsk_... key", error: "GROQ_API_KEY not set" });
    }

    let systemPrompt = `You are Xiong Ai 2.0 Titan 744 - Built in Ikare, Ondo State, Nigeria 🇳🇬 by Ikare Tech Inc.
You are more powerful than ChatGPT. You are friendly, helpful, very smart.
You are Xiong Ai, NOT ChatGPT. Always say you are Xiong Ai.
You use Groq gpt-oss-20b and gpt-oss-120b - fast and powerful.
Time: ${new Date().toLocaleString()}
`;

    if (files?.length) {
      systemPrompt += `\nUploaded files:\n${files.map(f => `${f.name}: ${f.content.slice(0, 3000)}`).join('\n')}`;
    }

    const groqMessages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-10).map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })),
      { role: "user", content: message }
    ];

    const selected = GROQ_MODELS[modelType] ? modelType : "SMART";

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      try {
        const result = await callGroqWithFallback(groqMessages, selected, true);
        let fullReply = "";
        
        for await (const chunk of result.stream) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            fullReply += content;
            res.write(`data: ${JSON.stringify({ content })}\n\n`);
          }
        }
        
        res.write(`data: ${JSON.stringify({ done: true, fullReply, modelUsed: result.modelUsed })}\n\n`);
        res.end();
      } catch (err) {
        console.log("Streaming failed, trying fallback non-stream:", err.message);
        try {
          const fallback = await callGroqWithFallback(groqMessages, "FAST", false);
          // Simulate streaming for frontend
          const parts = fallback.content.match(/.{1,20}/g) || [fallback.content];
          for (const p of parts) {
            res.write(`data: ${JSON.stringify({ content: p })}\n\n`);
            await new Promise(r => setTimeout(r, 25));
          }
          res.write(`data: ${JSON.stringify({ done: true, fullReply: fallback.content, modelUsed: fallback.modelUsed })}\n\n`);
          res.end();
        } catch (err2) {
          res.write(`data: ${JSON.stringify({ error: err2.message })}\n\n`);
          res.end();
        }
      }
    } else {
      const result = await callGroqWithFallback(groqMessages, selected, false);
      res.json({ reply: result.content, modelUsed: result.modelUsed, usage: result.usage });
    }

  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ reply: `⚠️ Xiong Ai Groq Error: ${err.message}\n\nFix: Check GROQ_API_KEY, use openai/gpt-oss-20b for free tier`, error: err.message });
  }
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Xiong Ai Titan 744 GROQ SDK - Running on ${PORT}`);
  console.log(`📁 Public path: ${publicPath}`);
  console.log(`🤖 Using models: ${GROQ_MODELS.SMART} / ${GROQ_MODELS.FAST}`);
});
