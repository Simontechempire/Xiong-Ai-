// XIONG AI 2.0 - CHAT ROUTE - TITAN 710 - VERY LONG - FIXED EMPTY BUBBLE + GROQ FALLBACK - IKARE TECH INC
import { groq, MODELS, XIONG_SYSTEM_PROMPT, getModelForType, MODEL_INFO } from "../config/groq.js";
import { getMemory, addToMemory } from "../config/memory.js";

export async function chatHandler(req, res) {
  const startTime = Date.now();
  try {
    const { message, history = [], modelType = 'SMART', stream = true, files = [] } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: "Message required - Empty message", reply: "Boss, type something first - Xiong Ai from Ikare is ready" });
    }

    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.includes('dummy')) {
      console.error("❌ GROQ_API_KEY missing in Render Environment");
      return res.status(500).json({
        error: "GROQ_API_KEY missing",
        reply: "⚠️ Xiong Ai Error: GROQ_API_KEY not set in Render Dashboard.\n\nFix:\n1. Go to https://dashboard.render.com\n2. Click xiong-ai service\n3. Environment -> Add Variable: GROQ_API_KEY = gsk_...\n4. Save -> Manual Deploy -> Clear cache & deploy\n\nGet free key: https://console.groq.com - 30 req/min free, no credit card, 10x faster than OpenAI"
      });
    }

    const memory = getMemory();
    let safeModelType = (modelType || 'SMART').toUpperCase();
    if (safeModelType === 'REASONING') safeModelType = 'SMART'; // FIX: R1 deprecated
    if (!MODELS[safeModelType]) safeModelType = 'SMART';
    const model = MODELS[safeModelType];

    console.log(`[Xiong Ai] 📩 New chat | Model: ${model} (${safeModelType}) | Msg: ${message.slice(0, 80)} | Files: ${files.length} | Time: ${new Date().toISOString()}`);

    let systemExtra = "";
    if (files && files.length > 0) {
      systemExtra = "\n\nUSER UPLOADED FILES:\n" + files.map(f => `File: ${f.name}\nContent:\n${(f.content || '').slice(0, 8000)}`).join("\n\n---\n\n");
    }

    const messages = [
      { role: "system", content: XIONG_SYSTEM_PROMPT },
      { role: "system", content: `MEMORY: User is Ikare Boss from Ikare, Ondo State, Nigeria. Projects: Xiong Ai Core, Crasher MD V2, Wolf XMD Clone. Past conversations: ${memory.conversations ? memory.conversations.length : 0} chats. Be helpful, remember context. Current model: ${model} - ${MODEL_INFO[safeModelType]?.desc || ''}` },
      ...(systemExtra ? [{ role: "system", content: systemExtra }] : []),
      ...history.slice(-12).map(h => ({
        role: h.role === 'user' ? 'user' : 'assistant',
        content: (h.content || '').slice(0, 4000)
      })),
      { role: "user", content: message }
    ];

    if (stream) {
      try {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders?.();

        const streamResp = await groq.chat.completions.create({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 3000,
          top_p: 0.9,
          stream: true,
          stop: null,
        });

        let fullReply = '';
        let chunkCount = 0;

        for await (const chunk of streamResp) {
          chunkCount++;
          const delta = chunk.choices[0]?.delta?.content || '';
          if (delta) {
            fullReply += delta;
            res.write(`data: ${JSON.stringify({ content: delta })}\n\n`);
          }
          if (chunk.choices[0]?.finish_reason) {
            break;
          }
        }

        if (!fullReply.trim()) {
          console.warn(`[Xiong Ai] ⚠️ Empty stream after ${chunkCount} chunks - Falling back to non-stream`);
          throw new Error("Empty stream response - Groq returned no content - Trying backup model");
        }

        const duration = Date.now() - startTime;
        console.log(`[Xiong Ai] ✅ Stream done | Chars: ${fullReply.length} | Chunks: ${chunkCount} | Time: ${duration}ms | Model: ${model}`);

        try { addToMemory({ title: message.slice(0, 70), user: message, ai: fullReply, model, modelType: safeModelType, timestamp: new Date().toISOString() }); } catch (e) { console.warn("Memory save failed:", e.message); }

        res.write(`data: ${JSON.stringify({ done: true, fullReply, model, modelType: safeModelType, duration })}\n\n`);
        return res.end();

      } catch (streamErr) {
        console.error(`[Xiong Ai] ❌ Streaming failed: ${streamErr.message} - Trying non-stream fallback`);
        if (!res.headersSent) {
          // Fall through to non-streaming
        } else {
          try {
            if (fullReply && fullReply.trim().length > 0) {
              res.write(`data: ${JSON.stringify({ done: true, fullReply })}\n\n`);
              return res.end();
            }
          } catch {}
          try {
            res.write(`data: ${JSON.stringify({ content: `\n\n⚠️ Streaming error, retrying... Error: ${streamErr.message}` })}\n\n`);
          } catch {}
          // Continue to attempt to end gracefully, but also try non-stream backup in same response
          try {
            const backupCompletion = await groq.chat.completions.create({
              model: MODELS.FAST,
              messages,
              temperature: 0.7,
              max_tokens: 2500,
            });
            const backupReply = backupCompletion.choices[0]?.message?.content || '';
            if (backupReply) {
              res.write(`data: ${JSON.stringify({ content: backupReply })}\n\n`);
              res.write(`data: ${JSON.stringify({ done: true, fullReply: backupReply })}\n\n`);
              try { addToMemory({ title: message.slice(0, 70), user: message, ai: backupReply, model: MODELS.FAST }); } catch {}
              return res.end();
            }
          } catch (backupErr) {
            console.error("Backup also failed:", backupErr.message);
          }
          try {
            res.write(`data: ${JSON.stringify({ done: true, fullReply: fullReply || `⚠️ Xiong Ai Error: ${streamErr.message}. Fix: Check GROQ_API_KEY in Render Environment Variables and use SMART model.` })}\n\n`);
            return res.end();
          } catch {
            return;
          }
        }
      }
    }

    // NON-STREAMING FALLBACK - 100% WORKS - USED IF STREAM FALSE OR STREAM FAILED BEFORE HEADERS
    try {
      const completion = await groq.chat.completions.create({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 3000,
        top_p: 0.9,
      });

      const reply = completion.choices[0]?.message?.content || completion.choices[0]?.message?.content === '' ? completion.choices[0].message.content : '';

      if (!reply || !reply.trim()) {
        throw new Error("Groq returned empty content - Model may be overloaded, try FAST model");
      }

      const duration = Date.now() - startTime;
      console.log(`[Xiong Ai] ✅ Non-stream done | Chars: ${reply.length} | Time: ${duration}ms | Model: ${model}`);

      try { addToMemory({ title: message.slice(0, 70), user: message, ai: reply, model, modelType: safeModelType, timestamp: new Date().toISOString() }); } catch {}

      if (req.body.stream) {
        if (!res.headersSent) {
          res.setHeader('Content-Type', 'text/event-stream');
          res.setHeader('Cache-Control', 'no-cache');
          res.write(`data: ${JSON.stringify({ content: reply })}\n\n`);
          res.write(`data: ${JSON.stringify({ done: true, fullReply: reply, model, duration })}\n\n`);
          return res.end();
        }
      }

      return res.json({ reply, model, modelType: safeModelType, duration, status: "Xiong Ai Titan 710 - Ikare Tech" });

    } catch (nonStreamErr) {
      console.error(`[Xiong Ai] ❌ Non-stream also failed: ${nonStreamErr.message}`);
      // Try backup model
      try {
        console.log(`[Xiong Ai] 🔄 Trying backup model: ${MODELS.BACKUP_FAST}`);
        const backupComp = await groq.chat.completions.create({
          model: MODELS.BACKUP_FAST,
          messages,
          temperature: 0.7,
          max_tokens: 2500,
        });
        const backupReply = backupComp.choices[0]?.message?.content;
        if (backupReply && backupReply.trim()) {
          try { addToMemory({ title: message.slice(0, 70), user: message, ai: backupReply, model: MODELS.BACKUP_FAST }); } catch {}
          if (req.body.stream && !res.headersSent) {
            res.setHeader('Content-Type', 'text/event-stream');
            res.write(`data: ${JSON.stringify({ content: backupReply })}\n\n`);
            res.write(`data: ${JSON.stringify({ done: true, fullReply: backupReply })}\n\n`);
            return res.end();
          }
          return res.json({ reply: backupReply, model: MODELS.BACKUP_FAST, backup: true });
        }
      } catch (backupErr) {
        console.error("Backup model also failed:", backupErr.message);
      }

      throw nonStreamErr;
    }

  } catch (err) {
    console.error("═══════════════════════════════════════════════");
    console.error("[Xiong Ai] FATAL CHAT ERROR:", err.message);
    console.error(err.stack);
    console.error("═══════════════════════════════════════════════");

    const isGroqKeyError = err.message.includes('GROQ_API_KEY') || err.message.includes('api_key') || err.status === 401;
    const isRateLimit = err.status === 429 || err.message.includes('429') || err.message.includes('rate');
    const isModelError = err.message.includes('model') || err.message.includes('deprecated') || err.status === 404;

    let userFriendlyReply = "";

    if (isGroqKeyError) {
      userFriendlyReply = `⚠️ **Xiong Ai: Groq API Key Invalid**\n\nYour GROQ_API_KEY in Render is missing or wrong.\n\n**Fix in 60 seconds:**\n1. Go to https://console.groq.com -> API Keys -> Create new key (starts with gsk_)\n2. Copy key\n3. Go to https://dashboard.render.com -> Click xiong-ai service\n4. Left menu -> Environment -> Add Variable\n5. Name: GROQ_API_KEY | Value: paste your gsk_ key\n6. Save Changes -> Manual Deploy -> Clear build cache & deploy\n7. Wait 2 mins -> Your Xiong Ai will reply\n\nError detail: ${err.message}`;
    } else if (isRateLimit) {
      userFriendlyReply = `⚠️ **Xiong Ai: Rate Limited (Free Tier)**\n\nGroq free tier = 30 requests/min. You hit limit.\n\n**Fix:**\n- Wait 60 seconds and retry\n- Or switch to FAST model (top pill) - uses less quota\n- Or upgrade Groq to paid $0/month pay-as-you-go - still cheap\n- Or add second Groq key rotation (advanced)\n\nError: ${err.message}\n\nXiong Ai from Ikare will be back in 60s.`;
    } else if (isModelError) {
      userFriendlyReply = `⚠️ **Xiong Ai: Model Deprecated**\n\nYou selected REASONING (R1) model which Groq removed in 2026.\n\n**Fix:**\n- Click top pill that says model name\n- Select **SMART • Llama 3.3 70B** (most powerful)\n- Or FAST • Llama 3.1 8B (fastest)\n- Try again - will work\n\nError: ${err.message}\n\nXiong Ai Titan 710 uses only active models: ${Object.values(MODELS).slice(0,4).join(', ')}`;
    } else {
      userFriendlyReply = `⚠️ **Xiong Ai Unexpected Error**\n\n${err.message}\n\n**Debug:**\n- Check Render Logs: dashboard.render.com -> xiong-ai -> Logs\n- Check /api/status: https://xiong-ai.onrender.com/api/status must show groq_key_set: true\n- Hard refresh: Ctrl+Shift+R\n- Try FAST model\n- If still fails, DM Ikare Boss\n\nStack: ${err.stack ? err.stack.slice(0,500) : 'no stack'}`;
    }

    if (res.headersSent) {
      try {
        res.write(`data: ${JSON.stringify({ content: userFriendlyReply })}\n\n`);
        res.write(`data: ${JSON.stringify({ done: true, fullReply: userFriendlyReply })}\n\n`);
        return res.end();
      } catch {}
    }

    return res.status(500).json({
      error: err.message,
      reply: userFriendlyReply,
      model: req.body?.modelType || 'SMART',
      hint: "Check Render Environment Variables for GROQ_API_KEY and use SMART model",
      status: "Xiong Ai Error - Ikare Tech Inc",
      timestamp: new Date().toISOString()
    });
  }
}

export async function modelsHandler(req, res) {
  try {
    const memory = getMemory();
    res.json({
      models: MODELS,
      modelInfo: MODEL_INFO,
      memory: {
        totalChats: memory.conversations ? memory.conversations.length : 0,
        lastChat: memory.conversations ? memory.conversations[0] : null,
      },
      status: "Xiong Ai 2.0 Titan 710 - More Powerful Than ChatGPT - ACTIVE 🟢",
      groq_key_set: !!process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes('dummy'),
      groq_key_preview: process.env.GROQ_API_KEY ? `${process.env.GROQ_API_KEY.slice(0,6)}...${process.env.GROQ_API_KEY.slice(-4)}` : "NOT SET",
      version: "2.0.0 Titan 710",
      location: "Ikare, Ondo State, Nigeria 🇳🇬",
      built_by: "Ikare Boss - Ikare Tech Inc",
      power: "∞ UNLIMITED",
      features: 710,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message, status: "Error getting status" });
  }
        }
