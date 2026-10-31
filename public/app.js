/* XIONG AI 2.0 - MORE POWERFUL THAN CHATGPT - FULL LOGIC */
const $ = s=>document.querySelector(s);
const chatArea = $('#chatArea');
const messagesEl = $('#messages');
const userInput = $('#userInput');
const sendBtn = $('#sendBtn');
const welcome = $('#welcome');
const typing = $('#typing');
const historyList = $('#chatHistoryList');
const modelSwitch = $('#modelSwitch');
const modelDropdown = $('#modelDropdown');
const openSb = $('#openSb');
const closeSb = $('#closeSb');
const sidebar = $('#sidebar');
const fileInput = $('#fileInput');
const btnAttach = $('#btnAttach');
const btnVoice = $('#btnVoice');
const btnImage = $('#btnImage');
const topUpload = $('#topUpload');
const filePreview = $('#filePreview');
const searchChats = $('#searchChats');

let currentModel = localStorage.getItem('xiong_model') || 'SMART';
let chatHistory = JSON.parse(localStorage.getItem('xiong_ai_v2_history')||'[]');
let currentChat = JSON.parse(localStorage.getItem('xiong_current')||'[]');
let attachedFiles = [];
let isGenerating = false;
let recognition = null;

// INIT
function init(){
  renderHistory();
  if(currentChat.length){ welcome.style.display='none'; currentChat.forEach(m=> addMsg(m.role,m.content,false)); }
  updateModelUI();
  autoResize();
  initVoice();
  console.log('%c XIONG AI 2.0 - More Powerful Than ChatGPT - Ikare ','background:black;color:#3b82f6;padding:10px;font-weight:900');
}
init();

function updateModelUI(){
  const map={SMART:'🧠 Smart • Llama 3.3 70B',FAST:'⚡ Fast • Llama 3.1 8B',VISION:'👁️ Vision • 90B',REASONING:'🔬 Reasoning • R1'};
  $('.model-name').textContent = map[currentModel]||map.SMART;
  document.querySelectorAll('.model-opt').forEach(o=> o.classList.toggle('active', o.dataset.model===currentModel));
}

function autoResize(){
  userInput.addEventListener('input',()=>{
    userInput.style.height='auto';
    userInput.style.height = Math.min(userInput.scrollHeight,160)+'px';
    sendBtn.disabled = !userInput.value.trim() && attachedFiles.length===0;
  });
}

function renderHistory(){
  const q = (searchChats.value||'').toLowerCase();
  const filtered = chatHistory.filter(h=> h.title.toLowerCase().includes(q));
  historyList.innerHTML = filtered.slice(0,20).map((h,i)=> `
    <div class="nav-item small" data-idx="${i}" title="${h.title}">
      <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1">${h.title}</span>
      <span style="font-size:10px;color:var(--muted2)">${new Date(h.date).toLocaleDateString()}</span>
    </div>
  `).join('') || '<div class="nav-item small" style="opacity:.5">No chats yet</div>';
  historyList.querySelectorAll('.nav-item').forEach(el=>{
    el.addEventListener('click',()=>{
      const idx = el.dataset.idx; if(idx===undefined) return;
      const item = chatHistory[idx];
      messagesEl.innerHTML=''; welcome.style.display='none';
      currentChat = item.chat || []; localStorage.setItem('xiong_current', JSON.stringify(currentChat));
      currentChat.forEach(m=> addMsg(m.role,m.content,false));
    });
  });
}
searchChats.addEventListener('input', renderHistory);

// MODEL SWITCH
modelSwitch.addEventListener('click',()=> modelDropdown.classList.toggle('open'));
document.addEventListener('click',e=>{ if(!modelSwitch.contains(e.target)) modelDropdown.classList.remove('open'); });
modelDropdown.querySelectorAll('.model-opt').forEach(opt=>{
  opt.addEventListener('click',()=>{
    currentModel = opt.dataset.model; localStorage.setItem('xiong_model', currentModel);
    updateModelUI(); modelDropdown.classList.remove('open');
  });
});

// SIDEBAR
openSb.addEventListener('click',()=> sidebar.classList.add('open'));
closeSb.addEventListener('click',()=> sidebar.classList.remove('open'));

