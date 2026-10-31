// XIONG AI MEMORY SYSTEM - TITAN 710 - VERY LONG - WELL CODED - IKARE TECH INC
// MORE POWERFUL THAN CHATGPT MEMORY - 24/7 PERSISTENT - FILE + MEMORY + SEARCH - 710+ FEATURES
// BUILT IN IKARE, ONDO STATE, NIGERIA 🇳🇬 - POWER • LOYALTY • EXCELLENCE

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MEMORY FILE PATH - PERSISTENT - FIX FOR RENDER RESTART WIPE BUG
const MEMORY_DIR = path.join(process.cwd(), "data");
const MEMORY_FILE = path.join(MEMORY_DIR, "xiong-memory.json");
const BACKUP_DIR = path.join(MEMORY_DIR, "backups");

// Ensure data folders exist - FIX ENOENT ON RENDER
try {
  if (!fs.existsSync(MEMORY_DIR)) {
    fs.mkdirSync(MEMORY_DIR, { recursive: true });
    console.log(`✅ Memory dir created: ${MEMORY_DIR}`);
  }
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
} catch (e) {
  console.warn(`⚠️ Memory dir creation failed: ${e.message} - Using in-memory only`);
}

// DEFAULT MEMORY - TITAN 710 - MORE POWERFUL THAN CHATGPT
let globalMemory = {
  user: {
    name: "Ikare Boss",
    displayName: "Ikare Boss",
    location: "Ikare, Ondo State, Nigeria 🇳🇬",
    city: "Ikare",
    state: "Ondo State",
    country: "Nigeria",
    interests: ["WhatsApp Bot", "Xiong Ai", "Crasher MD V2", "Wolf XMD", "Baileys", "Node.js", "Groq AI", "Render Deployment"],
    projects: [
      { id: "xiong", name: "Xiong Ai Core", desc: "More powerful than ChatGPT - Titan 710", status: "active", color: "#3b82f6" },
      { id: "crasher", name: "Crasher MD V2", desc: "WhatsApp bot 200 commands", status: "active", color: "#ef4444" },
      { id: "wolf", name: "Wolf XMD Clone", desc: "Titan 710 README cross typing", status: "active", color: "#10b981" },
    ],
    lang: "english",
    joined: new Date().toISOString(),
    lastSeen: new Date().toISOString(),
    totalChats: 0,
  },
  conversations: [],
  preferences: {
    language: "english",
    codeStyle: "detailed",
    responseLength: "very long",
    model: "SMART",
    theme: "dark",
    voice: true,
    imageGen: true,
    fileAnalyzer: true,
    memory: true,
    projects: true,
    codeRunner: true,
    webSearch: true,
    export: true,
    notifications: true,
    autoSave: true,
  },
  stats: {
    totalChats: 0,
    totalMessages: 0,
    totalTokens: 0,
    filesUploaded: 0,
    imagesGenerated: 0,
    codeRuns: 0,
    startDate: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    version: "2.0.0 Titan 710",
  },
  system: {
    version: "2.0.0 Titan 710",
    name: "Xiong Ai 2.0",
    status: "ACTIVE 🟢 ONLINE 24/7",
    location: "Ikare, Ondo State, Nigeria 🇳🇬",
    creator: "Ikare Boss - Ikare Tech Inc",
    power: "∞ UNLIMITED",
    features: 710,
    built: new Date().toISOString(),
  }
};

// LOAD MEMORY FROM FILE - PERSISTENT - FIX FOR RENDER WIPE
function loadMemoryFromFile() {
  try {
    if (fs.existsSync(MEMORY_FILE)) {
      const data = fs.readFileSync(MEMORY_FILE, 'utf8');
      const parsed = JSON.parse(data);
      
      // Merge with defaults to ensure new fields exist
      globalMemory = {
        ...globalMemory,
        ...parsed,
        user: { ...globalMemory.user, ...(parsed.user || {}) },
        preferences: { ...globalMemory.preferences, ...(parsed.preferences || {}) },
        stats: { ...globalMemory.stats, ...(parsed.stats || {}) },
        system: { ...globalMemory.system, ...(parsed.system || {}) },
      };
      
      console.log(`✅ Xiong Ai Memory loaded: ${globalMemory.conversations.length} conversations, User: ${globalMemory.user.name}, Location: ${globalMemory.user.location}`);
      return true;
    } else {
      console.log(`ℹ️ No memory file found - Creating new Titan memory at ${MEMORY_FILE}`);
      saveMemoryToFile(); // Create file
      return false;
    }
  } catch (err) {
    console.warn(`⚠️ Memory load failed: ${err.message} - Using default memory`);
    // Backup corrupt file
    try {
      if (fs.existsSync(MEMORY_FILE)) {
        const backupName = `corrupt-memory-${Date.now()}.json`;
        fs.copyFileSync(MEMORY_FILE, path.join(BACKUP_DIR, backupName));
        console.log(`📦 Corrupt memory backed up to: ${backupName}`);
      }
    } catch {}
    return false;
  }
}

