// XIONG AI 2.0 - UPLOAD ROUTE - TITAN 710 - VERY LONG - WELL CODED - IKARE TECH INC
// MORE POWERFUL THAN CHATGPT FILE ANALYZER - PDF, DOCX, JS, PY, IMAGES, VISION - 10MB - GROQ VISION
// BUILT IN IKARE, ONDO STATE, NIGERIA 🇳🇬

import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads folder exists - FIX FOR RENDER ENOENT ERROR
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  try {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    console.log(`✅ Upload folder created: ${UPLOAD_DIR}`);
  } catch (e) {
    console.warn(`⚠️ Cannot create upload folder: ${e.message} - Using tmp`);
  }
}

// MULTER CONFIG - TITAN 710 - 10MB LIMIT - FIXED
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (fs.existsSync(UPLOAD_DIR)) {
      cb(null, UPLOAD_DIR);
    } else {
      cb(null, "uploads/");
    }
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, `${unique}-${safeName}`);
  }
});

// File filter - Allow more types like ChatGPT
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    "application/pdf",
    "text/plain",
    "text/javascript",
    "application/javascript",
    "application/json",
    "text/markdown",
    "text/html",
    "text/css",
    "text/x-python",
    "application/python",
    "text/x-python-script",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "image/gif",
    "image/svg+xml",
  ];
  
  const allowedExts = /\.(pdf|txt|js|ts|json|md|html|css|py|docx|doc|png|jpg|jpeg|webp|gif|svg|java|cpp|c|go|rs|php|rb|sh|yaml|yml|xml|csv)$/i;
  
  const extAllowed = allowedExts.test(file.originalname);
  const mimeAllowed = allowedMimes.includes(file.mimetype) || file.mimetype.startsWith("text/") || file.mimetype.startsWith("image/");
  
  if (extAllowed || mimeAllowed) {
    cb(null, true);
  } else {
    console.warn(`[Upload] Blocked file: ${file.originalname} - ${file.mimetype}`);
    // Allow anyway - Titan is more powerful - Don't block
    cb(null, true);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB like ChatGPT
    files: 1,
  },
  fileFilter,
});

export const uploadMiddleware = upload.single("file");

// Helper to safely delete file
function safeUnlink(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`[Upload] Cleaned: ${filePath}`);
    }
  } catch (e) {
    console.warn(`[Upload] Cleanup failed for ${filePath}: ${e.message}`);
  }
}