// NEW CHAT
$('#btnNewChat').addEventListener('click',()=>{
  messagesEl.innerHTML=''; currentChat=[]; localStorage.removeItem('xiong_current');
  welcome.style.display='flex'; sidebar.classList.remove('open');
});

// FILE UPLOAD
btnAttach.addEventListener('click',()=> fileInput.click());
topUpload.addEventListener('click',()=> fileInput.click());
fileInput.addEventListener('change', async e=>{
  const file = e.target.files[0]; if(!file) return;
  const chip = document.createElement('div'); chip.className='file-chip';
  chip.innerHTML=`📄 ${file.name} (${(file.size/1024).toFixed(1)}KB) <span style="cursor:pointer">✕</span>`;
  filePreview.classList.add('show'); filePreview.appendChild(chip);
  attachedFiles.push(file.name);

  // Upload to server
  const fd = new FormData(); fd.append('file', file);
  try{
    const res = await fetch('/upload',{method:'POST',body:fd});
    const data = await res.json();
    attachedFiles[attachedFiles.length-1] = `${file.name}: ${data.text.slice(0,500)}`;
    chip.innerHTML+=`<span style="color:#10b981"> ✓ Analyzed</span>`;
  }catch{ chip.innerHTML+=`<span style="color:#ef4444"> failed</span>`; }
  chip.querySelector('span').onclick=()=>{ chip.remove(); attachedFiles=[]; if(!filePreview.children.length) filePreview.classList.remove('show'); };
  sendBtn.disabled=false;
});

// VOICE
function initVoice(){
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SpeechRecognition){ btnVoice.style.display='none'; return; }
  recognition = new SpeechRecognition(); recognition.continuous=false; recognition.lang='en-US';
  recognition.onstart=()=>{ btnVoice.classList.add('recording'); btnVoice.textContent='🔴 Listening...'; };
  recognition.onend=()=>{ btnVoice.classList.remove('recording'); btnVoice.innerHTML='🎤'; };
  recognition.onresult=(e)=>{ userInput.value = e.results[0][0].transcript; userInput.dispatchEvent(new Event('input')); sendMessage(); };
}
btnVoice.addEventListener('click',()=>{ if(!recognition) return; try{ recognition.start(); }catch{} });

// IMAGE GEN
btnImage.addEventListener('click',()=>{
  const prompt = prompt('🖼️ Xiong Ai Image Gen - Enter prompt:','Ultra realistic portrait of Xiong Ai robot, Ikare, Nigeria, cinematic 8k');
  if(!prompt) return;
  sendMessage(`Generate image: ${prompt}. Give me enhanced prompt and direct link using pollinations.ai`);
});

