import { groq, MODELS, XIONG_SYSTEM_PROMPT } from "../config/groq.js";
import { getMemory, addToMemory } from "../config/memory.js";

export async function chatHandler(req, res){
  try{
    const { message, history = [], modelType = 'SMART', stream = true, files = [] } = req.body;
    
    if(!message) return res.status(400).json({error: "Message required"});

    const memory = getMemory();
    const model = MODELS[modelType] || MODELS.SMART;

    // Build messages with memory
    const messages = [
      { role: "system", content: XIONG_SYSTEM_PROMPT },
      { role: "system", content: `USER MEMORY: ${JSON.stringify(memory.user)}. Recent chats: ${memory.conversations.slice(-3).map(c=>c.title).join(', ')}` },
      ...history.slice(-20), // Keep last 20 messages for context (more than ChatGPT free)
      { role: "user", content: message + (files.length ? `\n\nAttached files context: ${files.join('\n')}` : '') }
    ];

    if(stream){
      // STREAMING LIKE CHATGPT - MORE POWERFUL
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const stream = await groq.chat.completions.create({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 8192, // More than ChatGPT
        top_p: 0.9,
        stream: true
      });

      let fullReply = '';
      for await (const chunk of stream){
        const content = chunk.choices[0]?.delta?.content || '';
        if(content){
          fullReply += content;
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }
      
      // Save to memory
      addToMemory({ title: message.slice(0,50), user: message, ai: fullReply, model });
      
      res.write(`data: ${JSON.stringify({ done: true, fullReply })}\n\n`);
      res.end();
    } else {
      // Non-streaming fallback
      const completion = await groq.chat.completions.create({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 8192
      });
      const reply = completion.choices[0].message.content;
      addToMemory({ title: message.slice(0,50), user: message, ai: reply, model });
      res.json({ reply, model, memory: memory.user });
    }

  }catch(err){
    console.error("Xiong Ai Chat Error:", err);
    res.status(500).json({ 
      error: "Xiong Ai brain overloaded, retry",
      details: err.message,
      reply: "⚠️ Xiong Ai: My Groq API key might be invalid or rate limited. Check .env and try again. If you are on free plan, wait 1 min."
    });
  }
}

export async function modelsHandler(req,res){
  res.json({
    models: MODELS,
    memory: getMemory(),
    status: "Xiong Ai 2.0 Online - More Powerful Than ChatGPT",
    features: ["streaming","memory","file-upload","vision","code-runner","projects","voice"]
  });
        }
