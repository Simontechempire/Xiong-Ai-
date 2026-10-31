// XIONG AI 2.0 - SERVER.JS - TITAN 710 - VERY LONG - WELL CODED - IKARE TECH INC
// MORE POWERFUL THAN CHATGPT - 710+ FEATURES - FIXED RENDER + STATIC PATH + CORS + GROQ
// BUILT IN IKARE, ONDO STATE, NIGERIA 🇳🇬 - POWER • LOYALTY • EXCELLENCE

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Load env first
dotenv.config();

// Get __dirname for ES modules - FIX FOR RENDER STATIC PATH BUG
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes after env load
import { chatHandler, modelsHandler } from "./routes/chat.js";
import { uploadHandler } from "./routes/upload.js";
import { getMemory } from "./config/memory.js";

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

// ═══════════════════════════════════════════════════
// MIDDLEWARE - TITAN 710 - PRODUCTION READY
// ═══════════════════════════════════════════════════

// CORS - Allow all origins for Render + Vercel + localhost
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: false,
}));

// JSON body - 50mb for file uploads + large chats
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Request logger - Titan style
app.use((req, res, next) => {
  const start = Date.now();
  const originalSend = res.send;
  const originalJson = res.json;
  
  res.send = function(body) {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms - IP: ${req.ip}`);
    return originalSend.call(this, body);
  };
  
  res.json = function(body) {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    return originalJson.call(this, body);
  };
  
  next();
});

// ═══════════════════════════════════════════════════
// STATIC FILES - FIXED FOR RENDER - 3 PATH FALLBACKS
// THIS FIXES DASHBOARD NOT SHOWING / BLANK PAGE
// ═══════════════════════════════════════════════════

const possiblePublicPaths = [
  path.join(__dirname, "../public"),           // src/../public - Normal local
  path.join(__dirname, "../../public"),        // src/../../public - If src is nested
  path.join(__dirname, "public"),              // src/public - Fallback
  path.join(process.cwd(), "public"),          // cwd/public - Render cwd
  path.join(process.cwd(), "src/public"),      // cwd/src/public
  "public",                                    // Relative fallback
];

let staticPathFound = false;
for (const p of possiblePublicPaths) {
  if (fs.existsSync(p)) {
    console.log(`✅ Static path found: ${p}`);
    app.use(express.static(p, {
      maxAge: NODE_ENV === "production" ? "1d" : "0",
      etag: true,
      lastModified: true,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".html")) {
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        }
      }
    }));
    if (!staticPathFound) {
      staticPathFound = true;
      // Also serve root index.html for all static paths
      app.get("/", (req, res) => {
        const indexPath = path.join(p, "index.html");
        if (fs.existsSync(indexPath)) {
          res.sendFile(path.resolve(indexPath));
        } else {
          res.send(`<!DOCTYPE html><html><body style="background:#000;color:white;font-family:sans-serif;padding:40px"><h1>⚡ Xiong Ai 2.0 Titan - Index not found</h1><p>Public path: ${p}</p><p>Files: ${fs.readdirSync(p).join(', ')}</p><p>Check src/server.js static paths</p><a href="/api/status" style="color:#3b82f6">Check Status</a></body></html>`);
        }
      });
    }
  }
}

if (!staticPathFound) {
  console.warn("⚠️ No public folder found in any path - Checked:", possiblePublicPaths);
}

// ═══════════════════════════════════════════════════
// API ROUTES - TITAN 710
// ═══════════════════════════════════════════════════

// Main chat endpoint - STREAMING + NON-STREAMING - FIXED EMPTY BUBBLE
app.post("/chat", chatHandler);

// File upload - PDF, JS, PY, DOCX, Images - 10MB
app.post("/upload", uploadHandler);

// Image generation - Pollinations + enhancer
app.post("/image", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt required" });
    
    // Enhance prompt like ChatGPT DALL-E
    const enhanced = `${prompt}, ultra realistic, 8k, cinematic lighting, highly detailed, masterpiece`;
    const encoded = encodeURIComponent(enhanced);
    const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&nologo=true&enhance=true`;
    
    res.json({ 
      url: imageUrl, 
      prompt: enhanced, 
      original: prompt,
      status: "Xiong Ai Image Gen - Pollinations Free Unlimited"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Status - Health check - Render pings this - MUST SHOW groq_key_set: true
app.get("/api/status", modelsHandler);
app.get("/status", modelsHandler);
app.get("/health", (req, res) => {
  res.json({ 
    status: "Xiong Ai 2.0 Titan 710 - ACTIVE 🟢 ONLINE 24/7",
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    groq_key_set: !!process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes('dummy'),
    version: "2.0.0 Titan 710",
    location: "Ikare, Ondo State, Nigeria 🇳🇬",
    models: ["FAST", "SMART", "VISION", "REASONING"],
    timestamp: new Date().toISOString(),
    env: NODE_ENV,
    port: PORT,
    public_path_found: staticPathFound,
  });
});

// Memory - Get all chats
app.get("/memory", (req, res) => {
  try {
    const mem = getMemory();
    res.json(mem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export - Download all chats as JSON backup
app.get("/export", (req, res) => {
  try {
    const mem = getMemory();
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename=xiong-ai-backup-${Date.now()}.json`);
    res.json({
      exportDate: new Date().toISOString(),
      version: "2.0.0 Titan 710",
      ...mem
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Models list
app.get("/models", modelsHandler);
app.get("/api/models", modelsHandler);

// Clear memory (for testing)
app.delete("/memory", (req, res) => {
  try {
    const { clearMemory } = require("./config/memory.js");
    // If you have clearMemory function
    res.json({ status: "Memory clear endpoint - Implement in memory.js if needed" });
  } catch {
    res.json({ status: "Use localStorage.clear() on frontend" });
  }
});

// ═══════════════════════════════════════════════════
// FALLBACK - SERVE INDEX.HTML FOR SPA ROUTING
// FIXES 404 ON REFRESH - CHATGPT CLONE NEEDS THIS
// ═══════════════════════════════════════════════════

app.get("*", (req, res) => {
  // Don't fallback for API routes
  if (req.path.startsWith("/api/") || req.path.startsWith("/chat") || req.path.startsWith("/upload") || req.path.startsWith("/image") || req.path.startsWith("/memory") || req.path.startsWith("/export") || req.path.startsWith("/models") || req.path.startsWith("/status") || req.path.startsWith("/health")) {
    return res.status(404).json({ error: "API endpoint not found", path: req.path, available: ["/chat", "/upload", "/api/status", "/memory", "/export", "/image", "/models"] });
  }

  // Try to serve index.html from any found public path
  for (const p of possiblePublicPaths) {
    const indexPath = path.join(p, "index.html");
    if (fs.existsSync(indexPath)) {
      return res.sendFile(path.resolve(indexPath));
    }
  }

  // If no index.html found, show helpful error
  res.status(404).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Xiong Ai - Not Found</title></head>
    <body style="background:#000;color:#ececec;font-family:system-ui,sans-serif;padding:40px;max-width:700px;margin:0 auto">
      <h1 style="font-size:28px">⚡ Xiong Ai 2.0 - File Not Found</h1>
      <p style="color:#8a8a8a;margin:16px 0">Path: ${req.path}</p>
      <p>Public folder not found. Checked paths:</p>
      <ul style="color:#8a8a8a;font-size:13px;line-height:1.8">${possiblePublicPaths.map(p=>`<li>${p} - ${fs.existsSync(p)?'✅ Exists':'❌ Not found'}</li>`).join('')}</ul>
      <br>
      <a href="/api/status" style="color:#3b82f6;text-decoration:none;border:1px solid #2a2a2a;padding:10px 16px;border-radius:999px;display:inline-block">Check Status 🟢</a>
      <a href="/" style="color:#3b82f6;text-decoration:none;border:1px solid #2a2a2a;padding:10px 16px;border-radius:999px;display:inline-block;margin-left:10px">Go Home</a>
      <br><br>
      <p style="font-size:12px;color:#5a5a5a">Built in Ikare, Ondo State, Nigeria 🇳🇬 - Titan 710 - More Powerful Than ChatGPT</p>
    </body>
    </html>
  `);
});

// ═══════════════════════════════════════════════════
// ERROR HANDLERS - TITAN 710
// ═══════════════════════════════════════════════════

app.use((err, req, res, next) => {
  console.error("═══════════════════════════════════════════════");
  console.error("❌ Xiong Ai Server Error:", err.message);
  console.error(err.stack);
  console.error("Path:", req.path, "Method:", req.method);
  console.error("═══════════════════════════════════════════════");
  
  if (res.headersSent) {
    return next(err);
  }
  
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    reply: `⚠️ Xiong Ai Server Error: ${err.message}\n\nCheck Render Logs for details. If Groq API error, check GROQ_API_KEY in Environment Variables.\n\nBuilt in Ikare, Ondo State - Titan 710`,
    status: "Xiong Ai Error - Ikare Tech Inc",
    path: req.path,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler for API (already handled above, but keep as fallback)
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    path: req.path,
    availableEndpoints: ["/", "/chat", "/upload", "/image", "/api/status", "/memory", "/export", "/models", "/health"],
    status: "Xiong Ai 2.0 Titan 710",
    message: "Go to / for ChatGPT clone dashboard"
  });
});

// ═══════════════════════════════════════════════════
// START SERVER - TITAN 710 - IKARE TECH INC
// ═══════════════════════════════════════════════════

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║  ███╗  ███╗ ██╗  ██████╗  ███╗   ██╗  ██████╗               ║
║   ╚██╗██╔╝ ██║ ██╔═══██╗ ████╗  ██║ ██╔════╝                ║
║    ╚███╔╝  ██║ ██║   ██║ ██╔██╗ ██║ ██║  ███╗               ║
║    ██╔██╗  ██║ ██║   ██║ ██║╚██╗██║ ██║   ██║               ║
║   ██╔╝ ██╗ ██║ ╚██████╔╝ ██║ ╚████║ ╚██████╔╝               ║
║   ╚═╝  ╚═╝ ╚═╝  ╚═════╝  ╚═╝  ╚═══╝  ╚═════╝                ║
║                                                            ║
║  ⚡ XIONG AI 2.0 TITAN 710 - MORE POWERFUL THAN CHATGPT ⚡  ║
║  🏷️  VERSION: 2.0.0 TITAN 710 - 710+ FEATURES              ║
║  📍 LOCATION: IKARE, ONDO STATE, NIGERIA 🇳🇬                ║
║  👑 BUILT BY: IKARE BOSS - IKARE TECH INC                   ║
║  🚀 STATUS: ACTIVE 🟢 ONLINE 24/7                           ║
║  ⚡ POWER: ∞ UNLIMITED - TITAN 710                          ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

  🌐 Server running at: http://0.0.0.0:${PORT}
  🌐 Local: http://localhost:${PORT}
  🌐 Network: http://192.168.x.x:${PORT}
  
  📁 Public paths checked: ${possiblePublicPaths.length}
  ✅ Static found: ${staticPathFound ? 'YES' : 'NO - CHECK LOGS'}
  
  🔑 Groq API Key: ${process.env.GROQ_API_KEY ? `${process.env.GROQ_API_KEY.slice(0,8)}...${process.env.GROQ_API_KEY.slice(-4)} ✅ SET` : '❌ NOT SET - ADD TO RENDER ENVIRONMENT'}
  🤖 Models: ${Object.values(require('./config/groq.js').MODELS || { SMART: 'llama-3.3-70b' }).slice(0,4).join(', ')}
  
  📡 Endpoints:
     POST /chat       - Chat streaming - Titan 710
     POST /upload     - File upload analyzer
     POST /image      - Image generation
     GET  /api/status - Health check - Groq key status
     GET  /memory     - Get memory
     GET  /export     - Export backup
     GET  /models     - List models
     GET  /health     - Simple health
     GET  /           - ChatGPT clone dashboard

  💡 If dashboard not showing:
     1. Check public folder exists
     2. Check Render -> Environment -> GROQ_API_KEY set
     3. Check Logs for errors
     4. Hard refresh: Ctrl+Shift+R

  🔥 Wolf Never Sleeps • Xiong Never Sleeps • Titan 710 🔥
  `);

  // Check Groq key on startup
  if (!process.env.GROQ_API_KEY) {
    console.log(`
    ╔════════════════════════════════════════════════════╗
    ║  ❌ GROQ_API_KEY MISSING - XIONG AI WILL NOT REPLY ║
    ║                                                    ║
    ║  Fix:                                              ║
    ║  1. Go to https://console.groq.com                  ║
    ║  2. Create API Key (free, no credit card)           ║
    ║  3. Copy key gsk_...                               ║
    ║  4. Render Dashboard -> Environment -> Add         ║
    ║     GROQ_API_KEY = gsk_...                         ║
    ║  5. Save -> Manual Deploy -> Clear cache & deploy  ║
    ╚════════════════════════════════════════════════════╝
    `);
  }
});

// Graceful shutdown - Titan style
process.on('SIGTERM', () => {
  console.log('⚠️ SIGTERM received - Shutting down Xiong Ai Titan gracefully...');
  server.close(() => {
    console.log('✅ Xiong Ai Titan server closed - Wolf Never Sleeps, Xiong Never Sleeps');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('⚠️ SIGINT received - Shutting down...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception - Xiong Ai Titan:', err);
  console.error(err.stack);
  // Don't exit in production - keep alive like Titan
  if (NODE_ENV !== 'production') {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit in production
});

export default app;