// CORE SEND WITH STREAMING - MORE POWERFUL THAN CHATGPT
async function sendMessage(overrideText){
  const text = overrideText || userInput.value.trim();
  if(!text || isGenerating) return;

  welcome.style.display='none';
  addMsg('user', text);
  currentChat.push({role:'user', content:text});
  localStorage.setItem('xiong_current', JSON.stringify(currentChat));
  userInput.value=''; userInput.style.height='auto'; sendBtn.disabled=true;
  filePreview.innerHTML=''; filePreview.classList.remove('show');

  isGenerating=true; typing.classList.add('show'); chatArea.scrollTop = chatArea.scrollHeight;

  // Create AI message placeholder for streaming
  const aiDiv = document.createElement('div'); aiDiv.className='msg ai';
  aiDiv.innerHTML=`<div class="msg-avatar">X</div><div class="msg-bubble" id="streamingBubble"><span class="cursor">▌</span></div>`;
  messagesEl.appendChild(aiDiv);
  const bubble = aiDiv.querySelector('#streamingBubble');
  let fullText='';

  try{
    const res = await fetch('/chat',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ message: text, history: currentChat.slice(0,-1), modelType: currentModel, stream: true, files: attachedFiles })
    });

    if(!res.body){ throw new Error('No stream'); }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer='';

    while(true){
      const {done,value} = await reader.read(); if(done) break;
      buffer+=decoder.decode(value,{stream:true});
      const lines = buffer.split('\n\n'); buffer = lines.pop()||'';
      for(const line of lines){
        if(!line.startsWith('data:')) continue;
        try{
          const data = JSON.parse(line.slice(5).trim());
          if(data.content){ fullText+=data.content; bubble.innerHTML = marked.parse(fullText) + '<span class="cursor">▌</span>'; chatArea.scrollTop=chatArea.scrollHeight; }
          if(data.done){ fullText = data.fullReply||fullText; }
        }catch{}
      }
    }

    typing.classList.remove('show');
    bubble.innerHTML = marked.parse(fullText) + `<div class="msg-actions"><button onclick="copyMsg(this)">📋 Copy</button><button onclick="speakMsg(this)">🔊 Speak</button><button onclick="regenerate()">🔄 Regenerate</button><button onclick="shareMsg(this)">↗️ Share</button></div>`;
    bubble.querySelectorAll('pre code').forEach(b=> hljs.highlightElement(b));
    currentChat.push({role:'assistant', content:fullText});
    localStorage.setItem('xiong_current', JSON.stringify(currentChat));

    // Save to history
    chatHistory.unshift({ title: text.slice(0,60), date: new Date().toISOString(), chat: [...currentChat], model: currentModel });
    if(chatHistory.length>50) chatHistory.pop();
    localStorage.setItem('xiong_ai_v2_history', JSON.stringify(chatHistory));
    renderHistory();
    attachedFiles=[];

  }catch(err){
    typing.classList.remove('show');
    bubble.innerHTML=`⚠️ Xiong Ai Error: ${err.message}<br><br>Check your GROQ_API_KEY in .env or Render env. Free plan rate limit = wait 30s.<br><button onclick="location.reload()">Retry</button>`;
    console.error(err);
  }
  isGenerating=false;
}

function addMsg(role, content, save=true){
  const div = document.createElement('div'); div.className=`msg ${role==='user'?'user':'ai'}`;
  const avatar = role==='user'?'O':'X';
  let html = role==='user' ? content.replace(/\n/g,'<br>') : marked.parse(content);
  div.innerHTML=`<div class="msg-avatar">${avatar}</div><div class="msg-bubble">${html}${role==='ai'?`<div class="msg-actions"><button onclick="copyMsg(this)">📋 Copy</button><button onclick="speakMsg(this)">🔊 Speak</button></div>`:''}</div>`;
  messagesEl.appendChild(div);
  setTimeout(()=>{ div.querySelectorAll('pre code').forEach(b=> hljs.highlightElement(b)); chatArea.scrollTop=chatArea.scrollHeight; },50);
}

// HELPERS
window.copyMsg = (btn)=>{
  const txt = btn.closest('.msg-bubble').innerText; navigator.clipboard.writeText(txt);
  btn.textContent='✅ Copied'; setTimeout(()=>btn.textContent='📋 Copy',2000);
};
window.speakMsg = (btn)=>{
  const txt = btn.closest('.msg-bubble').innerText.slice(0,500);
  const utter = new SpeechSynthesisUtterance(txt); utter.rate=1; speechSynthesis.speak(utter);
};
window.shareMsg = (btn)=>{ const txt=btn.closest('.msg-bubble').innerText; if(navigator.share) navigator.share({title:'Xiong Ai',text:txt}); else copyMsg(btn); };
window.regenerate = ()=>{ if(currentChat.length<2) return; const lastUser = [...currentChat].reverse().find(m=>m.role==='user'); if(lastUser) sendMessage(lastUser.content); };

// EVENTS
sendBtn.addEventListener('click',()=> sendMessage());
userInput.addEventListener('keydown',e=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); sendMessage(); } });
document.querySelectorAll('.quick-card').forEach(c=> c.addEventListener('click',()=> sendMessage(c.dataset.prompt)));
document.addEventListener('keydown',e=>{ if(e.key==='/' && document.activeElement!==userInput){ e.preventDefault(); userInput.focus(); } });

// PWA install prompt
let deferredPrompt; window.addEventListener('beforeinstallprompt',e=>{ e.preventDefault(); deferredPrompt=e; });
