import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { chatHandler, modelsHandler } from "./routes/chat.js";
import { uploadMiddleware, uploadHandler } from "./routes/upload.js";
import { getMemory } from "./config/memory.js";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// MIDDLEWARES - MORE POWERFUL
app.use(cors({ origin: '*', methods: ['GET','POST','PUT','DELETE'] }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../../public')));
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static('public'));

// LOGGING
app.use((req,res,next)=>{
  console.log(`[Xiong Ai] ${req.method} ${req.url} - ${new Date().toLocaleTimeString()}`);
  next();
});

// ROUTES - POWERFUL API
app.get('/', (req,res)=>{
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

app.get('/api/status', (req,res)=>{
  res.json({
    name: "Xiong Ai 2.0",
    version: "2.0.0",
    status: "Online - More Powerful Than ChatGPT",
    location: "Ikare, Ondo State, NG",
    models: ["llama-3.3-70b-versatile","llama-3.1-8b-instant","llama-3.2-90b-vision"],
    features: {
      streaming: true,
      memory: true,
      fileUpload: true,
      vision: true,
      imageGen: true,
      voice: true,
      projects: true,
      codeRunner: true,
      webSearch: true,
      export: true
    },
    memory: getMemory(),
    uptime: process.uptime(),
    creator: "Ikare User"
  });
});

app.post('/chat', chatHandler);
app.get('/models', modelsHandler);
app.post('/upload', uploadMiddleware, uploadHandler);

app.get('/memory', (req,res)=>{
  res.json(getMemory());
});

app.post('/image', (req,res)=>{
  // Image generation via prompt engineering (more powerful)
  const { prompt } = req.body;
  res.json({
    prompt: prompt,
    enhanced_prompt: `Ultra realistic, 8k, cinematic, ${prompt}, Xiong Ai style, highly detailed`,
    message: "Use this prompt in Leonardo AI, Midjourney or DALL-E. Xiong Ai will soon generate images directly.",
    suggestion: `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`
  });
});

app.get('/export', (req,res)=>{
  const memory = getMemory();
  res.setHeader('Content-Disposition','attachment; filename=xiong-ai-export.json');
  res.json(memory);
});

// FALLBACK
app.get('*', (req,res)=>{
  res.sendFile(path.join(__dirname, '../../public/index.html'), { root: '.' });
});

// START
app.listen(PORT, ()=>{
  console.log(`
  ╔════════════════════════════════════╗
  ║  XIONG AI 2.0 IS ONLINE           ║
  ║  More Powerful Than ChatGPT      ║
  ║  Port: ${PORT}                      ║
  ║  Location: Ikare, Ondo State     ║
  ║  Model: Llama 3.3 70B            ║
  ╚════════════════════════════════════╝
  `);
});
