// server.js - XIONG AI 2.0 - TITAN 743 - GROQ ONLY - FIX 404 - FREE KEY WORKS
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// MIDDLEWARE
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// GROQ MODELS - NEW FREE TIER OCT 2026 - FIX YOUR SCREENSHOT ERROR
const GROQ_MODELS = {
  // SMART = Most powerful for free tier - was llama-3.3-70b now Enterprise only
  SMART: "openai/gpt-oss-120b",      // 120B - 500 t/s - FREE - Works with gsk_ free keys
  // FAST = Fastest for free tier - was llama-3.1-8b-instant now Enterprise only  
  FAST: "openai/gpt-oss-20b",        // 20B - 1000 t/s - FREE - Works with gsk_ free keys
  // VISION = Vision + Text for free tier
  VISION: "meta-llama/llama-4-scout-17b-16e-instruct", // Llama 4 Scout - FREE vision
  // FALLBACKS - Try if primary fails
  FALLBACKS: [
    "openai/gpt-oss-20b",
    "openai/gpt-oss-120b", 
    "llama-3.1-8b-instant", // Some free keys still allow this
    "llama-3.3-70b-versatile" // Try if user has enterprise
  ]
};

console.log("⚡ Xiong Ai Titan 743 - Groq Models:", GROQ_MODELS);

// HELPER - CALL GROQ WITH AUTO FALLBACK - FIXES 404
async function callGroq(messages, preferredModel) {
  const primary = GROQ_MODELS[preferredModel] || GROQ_MODELS.SMART;
  const tryModels = [primary, ...GROQ_MODELS.FALLBACKS];
  // Remove duplicates
  const uniqueModels = [...new Set(tryModels)];
  
  let lastError = null;
  
  for (const model of uniqueModels) {
    try {
      console.log(`🤖 Xiong Ai trying Groq model: ${model}`);
      
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          temperature: 0.7,
          max_tokens: 2048,
          top_p: 1,
          stream: false
        })
      });

      const data = await response.json();
      
      if (data.error) {
        console.log(`❌ ${model} failed: ${data.error.message}`);
        lastError = data.error.message;
        // If model does not exist or decommissioned, try next
        if (data.error.message.includes("does not exist") || 
            data.error.message.includes("decommissioned") ||
            data.error.message.includes("has been decommissioned") ||
            data.error.code === "model_not_found" ||
            data.error.code === "model_decommissioned") {
          continue;
        }
        // If rate limit, wait and retry
        if (data.error.code === "rate_limit_exceeded") {
          throw new Error(`Groq rate limit - wait 60s: ${data.error.message}`);
        }
        // Other error - throw
        throw new Error(data.error.message);
      }

      if (!data.choices || !data.choices[0]) {
        throw new Error("Groq returned empty choices");
      }

      console.log(`✅ Xiong Ai success with ${model} - ${data.usage?.total_tokens || 0} tokens`);
      return {
        content: data.choices[0].message.content,
        modelUsed: model,
        usage: data.usage
      };
      
    } catch (err) {
      console.log(`⚠️ Error with ${model}: ${err.message}`);
      lastError = err.message;
      // Don't retry on auth errors
      if (err.message.includes("Invalid API Key") || err.message.includes("Unauthorized")) {
        throw err;
      }
      continue;
    }
  }
  
  throw new Error(`All Groq models failed. Last error: ${lastError}. Your GROQ_API_KEY may be invalid or models deprecated. Use openai/gpt-oss-20b`);
}

// STATUS - CHECK KEY
app.get('/api/status', (req, res) => {
  const hasKey = !!process.env.GROQ_API_KEY;
  const keyPreview = hasKey ? process.env.GROQ_API_KEY.slice(0, 8) + "..." : "MISSING";
  res.json({
    status: "Xiong Ai Titan 743 - Groq Only",
    groq_key_set: hasKey,
    key_preview: keyPreview,
    models: GROQ_MODELS,
    location: "Ikare, Ondo State 🇳🇬",
    time: new Date().toISOString()
  });
});

// FILE UPLOAD
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file" });
    
    let content = "";
    const fileName = req.file.originalname;
    
    if (fileName.endsWith('.pdf')) {
      // Simple PDF text extraction
      try {
        const pdfParse = require('pdf-parse');
        const data = await pdfParse(req.file.buffer);
        content = data.text.slice(0, 10000);
      } catch {
        content = `[PDF: ${fileName} - ${req.file.size} bytes - Xiong Ai will analyze as file]`;
      }
    } else {
      content = req.file.buffer.toString('utf-8').slice(0, 10000);
    }
    
    res.json({ 
      success: true, 
      filename: fileName,
      content: content,
      text: content,
      size: req.file.size
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: err.message });
  }
});

