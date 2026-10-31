/* XIONG AI 2.0 - CHATGPT CLONE - VERY LONG - TITAN 710 - FIXED EMPTY BUBBLE - IKARE TECH INC */
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const sidebar = $('#sidebar');
const overlay = $('#overlay');
const menuBtn = $('#menuBtn');
const historyList = $('#historyList');
const chatArea = $('#chatArea');
const messagesEl = $('#messages');
const userInput = $('#userInput');
const sendBtn = $('#sendBtn');
const welcomeEl = $('#welcome');
const typingEl = $('#typing');
const fileInput = $('#fileInput');
const plusBtn = $('#plusBtn');
const micBtn = $('#micBtn');
const modelPill = $('#modelPill');
const modelDropdown = $('#modelDropdown');
const modelNameEl = $('#modelName');
const toastEl = $('#toast');
const sbSearchBox = $('#sbSearchBox');
const sbSearchInput = $('#sbSearchInput');

let currentModel = localStorage.getItem('xiong_model') || 'SMART';
let chatHistory = JSON.parse(localStorage.getItem('xiong_ai_v2_history') || '[]');
let currentChat = JSON.parse(localStorage.getItem('xiong_current') || '[]');
let isGenerating = false;
let recognition = null;
let attachedFiles = [];
let modelMap = {
  SMART: 'SMART • Llama 3.3 70B',
  FAST: 'FAST • Llama 3.1 8B',
  VISION: 'VISION • Llama 3.2 90B',
  REASONING: 'REASONING • Deep Think'
};

function initApp(){
  updateModelUI();
  renderHistory();
  setupAutoResize();
  setupVoice();
  if(currentChat.length){
    welcomeEl.style.display='none';
    currentChat.forEach(m=> renderMessage(m.role, m.content, false));
  }
  checkGroqStatus();
  console.log('%c⚡ Xiong Ai 2.0 Titan 710 - Ikare Tech Inc - More Powerful Than ChatGPT', 'color:#3b82f6;font-size:18px;font-weight:800');
}
initApp();

function updateModelUI(){
  modelNameEl.textContent = modelMap[currentModel] || modelMap.SMART;
  $$('.md-item').forEach(el=>{
    el.classList.toggle('active', el.dataset.model===currentModel);
  });
}

function toast(msg, ms=2500){
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  setTimeout(()=> toastEl.classList.remove('show'), ms);
}

async function checkGroqStatus(){
  try{
    const r = await fetch('/api/status');
    const d = await r.json();
    if(!d.groq_key_set){
      toast('⚠️ GROQ_API_KEY not set in Render Environment - Go to Render Dashboard -> Environment -> Add Key');
    }
  }catch{}
}

function setupAutoResize(){
  userInput.addEventListener('input', ()=>{
    userInput.style.height='auto';
    const h = Math.min(userInput.scrollHeight, 140);
    userInput.style.height = h+'px';
    sendBtn.disabled = !userInput.value.trim() && attachedFiles.length===0;
  });
}

function setupVoice(){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SR){ micBtn.style.opacity='0.3'; micBtn.title='Voice not supported'; return; }
  recognition = new SR();
  recognition.lang='en-US';
  recognition.interimResults=false;
  recognition.continuous=false;
  recognition.onstart=()=>{ micBtn.textContent='🔴'; toast('🎤 Listening... Speak English/Pidgin/Yoruba'); };
  recognition.onend=()=>{ micBtn.textContent='🎤'; };
  recognition.onerror=(e)=>{ micBtn.textContent='🎤'; toast('Voice error: '+e.error); };
  recognition.onresult=(e)=>{
    const transcript = e.results[0][0].transcript;
    userInput.value = transcript;
    userInput.dispatchEvent(new Event('input'));
    toast('Heard: '+transcript.slice(0,50));
  };
}

