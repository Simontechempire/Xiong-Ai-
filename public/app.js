// TITAN 742 - ONLY TAKES NOTE UPGRADE - ALL CHATGPT = XIONG AI - FIX SEND + VOICE + FILE + GET PLUS + MEMORY NOTE 100YRS
console.log('⚡ Xiong Ai 742 - Memory Note 100 Years Added - Titan from Ikare');
const $=s=>document.querySelector(s);
const overlay=$('#overlay'),sidebar=$('#sidebar'),menuBtn=$('#menuBtn'),historyList=$('#historyList'),messagesEl=$('#messages'),userInput=$('#userInput'),sendBtn=$('#sendBtn'),welcomeEl=$('#welcome'),typingEl=$('#typing'),fileInput=$('#fileInput'),plusBtn=$('#plusBtn'),micBtn=$('#micBtn'),toastEl=$('#toast'),plusModal=$('#plusModal');
let currentModel=localStorage.getItem('xiong_model')||'SMART'; if(currentModel==='REASONING') currentModel='SMART';
let chatHistory=JSON.parse(localStorage.getItem('xiong_ai_v2_history')||'[]');
let currentChat=JSON.parse(localStorage.getItem('xiong_current')||'[]');
let isGenerating=false; let recognition=null; let attachedFiles=[];

// ========== NEW: MEMORY NOTE 100 YEARS - ONLY TAKES NOTE ==========
let memoryNotes = JSON.parse(localStorage.getItem('xiong_memory_notes_100yrs') || '{}');
const memoryModal = $('#memoryModal'), memoryListEl = $('#memoryList'), memoryPreviewEl = $('#memoryNotePreview'), memoryIndicator = $('#memoryIndicator');