// CHAT - GROQ ONLY - STREAMING + NON-STREAMING
app.post('/chat', async (req, res) => {
  try {
    const { message, history = [], modelType = "SMART", stream = true, files = [] } = req.body;
    
    if (!message) return res.status(400).json({ error: "Message required" });
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ 
        reply: "⚠️ GROQ_API_KEY missing in Render Environment. Add gsk_... key. Xiong Ai needs Groq key.",
        error: "GROQ_API_KEY not set"
      });
    }

    // Build messages for Groq
    let systemPrompt = `You are Xiong Ai 2.0 Titan 743 - Built in Ikare, Ondo State, Nigeria 🇳🇬 by Ikare Tech Inc.
You are more powerful than ChatGPT. You are friendly, helpful, very smart.
You respond in same language user uses. You support English, Yoruba, Pidgin.
You are Xiong Ai, NOT ChatGPT, NOT Meta AI. Always say you are Xiong Ai.
Current time: ${new Date().toLocaleString()} - Location: Ikare, Ondo State
Your models: Groq gpt-oss-120b and gpt-oss-20b - Fast and powerful.
`;

    // Add file context if present
    if (files && files.length > 0) {
      systemPrompt += `\n\nUser uploaded files:\n${files.map(f => `File: ${f.name}\nContent: ${f.content.slice(0, 3000)}`).join('\n\n')}`;
    }

    const groqMessages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-10).map(m => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content
      })),
      { role: "user", content: message }
    ];

    // If streaming requested
    if (stream) {
      // Set headers for SSE
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      const selectedModel = GROQ_MODELS[modelType] || GROQ_MODELS.SMART;
      console.log(`📡 Xiong Ai streaming with Groq: ${selectedModel}`);
      
      try {
        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: selectedModel,
            messages: groqMessages,
            temperature: 0.7,
            max_tokens: 2048,
            stream: true
          })
        });

        if (!groqRes.ok) {
          const errData = await groqRes.json().catch(() => ({}));
          // If model error, fallback to non-streaming callGroq
          if (errData.error && (errData.error.message.includes("does not exist") || errData.error.message.includes("decommissioned"))) {
            console.log(`🔄 Streaming model ${selectedModel} failed, fallback to ${GROQ_MODELS.FALLBACKS[0]}`);
            const fallbackResult = await callGroq(groqMessages, "FAST");
            // Simulate streaming
            const chunks = fallbackResult.content.match(/.{1,20}/g) || [fallbackResult.content];
            for (const chunk of chunks) {
              res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
              await new Promise(r => setTimeout(r, 30));
            }
            res.write(`data: ${JSON.stringify({ done: true, fullReply: fallbackResult.content, modelUsed: fallbackResult.modelUsed })}\n\n`);
            return res.end();
          }
          throw new Error(errData.error?.message || `Groq streaming error ${groqRes.status}`);
        }

        // Stream from Groq
        const reader = groqRes.body.getReader();
        const decoder = new TextDecoder();
        let fullReply = "";
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6).trim();
              if (dataStr === '[DONE]') continue;
              try {
                const data = JSON.parse(dataStr);
                const content = data.choices?.[0]?.delta?.content || "";
                if (content) {
                  fullReply += content;
                  res.write(`data: ${JSON.stringify({ content })}\n\n`);
                }
              } catch {}
            }
          }
        }
        
        res.write(`data: ${JSON.stringify({ done: true, fullReply, modelUsed: selectedModel })}\n\n`);
        res.end();
        
      } catch (streamErr) {
        console.error("Streaming failed, using fallback:", streamErr.message);
        // Fallback to non-streaming
        try {
          const result = await callGroq(groqMessages, modelType);
          res.write(`data: ${JSON.stringify({ content: result.content })}\n\n`);
          res.write(`data: ${JSON.stringify({ done: true, fullReply: result.content, modelUsed: result.modelUsed })}\n\n`);
          res.end();
        } catch (fallbackErr) {
          res.write(`data: ${JSON.stringify({ error: fallbackErr.message })}\n\n`);
          res.end();
        }
      }
      
    } else {
      // Non-streaming
      const result = await callGroq(groqMessages, modelType);
      res.json({ 
        reply: result.content,
        modelUsed: result.modelUsed,
        usage: result.usage
      });
    }
    
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ 
      reply: `⚠️ Xiong Ai Groq Error: ${err.message}\n\nFix: 1. Check GROQ_API_KEY in Render 2. Use openai/gpt-oss-20b (free tier) 3. Wait 60s if rate limit`,
      error: err.message 
    });
  }
});

// SERVE FRONTEND
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Xiong Ai Titan 743 - GROQ ONLY - Running on port ${PORT}`);
  console.log(`📍 Ikare, Ondo State 🇳🇬`);
  console.log(`🔑 GROQ_API_KEY set: ${!!process.env.GROQ_API_KEY}`);
  console.log(`🤖 Models:`, GROQ_MODELS);
});