function renderHistory(){
  const query = (sbSearchInput.value||'').toLowerCase();
  let filtered = chatHistory;
  if(query) filtered = chatHistory.filter(h=> h.title.toLowerCase().includes(query) || (h.chat||[]).some(m=> m.content.toLowerCase().includes(query)));
  if(filtered.length===0){
    historyList.innerHTML = '<div class="h-item" style="opacity:.4">No chats found - Start new chat with Xiong Ai</div>';
    return;
  }
  historyList.innerHTML = filtered.slice(0,80).map((h,idx)=>{
    const realIdx = chatHistory.indexOf(h);
    return `<div class="h-item" data-idx="${realIdx}" title="${h.title}">${escapeHtml(h.title.slice(0,60))}</div>`;
  }).join('');
  historyList.querySelectorAll('.h-item').forEach(el=>{
    el.addEventListener('click', ()=>{
      const i = parseInt(el.dataset.idx);
      if(isNaN(i)) return;
      const item = chatHistory[i];
      if(!item) return;
      messagesEl.innerHTML='';
      welcomeEl.style.display='none';
      currentChat = item.chat || [];
      localStorage.setItem('xiong_current', JSON.stringify(currentChat));
      currentChat.forEach(m=> renderMessage(m.role, m.content, false));
      closeSidebar();
      toast('Loaded: '+item.title.slice(0,40));
    });
  });
}

function escapeHtml(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// SIDEBAR LOGIC
menuBtn.addEventListener('click', openSidebar);
overlay.addEventListener('click', closeSidebar);
function openSidebar(){ sidebar.classList.add('open'); overlay.classList.add('show'); document.body.style.overflow='hidden'; }
function closeSidebar(){ sidebar.classList.remove('open'); overlay.classList.remove('show'); document.body.style.overflow=''; modelDropdown.classList.add('hidden'); }
$('#btnNew').addEventListener('click', startNewChat);
$('#btnNewChatTop').addEventListener('click', startNewChat);
function startNewChat(){
  messagesEl.innerHTML='';
  currentChat=[];
  localStorage.removeItem('xiong_current');
  welcomeEl.style.display='flex';
  closeSidebar();
  toast('New chat started - Xiong Ai ready from Ikare');
  userInput.focus();
}
$('#btnSearch').addEventListener('click', ()=>{
  sbSearchBox.classList.toggle('hidden');
  if(!sbSearchBox.classList.contains('hidden')) sbSearchInput.focus();
});
sbSearchInput.addEventListener('input', renderHistory);
$('#btnShare').addEventListener('click', ()=>{
  const text = currentChat.map(m=> `${m.role}: ${m.content}`).join('\n\n');
  if(!text){ toast('No chat to share'); return; }
  navigator.clipboard.writeText(text).then(()=> toast('Chat copied to clipboard'));
});

// MODEL DROPDOWN
modelPill.addEventListener('click', (e)=>{
  e.stopPropagation();
  modelDropdown.classList.toggle('hidden');
});
document.addEventListener('click', ()=> modelDropdown.classList.add('hidden'));
$$('.md-item').forEach(el=>{
  el.addEventListener('click', ()=>{
    currentModel = el.dataset.model;
    localStorage.setItem('xiong_model', currentModel);
    updateModelUI();
    modelDropdown.classList.add('hidden');
    toast('Model: '+modelMap[currentModel]);
  });
});

// FILE UPLOAD
plusBtn.addEventListener('click', ()=> fileInput.click());
fileInput.addEventListener('change', async e=>{
  const file = e.target.files[0];
  if(!file) return;
  if(file.size > 10*1024*1024){ toast('File too big >10MB'); return; }
  toast('📁 Reading file: '+file.name);
  try{
    const form = new FormData();
    form.append('file', file);
    const res = await fetch('/upload', { method:'POST', body: form });
    const data = await res.json();
    if(data.error) throw new Error(data.error);
    attachedFiles = [{ name: file.name, content: data.content || data.text || 'File uploaded' }];
    userInput.value = `[File: ${file.name}]\n${data.content ? data.content.slice(0,2000) : ''}\n\nQuestion about this file: `;
    userInput.dispatchEvent(new Event('input'));
    toast('✅ File analyzed: '+file.name);
  }catch(err){
    toast('Upload failed: '+err.message);
    userInput.value = `[File: ${file.name}] - Ask about this file`;
    userInput.dispatchEvent(new Event('input'));
  }
});

// VOICE BUTTON
micBtn.addEventListener('click', ()=>{
  if(!recognition){ toast('Voice not supported on this browser - Use Chrome'); return; }
  try{ recognition.start(); }catch(err){ toast('Voice already listening'); }
});

// WELCOME BUTTONS
$$('.wa-btn, .wc').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const prompt = btn.dataset.prompt;
    if(prompt) sendMessage(prompt);
  });
});