function saveMemoryNote(key, value) {
  memoryNotes[key] = { value, savedAt: new Date().toISOString(), until: "31 Oct 2126", expiry: "100 Years - Never expire" };
  localStorage.setItem('xiong_memory_notes_100yrs', JSON.stringify(memoryNotes));
  // Show memory noted
  toast(`✅ Memory Noted: ${key} = ${value}. I will remember even in 100 years!`);
  if (memoryIndicator) { memoryIndicator.style.display = 'inline'; memoryIndicator.textContent = `🧠 Memory Noted: ${key}`; setTimeout(()=>memoryIndicator.style.display='none', 4000); }
  if (memoryPreviewEl) { memoryPreviewEl.style.display='block'; memoryPreviewEl.innerHTML = `🧠 <b>${key}:</b> ${value} (till 2126)`; }
  renderMemoryList();
  // Also send to server
  fetch('/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ message: `My name is ${value}`, userId: localStorage.getItem('xiong_user_id')||'default', history: [], modelType: 'SMART', stream: false }) }).catch(()=>{});
  return true;
}

function renderMemoryList() {
  if (!memoryListEl) return;
  const keys = Object.keys(memoryNotes);
  if (keys.length===0) { memoryListEl.innerHTML = '<div style="opacity:.6">No memories yet. Say "My name is Simon"</div>'; return; }
  memoryListEl.innerHTML = keys.map(k => `<div style="background:#111; padding:8px; margin:6px 0; border-radius:8px; border-left:3px solid lime;"><b>${k}:</b> ${memoryNotes[k].value}<br><small style="opacity:.5">${new Date(memoryNotes[k].savedAt).toLocaleString()} - Until 2126</small></div>`).join('');
  if (memoryPreviewEl && keys.length) { const last = keys[keys.length-1]; memoryPreviewEl.innerHTML = `🧠 <b>${last}:</b> ${memoryNotes[last].value} (till 2126)`; memoryPreviewEl.style.display='block'; }
}

function checkMemoryNote(text) {
  const lower = text.toLowerCase();
  if (lower.includes('my name is')) {
    const name = text.split(/my name is/i)[1].trim().split(' ').slice(0,3).join(' ').replace(/[^\w\s]/g,'').trim();
    if (name.length>1) { saveMemoryNote('name', name); return true; }
  }
  if (lower.includes('remember that my')) {
    // Eg: remember that my favorite color is blue
    const parts = text.split(/my/i)[1]?.split('is');
    if (parts && parts.length>=2) { const key=parts[0].trim().slice(0,20); const val=parts[1].trim().slice(0,50); if(key&&val) saveMemoryNote(key, val); }
  }
  return false;
}

function toast(m,ms=3500){toastEl.textContent=m;toastEl.classList.add('show');setTimeout(()=>toastEl.classList.remove('show'),ms);}
function escapeHtml(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function openSidebar(){sidebar.classList.add('open');overlay.classList.add('show');}
function closeSidebar(){sidebar.classList.remove('open');overlay.classList.remove('show');}
function scrollBottom(){const area=$('#chatArea'); if(area) area.scrollTop=area.scrollHeight+500;}
function updateSendState(){const hasText=userInput.value.trim().length>0;sendBtn.disabled=!hasText&&!isGenerating;sendBtn.style.opacity=hasText?'1':'.45';sendBtn.style.background=hasText?'white':'#3b82f6';}

function init(){
  if(currentChat.length){welcomeEl.style.display='none';currentChat.forEach(m=>renderMsg(m.role,m.content,false));}
  renderHistory(); renderMemoryList(); setupVoice(); setupEvents(); updateSendState();
  // Show saved name if exists
  if (memoryNotes.name) toast(`Welcome back Boss ${memoryNotes.name.value}! I remembered you for 100 years 🧠`);
  else toast('Xiong Ai 742 ready - Memory Note 100 Years - Titan from Ikare');
}
function setupEvents(){
  menuBtn?.addEventListener('click',e=>{e.stopPropagation();openSidebar();});
  overlay?.addEventListener('click',closeSidebar);
  $('#btnRefresh')?.addEventListener('click',()=>location.reload());
  $('#btnSearchTop')?.addEventListener('click',()=>{$('#sbSearch').classList.toggle('hidden');$('#sbSearchInput')?.focus();});
  $('#sbSearchInput')?.addEventListener('input',renderHistory);
  $('#btnNewTop')?.addEventListener('click',()=>doNewChat());
  $('#fabNewChat')?.addEventListener('click',()=>doNewChat());
  // Get Plus - XIONG AI FREE
  $('#getPlusBtn')?.addEventListener('click',e=>{e.stopPropagation();plusModal.classList.remove('hidden'); toast('Xiong Ai Plus FREE - Titan 742 - Memory 100yrs');});
  $('#closePlus')?.addEventListener('click',()=>plusModal.classList.add('hidden'));
  plusModal?.addEventListener('click',e=>{if(e.target===plusModal)plusModal.classList.add('hidden');});
  $('#btnUpgradeFree')?.addEventListener('click',()=>{plusModal.classList.add('hidden'); toast('🎉 Xiong Ai Plus FREE Activated - Enjoy 100 years memory!');});
  // NEW: Memory Modal Events - ONLY TAKES NOTE
  $('#sbMemoryNotes')?.addEventListener('click',()=>{renderMemoryList(); memoryModal?.classList.remove('hidden'); closeSidebar();});
  $('#btnMemory')?.addEventListener('click',()=>{renderMemoryList(); memoryModal?.classList.remove('hidden');});
  $('#closeMemory')?.addEventListener('click',()=>memoryModal.classList.add('hidden'));
  memoryModal?.addEventListener('click',e=>{if(e.target===memoryModal)memoryModal.classList.add('hidden');});
  $('#actMemory')?.addEventListener('click',()=>{userInput.value='My name is '; userInput.focus(); toast('Type your name after "My name is " - I will remember for 100 years 🧠');});
  // Sidebar
  $('#sbImages')?.addEventListener('click',()=>{toast('Xiong Ai Images');closeSidebar();send('Create an image of Xiong Ai Titan robot in Ikare, Ondo State');});
  $('#sbLibrary')?.addEventListener('click',()=>{toast('Xiong Ai Library');closeSidebar();});
  $('#sbProjects')?.addEventListener('click',()=>{toast('Xiong Ai Projects');closeSidebar();});
  $('#sbRemote')?.addEventListener('click',()=>{toast('Xiong Ai Remote');closeSidebar();});
  $('#sbScheduled')?.addEventListener('click',()=>{toast('Xiong Ai Scheduled');closeSidebar();});
  $('#sbPlugins')?.addEventListener('click',()=>{toast('Xiong Ai Plugins - 710 features');closeSidebar();});
  $('#btnSettings')?.addEventListener('click',()=>toast('Xiong Ai Settings - Bottom Bar - Ikare Boss - Memory: '+Object.keys(memoryNotes).length+' notes'));
  $('#btnVoiceFab')?.addEventListener('click',()=>{closeSidebar();toggleVoice();});
  // Main actions
  $('#actImage')?.addEventListener('click',()=>send('Create an image of Xiong Ai Titan robot - More powerful than ChatGPT'));
  $('#actWrite')?.addEventListener('click',()=>send('Write a professional WhatsApp bot menu with 200 commands like Wolf XMD for Xiong Ai'));
  $('#actSearch')?.addEventListener('click',()=>send('Search the web for latest Groq AI models 2026 - Explain like Xiong Ai'));
  // File + Voice + Send
  plusBtn?.addEventListener('click',e=>{e.stopPropagation();fileInput.click();});
  fileInput?.addEventListener('change',handleFile);
  micBtn?.addEventListener('click',e=>{e.stopPropagation();toggleVoice();});
  userInput?.addEventListener('input',()=>{userInput.style.height='auto';userInput.style.height=Math.min(userInput.scrollHeight,120)+'px';updateSendState();});
  userInput?.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}});
  sendBtn?.addEventListener('click',e=>{e.stopPropagation();send();});
}
function doNewChat(){messagesEl.innerHTML='';currentChat=[];localStorage.removeItem('xiong_current');welcomeEl.style.display='flex';closeSidebar();toast('New Xiong Ai chat - Memory Notes still saved for 100 years 🧠');}
function renderHistory(){
  const q=($('#sbSearchInput')?.value||'').toLowerCase();
  let f=chatHistory; if(q) f=f.filter(h=>h.title.toLowerCase().includes(q));
  if(f.length===0){historyList.innerHTML='<div class="h-row" style="opacity:.4">No Xiong Ai chats yet</div>';return;}
  historyList.innerHTML=f.slice(0,60).map((h,i)=>`<div class="h-row" data-idx="${chatHistory.indexOf(h)}">${escapeHtml(h.title.slice(0,55))}</div>`).join('');
  historyList.querySelectorAll('.h-row').forEach(el=>el.addEventListener('click',()=>{const item=chatHistory[parseInt(el.dataset.idx)];if(!item)return;messagesEl.innerHTML='';welcomeEl.style.display='none';currentChat=item.chat||[];localStorage.setItem('xiong_current',JSON.stringify(currentChat));currentChat.forEach(m=>renderMsg(m.role,m.content,false));closeSidebar();scrollBottom();}));
}
function setupVoice(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){micBtn.style.opacity='.5';return;}
  recognition=new SR();recognition.lang='en-US';recognition.continuous=false;
  recognition.onstart=()=>{micBtn.textContent='🔴';micBtn.style.background='#ef4444';toast('🎤 Xiong Ai Listening...');};
  recognition.onend=()=>{micBtn.textContent='🎤';micBtn.style.background='transparent';updateSendState();};
  recognition.onerror=e=>{toast('Xiong Ai Voice error: '+e.error);micBtn.textContent='🎤';micBtn.style.background='transparent';};
  recognition.onresult=e=>{const t=e.results[0][0].transcript;userInput.value=t;updateSendState();toast('Xiong Ai heard: '+t.slice(0,50));userInput.focus();};
}
function toggleVoice(){if(!recognition){toast('Xiong Ai Voice not supported - use Chrome');return;}try{if(micBtn.textContent==='🔴')recognition.stop();else recognition.start();}catch{toast('Xiong Ai Mic busy');}}
async function handleFile(e){
  const file=e.target.files[0];if(!file)return;if(file.size>10*1024*1024)return toast('Xiong Ai - File too big >10MB');
  toast('📁 Xiong Ai uploading: '+file.name);
  try{const fd=new FormData();fd.append('file',file);const res=await fetch('/upload',{method:'POST',body:fd});const data=await res.json();if(data.error)throw new Error(data.error);attachedFiles=[{name:file.name,content:data.content||data.text||''}];userInput.value=`[File: ${file.name}]\n${(data.content||'').slice(0,2000)}\n\nQuestion for Xiong Ai about this file: `;updateSendState();toast('✅ Xiong Ai file ready: '+file.name);userInput.focus();}catch(err){toast('Xiong Ai upload failed: '+err.message);}
  e.target.value='';
}
function renderMsg(role,content,isNew=true){
  const d=document.createElement('div');d.className=`msg ${role}`;
  if(role==='user')d.innerHTML=`<div class="bubble">${escapeHtml(content)}</div>`;
  else{const html=typeof marked!=='undefined'?marked.parse(content):escapeHtml(content);d.innerHTML=`<div class="avatar">X</div><div class="bubble">${html}</div>`; setTimeout(()=>d.querySelectorAll('pre code').forEach(b=>{try{hljs.highlightElement(b);}catch{}}),50);}
  messagesEl.appendChild(d); if(isNew) scrollBottom();
}
async function send(override){
  const text=(override||userInput.value||'').trim(); if(!text||isGenerating) return;
  // NEW: Check Memory Note BEFORE sending - ONLY TAKES NOTE
  checkMemoryNote(text);
  welcomeEl.style.display='none'; renderMsg('user',text,true); currentChat.push({role:'user',content:text}); localStorage.setItem('xiong_current',JSON.stringify(currentChat));
  userInput.value=''; updateSendState(); isGenerating=true; typingEl.classList.add('show');
  const wrap=document.createElement('div');wrap.className='msg ai';wrap.innerHTML=`<div class="avatar">X</div><div class="bubble" id="live">▌ Xiong Ai thinking...</div>`;messagesEl.appendChild(wrap);const bubble=wrap.querySelector('#live'); let full='';
  try{
    const userId = localStorage.getItem('xiong_user_id') || 'user_' + Date.now();
    localStorage.setItem('xiong_user_id', userId);
    const res=await fetch('/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text,history:currentChat.slice(0,-1),modelType:currentModel,stream:true,files:attachedFiles,userId})});
    if(!res.ok){let j={};try{j=await res.json();}catch{}throw new Error(j.reply||j.error||`Server ${res.status}`);}
    const ct=res.headers.get('content-type')||'';
    if(ct.includes('application/json')){const d=await res.json();full=d.reply||'';if(!full)throw new Error('Xiong Ai empty reply - Check GROQ_API_KEY');bubble.innerHTML=typeof marked!=='undefined'?marked.parse(full):full;}
    else{const reader=res.body.getReader();const dec=new TextDecoder();let buf='';while(true){const {done,value}=await reader.read();if(done)break;buf+=dec.decode(value,{stream:true});const parts=buf.split('\n\n');buf=parts.pop()||'';for(const part of parts){if(!part.startsWith('data:'))continue;const js=part.slice(5).trim();if(!js)continue;try{const data=JSON.parse(js);if(data.content){full+=data.content;bubble.innerHTML=(typeof marked!=='undefined'?marked.parse(full):full)+'▌';scrollBottom();}if(data.done&&data.fullReply)full=data.fullReply;if(data.error)throw new Error(data.error);}catch(e){if(e.message.includes('Server')||e.message.includes('GROQ'))throw e;}}} }
    if(!full.trim())throw new Error('Xiong Ai empty response - Add GROQ_API_KEY in Render');
    typingEl.classList.remove('show');bubble.innerHTML=(typeof marked!=='undefined'?marked.parse(full):full);
    currentChat.push({role:'assistant',content:full});localStorage.setItem('xiong_current',JSON.stringify(currentChat));chatHistory.unshift({title:text.slice(0,70),date:new Date().toISOString(),chat:[...currentChat]});if(chatHistory.length>100)chatHistory.pop();localStorage.setItem('xiong_ai_v2_history',JSON.stringify(chatHistory));renderHistory();attachedFiles=[];
  }catch(err){typingEl.classList.remove('show');console.error(err);bubble.innerHTML=`<div style="color:#f87171;border:1px solid #7f1d1d;background:#1a0f0f;padding:12px;border-radius:12px"><b>⚠️ Xiong Ai Error:</b><br><code style="font-size:12px;white-space:pre-wrap">${escapeHtml(err.message)}</code></div>`;toast('Xiong Ai Error: '+err.message.slice(0,80));}
  isGenerating=false;updateSendState();scrollBottom();userInput.focus();
}
init();
window.send=send;
window.saveMemoryNote=saveMemoryNote; // Expose for console
