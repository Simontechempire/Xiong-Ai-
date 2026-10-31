// Xiong Ai Memory System - More powerful than ChatGPT memory
let globalMemory = {
  user: {
    name: "Xiong Ai User",
    location: "Ikare, Ondo State",
    interests: ["WhatsApp Bot", "Xiong Ai", "Crasher MD"],
    projects: []
  },
  conversations: [],
  preferences: {
    language: "english",
    codeStyle: "detailed",
    responseLength: "very long"
  }
};

export function getMemory(){
  return globalMemory;
}

export function updateMemory(key, value){
  globalMemory[key] = value;
  return globalMemory;
}

export function addToMemory(conversation){
  globalMemory.conversations.push({
    ...conversation,
    timestamp: new Date().toISOString(),
    id: Date.now()
  });
  if(globalMemory.conversations.length > 100){
    globalMemory.conversations.shift();
  }
}

export function searchMemory(query){
  return globalMemory.conversations.filter(c => 
    JSON.stringify(c).toLowerCase().includes(query.toLowerCase())
  );
}