// CORE SEND - FIXED EMPTY BUBBLE - NEVER RETURNS EMPTY
async function sendMessage(overrideText){
  const text = (overrideText || userInput.value.trim());
  if(!text || isGenerating) return;

  welcomeEl.style.display='none';
  renderMessage('user', text, true);
  currentChat.push({ role:'user', content: text });
  localStorage.setItem('xiong_current', JSON.stringify(currentChat));
  userInput.value='';
  userInput.style.height='auto';
  sendBtn.disabled=true;
  isGenerating=true;
  typingEl.classList.add('show');
  chatArea.scrollTop = chatArea.scrollHeight;

  const aiWrapper = document.createElement('div');
  aiWrapper.className='msg ai';
  aiWrapper.innerHTML=`<div class="avatar">X</div><div class="bubble" id="liveBubble"><span class="stream-cursor">▌</span> Xiong Ai thinking from Ikare...</div>`;
  messagesEl.appendChild(aiWrapper);
  const bubble = aiWrapper.querySelector('#liveBubble');
  let fullReply='';

  try{
    const payload = {
      message: text,
      history: currentChat.slice(0,-1),
      modelType: currentModel,
      stream: true,
      files: attachedFiles
    };

    const res = await fetch('/chat', {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify(payload)
    });

    if(!res.ok){
      let errJson = {};
      try{ errJson = await res.json(); }catch{}
      throw new Error(errJson.reply || errJson.error || `Server error ${res.status} - Check Render logs`);
    }

    const contentType = res.headers.get('content-type') || '';
    if(contentType.includes('application/json')){
      const data = await res.json();
      fullReply = data.reply || data.fullReply || '';
      if(!fullReply) throw new Error('Empty JSON reply - Check GROQ_API_KEY');
      bubble.innerHTML = marked.parse(fullReply);
    } else {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer='';
      while(true){
        const {done, value} = await reader.read();
        if(done) break;
        buffer += decoder.decode(value, {stream:true});
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';
        for(const part of parts){
          if(!part.startsWith('data:')) continue;
          const jsonStr = part.slice(5).trim();
          if(!jsonStr) continue;
          try{
            const data = JSON.parse(jsonStr);
            if(data.content){
              fullReply += data.content;
              bubble.innerHTML = marked.parse(fullReply) + '<span class="stream-cursor">▌</span>';
              chatArea.scrollTop = chatArea.scrollHeight;
            }
            if(data.done && data.fullReply){
              fullReply = data.fullReply;
            }
            if(data.error){
              throw new Error(data.error);
            }
          }catch(e){
            if(e.message && e.message.includes('Server error')) throw e;
          }
        }
      }
    }

    if(!fullReply.trim()){
      throw new Error('Empty response - Groq API key invalid or model deprecated. Go to Render -> Environment -> Add GROQ_API_KEY = gsk_... and use SMART model');
    }

    typingEl.classList.remove('show');
    bubble.innerHTML = marked.parse(fullReply) + `
      <div class="msg-actions">
        <button data-act="copy">📋 Copy</button>
        <button data-act="speak">🔊 Speak</button>
        <button data-act="regen">🔄 Regenerate</button>
        <button data-act="share">↗️ Share</button>
      </div>
    `;
    bubble.querySelectorAll('pre code').forEach(block=>{ try{ hljs.highlightElement(block); }catch{} });
    bubble.querySelectorAll('[data-act]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const act = btn.dataset.act;
        if(act==='copy'){ navigator.clipboard.writeText(fullReply).then(()=> toast('Copied')); }
        if(act==='speak'){ const u = new SpeechSynthesisUtterance(fullReply.slice(0,300)); u.lang='en-US'; speechSynthesis.speak(u); toast('🔊 Speaking...'); }
        if(act==='regen'){ messagesEl.removeChild(aiWrapper); currentChat.pop(); sendMessage(text); }
        if(act==='share'){ navigator.clipboard.writeText(fullReply).then(()=> toast('Shared - Copied')); }
      });
    });

    currentChat.push({ role:'assistant', content: fullReply });
    localStorage.setItem('xiong_current', JSON.stringify(currentChat));
    chatHistory.unshift({ title: text.slice(0,70), date: new Date().toISOString(), chat: [...currentChat], model: currentModel });
    if(chatHistory.length>100) chatHistory.pop();
    localStorage.setItem('xiong_ai_v2_history', JSON.stringify(chatHistory));
    renderHistory();
    attachedFiles=[];

  }catch(err){
    typingEl.classList.remove('show');
    console.error('Xiong Ai Error:', err);
    bubble.innerHTML = `
      <div style="color:#f87171;border:1px solid #7f1d1d;background:#1a0f0f;padding:14px;border-radius:12px">
        <b>⚠️ Xiong Ai Error - Not Replying Fix:</b><br><br>
        <code style="font-size:12px;white-space:pre-wrap">${escapeHtml(err.message)}</code><br><br>
        <b>✅ Fix Steps - Ikare Tech:</b><br>
        1. Go to <b>Render Dashboard -> xiong-ai -> Environment</b><br>
        2. Add Variable: <code>GROQ_API_KEY = gsk_your_real_key</code> (starts with gsk_)<br>
        3. Save -> <b>Manual Deploy -> Clear build cache & deploy</b><br>
        4. Wait 2 mins -> Open <code>/api/status</code> - must show groq_key_set: true<br>
        5. On site, select <b>SMART model</b> not REASONING (R1 deprecated)<br>
        6. Hard refresh: Ctrl+Shift+R<br><br>
        <small>If still fails, check Render Logs for error. Your Groq free quota may be 429 rate limited - wait 60s.</small>
      </div>
    `;
    toast('Error: '+err.message.slice(0,80));
  }

  isGenerating=false;
  sendBtn.disabled=false;
  chatArea.scrollTop = chatArea.scrollHeight;
  userInput.focus();
}

function renderMessage(role, content, isNew=true){
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  if(role==='user'){
    div.innerHTML = `<div class="bubble">${escapeHtml(content)}</div>`;
  } else {
    div.innerHTML = `<div class="avatar">X</div><div class="bubble">${marked.parse(content)}</div>`;
    setTimeout(()=>{ div.querySelectorAll('pre code').forEach(b=>{ try{ hljs.highlightElement(b);}catch{} }); }, 50);
  }
  messagesEl.appendChild(div);
  if(isNew) chatArea.scrollTop = chatArea.scrollHeight;
}

sendBtn.addEventListener('click', ()=> sendMessage());
userInput.addEventListener('keydown', e=>{
  if(e.key==='Enter' && !e.shiftKey){
    e.preventDefault();
    sendMessage();
  }
});

document.addEventListener('visibilitychange', ()=>{
  if(document.visibilityState==='visible'){
    renderHistory();
  }
});