// Helper to detect file type
function detectFileType(originalName, mimeType) {
  const ext = path.extname(originalName).toLowerCase();
  if (ext === ".pdf") return "pdf";
  if ([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"].includes(ext)) return "image";
  if ([".docx", ".doc"].includes(ext)) return "docx";
  if ([".js", ".ts", ".mjs", ".cjs"].includes(ext)) return "javascript";
  if ([".py", ".pyc"].includes(ext)) return "python";
  if ([".json"].includes(ext)) return "json";
  if ([".md", ".markdown"].includes(ext)) return "markdown";
  if ([".html", ".htm"].includes(ext)) return "html";
  if ([".css", ".scss"].includes(ext)) return "css";
  if ([".txt", ".log", ".env"].includes(ext)) return "text";
  if (mimeType.includes("pdf")) return "pdf";
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("text/")) return "text";
  return "unknown";
}

export async function uploadHandler(req, res) {
  let filePath = null;
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded - Choose file first",
        success: false,
        hint: "Frontend should send FormData with field name 'file'",
      });
    }

    const file = req.file;
    filePath = file.path;
    
    console.log(`[Upload] 📁 New file: ${file.originalname} | Size: ${(file.size / 1024).toFixed(1)}KB | Type: ${file.mimetype} | Saved: ${filePath}`);

    let text = "";
    let content = ""; // Both fields for compatibility with app.js
    const fileType = detectFileType(file.originalname, file.mimetype);

    // Read file based on type - TITAN 710 - MORE POWERFUL THAN CHATGPT
    if (fileType === "pdf") {
      try {
        // Dynamic import for pdf-parse - FIXED FOR ES MODULES
        const pdfModule = await import("pdf-parse");
        const pdfParser = pdfModule.default || pdfModule;
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParser(dataBuffer);
        text = pdfData.text || "";
        console.log(`[Upload] PDF parsed: ${pdfData.numpages} pages, ${text.length} chars`);
        
        if (!text.trim()) {
          text = `[PDF: ${file.originalname} - ${pdfData.numpages} pages - No extractable text - May be scanned image PDF. Use VISION model to analyze.]`;
        } else {
          text = `PDF File: ${file.originalname}\nPages: ${pdfData.numpages}\n\nContent:\n${text.slice(0, 15000)}`;
        }
      } catch (pdfErr) {
        console.error(`[Upload] PDF parse failed: ${pdfErr.message}`);
        text = `PDF File: ${file.originalname} (${(file.size/1024).toFixed(1)}KB) - Failed to extract text: ${pdfErr.message}. Try with VISION model or convert to text. File is uploaded and ready for analysis.`;
      }
    } else if (fileType === "docx") {
      try {
        // Try mammoth for docx if available
        try {
          const mammoth = await import("mammoth");
          const result = await mammoth.extractRawText({ path: filePath });
          text = result.value || "";
          console.log(`[Upload] DOCX parsed: ${text.length} chars`);
          text = `DOCX File: ${file.originalname}\n\nContent:\n${text.slice(0, 15000)}`;
        } catch {
          text = `DOCX File: ${file.originalname} (${(file.size/1024).toFixed(1)}KB) - Install 'mammoth' package for full text extraction: npm install mammoth. File is ready, you can ask Xiong Ai about it.`;
        }
      } catch (docxErr) {
        text = `DOCX File: ${file.originalname} - Error: ${docxErr.message}`;
      }
    } else if (fileType === "image") {
      // Image - For vision model
      try {
        const base64 = fs.readFileSync(filePath, { encoding: 'base64' });
        const mime = file.mimetype || 'image/png';
        text = `Image File: ${file.originalname} (${(file.size/1024).toFixed(1)}KB, Type: ${mime})\n\nThis is an image file. User uploaded image for vision analysis. Switch to VISION model (Llama 3.2 90B Vision) to analyze this image. In frontend, image will be sent as base64 for Groq Vision.\n\nImage ready for analysis. Ask user what they want to know about this image.`;
        
        // Also return base64 for vision - Don't include full base64 in text (too large)
        content = text;
        // Store small base64 preview if needed for vision endpoint
      } catch (imgErr) {
        text = `Image File: ${file.originalname} - Error reading: ${imgErr.message}`;
      }
    } else {
      // Text-based files: js, py, txt, json, md, html, css, etc. - Read as UTF-8
      try {
        // Try UTF-8 first
        text = fs.readFileSync(filePath, 'utf8');
        
        // Check if binary
        if (text.includes('\0')) {
          throw new Error("Binary file detected");
        }
        
        console.log(`[Upload] Text file read: ${text.length} chars`);
        
        // Truncate if too large but keep useful amount
        const truncated = text.length > 15000;
        text = `File: ${file.originalname}\nType: ${fileType}\nSize: ${(file.size/1024).toFixed(1)}KB\nLines: ${text.split('\n').length}\n\nContent:\n\`\`\`${fileType}\n${text.slice(0, 15000)}\n\`\`\`${truncated ? '\n\n[Truncated - First 15000 chars shown. Full file is larger, ask specific parts]' : ''}`;
      } catch (readErr) {
        console.error(`[Upload] Text read failed: ${readErr.message}`);
        // Fallback: Try to give info
        text = `File uploaded: ${file.originalname}\nSize: ${file.size} bytes\nType: ${file.mimetype}\nExtension: ${path.extname(file.originalname)}\n\nFile appears to be binary or unsupported encoding. For code files, make sure it's text-based. For images, use VISION model. File is ready, you can still ask Xiong Ai about its purpose.`;
      }
    }

    // Ensure both text and content fields - FIXES EMPTY BUBBLE BUG
    if (!text) text = `File ${file.originalname} uploaded - Ready for analysis`;
    content = content || text;

    // Clean up file - Safe delete
    safeUnlink(filePath);
    filePath = null;

    // Success response - Compatible with app.js expectations
    const response = {
      success: true,
      filename: file.originalname,
      originalname: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      fileType: fileType,
      text: text,
      content: content, // IMPORTANT: app.js looks for content
      message: `✅ File ${file.originalname} analyzed by Xiong Ai Titan 710. Now you can ask questions about it. Switch to VISION model for images.`,
      status: "Xiong Ai File Analyzer - More powerful than ChatGPT",
      timestamp: new Date().toISOString(),
    };

    console.log(`[Upload] ✅ Success: ${file.originalname} - ${text.length} chars extracted`);
    return res.json(response);

  } catch (e) {
    console.error(`[Upload] ❌ Error: ${e.message}`, e.stack);
    
    // Clean up on error too
    if (filePath) {
      safeUnlink(filePath);
    } else if (req.file && req.file.path) {
      safeUnlink(req.file.path);
    }

    return res.status(500).json({
      success: false,
      error: e.message,
      text: `Upload failed: ${e.message}`,
      content: `Upload failed for ${req.file?.originalname || 'unknown file'}: ${e.message}. Try smaller file (<10MB) or different format.`,
      message: `❌ File upload failed: ${e.message}`,
      hint: "Check file size <10MB, format PDF/TXT/JS/PY/DOCX/PNG/JPG, and server logs",
    });
  }
    }