// SAVE MEMORY TO FILE - PERSISTENT - 24/7
function saveMemoryToFile() {
  try {
    // Update last active
    globalMemory.stats.lastActive = new Date().toISOString();
    globalMemory.user.lastSeen = new Date().toISOString();
    
    const data = JSON.stringify(globalMemory, null, 2);
    fs.writeFileSync(MEMORY_FILE, data, 'utf8');
    
    // Auto backup every 100 chats
    if (globalMemory.conversations.length > 0 && globalMemory.conversations.length % 100 === 0) {
      const backupFile = path.join(BACKUP_DIR, `backup-${Date.now()}.json`);
      try {
        fs.writeFileSync(backupFile, data, 'utf8');
        console.log(`📦 Memory backup created: ${backupFile}`);
        
        // Clean old backups - keep last 10
        const backups = fs.readdirSync(BACKUP_DIR).sort().reverse();
        if (backups.length > 10) {
          backups.slice(10).forEach(f => {
            try { fs.unlinkSync(path.join(BACKUP_DIR, f)); } catch {}
          });
        }
      } catch (e) {
        console.warn(`Backup failed: ${e.message}`);
      }
    }
    
    return true;
  } catch (err) {
    console.warn(`⚠️ Memory save failed: ${err.message}`);
    return false;
  }
}

// Load on startup
loadMemoryFromFile();

// AUTO SAVE EVERY 30 SECONDS - TITAN 24/7
setInterval(() => {
  if (globalMemory.preferences.autoSave) {
    saveMemoryToFile();
  }
}, 30000);

// ═══════════════════════════════════════════════════
// EXPORTS - MORE POWERFUL THAN CHATGPT MEMORY API
// ═══════════════════════════════════════════════════

export function getMemory() {
  return globalMemory;
}

export function getUser() {
  return globalMemory.user;
}

export function getConversations(limit = 100) {
  return globalMemory.conversations.slice(-limit).reverse();
}

export function getStats() {
  return globalMemory.stats;
}

export function updateMemory(key, value) {
  try {
    if (key.includes('.')) {
      // Support nested keys like "user.name" or "preferences.model"
      const keys = key.split('.');
      let obj = globalMemory;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!obj[keys[i]]) obj[keys[i]] = {};
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
    } else {
      globalMemory[key] = value;
    }
    
    saveMemoryToFile();
    console.log(`[Memory] Updated ${key} =`, typeof value === 'object' ? JSON.stringify(value).slice(0,100) : value);
    return globalMemory;
  } catch (err) {
    console.error(`[Memory] Update failed for ${key}:`, err.message);
    return globalMemory;
  }
}

export function updateUser(updates) {
  try {
    globalMemory.user = { ...globalMemory.user, ...updates, lastSeen: new Date().toISOString() };
    saveMemoryToFile();
    console.log(`[Memory] User updated:`, updates);
    return globalMemory.user;
  } catch (err) {
    console.error(`[Memory] User update failed:`, err.message);
    return globalMemory.user;
  }
}

export function updatePreferences(prefs) {
  try {
    globalMemory.preferences = { ...globalMemory.preferences, ...prefs };
    saveMemoryToFile();
    console.log(`[Memory] Preferences updated:`, prefs);
    return globalMemory.preferences;
  } catch (err) {
    console.error(`[Memory] Preferences update failed:`, err.message);
    return globalMemory.preferences;
  }
}

export function addToMemory(conversation) {
  try {
    if (!conversation) {
      console.warn("[Memory] Empty conversation not added");
      return globalMemory;
    }

    const entry = {
      ...conversation,
      id: conversation.id || Date.now() + Math.random(),
      timestamp: conversation.timestamp || new Date().toISOString(),
      date: new Date().toISOString(),
      userAgent: "Xiong Ai Titan 710",
      location: globalMemory.user.location,
    };

    // Ensure required fields
    if (!entry.title) entry.title = (entry.user || entry.query || "Untitled Chat").slice(0, 80);
    if (!entry.user) entry.user = conversation.query || conversation.message || "User message";
    
    globalMemory.conversations.push(entry);

    // Update stats
    globalMemory.stats.totalChats++;
    globalMemory.stats.totalMessages += 2; // user + ai
    if (entry.model) globalMemory.stats.lastModel = entry.model;
    globalMemory.user.totalChats = globalMemory.conversations.length;

    // Keep only last 500 for file size - More than ChatGPT's 100
    if (globalMemory.conversations.length > 500) {
      const removed = globalMemory.conversations.length - 500;
      globalMemory.conversations = globalMemory.conversations.slice(-500);
      console.log(`[Memory] Trimmed ${removed} old conversations - Kept 500 latest - Titan 710`);
    }

    saveMemoryToFile();
    console.log(`[Memory] Added: "${entry.title}" | Total: ${globalMemory.conversations.length} | Model: ${entry.model || 'SMART'}`);
    return globalMemory;
  } catch (err) {
    console.error(`[Memory] Add failed:`, err.message);
    return globalMemory;
  }
}

export function searchMemory(query) {
  try {
    if (!query || typeof query !== 'string') {
      console.warn("[Memory] Search query empty");
      return [];
    }

    const q = query.toLowerCase().trim();
    if (q.length < 2) return globalMemory.conversations.slice(-20);

    const results = globalMemory.conversations.filter(c => {
      try {
        const searchable = JSON.stringify(c).toLowerCase();
        return searchable.includes(q);
      } catch {
        return false;
      }
    });

    console.log(`[Memory] Search "${query}" - Found ${results.length} results out of ${globalMemory.conversations.length}`);
    return results.slice(-50).reverse(); // Last 50 relevant
  } catch (err) {
    console.error(`[Memory] Search failed:`, err.message);
    return [];
  }
}

export function deleteConversation(id) {
  try {
    const before = globalMemory.conversations.length;
    globalMemory.conversations = globalMemory.conversations.filter(c => c.id !== id && c.timestamp !== id);
    const after = globalMemory.conversations.length;
    saveMemoryToFile();
    console.log(`[Memory] Deleted conversation ${id} - Before: ${before}, After: ${after}`);
    return { deleted: before !== after, count: after };
  } catch (err) {
    console.error(`[Memory] Delete failed:`, err.message);
    return { deleted: false, error: err.message };
  }
}

export function clearMemory() {
  try {
    const backupFile = path.join(BACKUP_DIR, `pre-clear-${Date.now()}.json`);
    try {
      fs.writeFileSync(backupFile, JSON.stringify(globalMemory, null, 2));
      console.log(`[Memory] Backup before clear: ${backupFile}`);
    } catch {}

    const count = globalMemory.conversations.length;
    globalMemory.conversations = [];
    globalMemory.stats.totalChats = 0;
    globalMemory.stats.totalMessages = 0;
    saveMemoryToFile();
    console.log(`[Memory] Cleared ${count} conversations - Titan reset`);
    return { cleared: true, count, backup: backupFile };
  } catch (err) {
    console.error(`[Memory] Clear failed:`, err.message);
    return { cleared: false, error: err.message };
  }
}

export function getMemoryStats() {
  return {
    totalConversations: globalMemory.conversations.length,
    user: globalMemory.user,
    stats: globalMemory.stats,
    preferences: globalMemory.preferences,
    system: globalMemory.system,
    memoryFile: MEMORY_FILE,
    memoryFileExists: fs.existsSync(MEMORY_FILE),
    backupCount: fs.existsSync(BACKUP_DIR) ? fs.readdirSync(BACKUP_DIR).length : 0,
    lastSave: globalMemory.stats.lastActive,
  };
}

// Export save function for manual save
export { saveMemoryToFile, loadMemoryFromFile };

console.log(`🧠 Xiong Ai Memory System - Titan 710 - Loaded - ${globalMemory.conversations.length} chats - User: ${globalMemory.user.name} - ${globalMemory.user.location}`);
