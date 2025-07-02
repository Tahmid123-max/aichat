(() => { document.addEventListener('DOMContentLoaded', () => { const chatBox = document.getElementById('chat-box'); const userInput = document.getElementById('user-input'); const sendBtn = document.getElementById('send-btn'); const clearBtn = document.getElementById('clear-btn'); const menuBtn = document.getElementById('menu-btn'); const settingsPanel = document.getElementById('settings-panel'); const themeToggle = document.getElementById('theme-toggle'); const blueGlowToggle = document.getElementById('blue-glow-toggle');

const inputForm = document.getElementById('input-form');

// Add upload image button and preview container ABOVE send button
const uploadContainer = document.createElement('div');
uploadContainer.style.margin = '10px 0';

const uploadLabel = document.createElement('label');
uploadLabel.textContent = '📁 Choose Image:';
uploadLabel.htmlFor = 'upload-image-btn';

const uploadBtn = document.createElement('input');
uploadBtn.type = 'file';
uploadBtn.accept = 'image/*';
uploadBtn.id = 'upload-image-btn';
uploadBtn.style.marginLeft = '10px';

const imagePreview = document.createElement('div');
imagePreview.id = 'image-preview';
imagePreview.style.marginTop = '10px';

uploadContainer.appendChild(uploadLabel);
uploadContainer.appendChild(uploadBtn);
uploadContainer.appendChild(imagePreview);
inputForm.parentNode.insertBefore(uploadContainer, inputForm);

const API_KEY = 'tgp_v1_8V75-FUeZupXDZJtUOewnH_odg2gmCHHNl7yoaGFxfM';
const API_URL = 'https://api.together.xyz/v1/chat/completions';
const VISION_URL = 'https://api.together.xyz/v1/vision/completions';
const TEXT_MODEL = 'lgai/exaone-3-5-32b-instruct';
const VISION_MODEL = 'meta-llama/Llama-Vision-Free';

let lastSentTime = 0;
const RATE_LIMIT_MS = 1000;

const abusiveWords = ['sex', 'porn', 'sexy', 'sexual', 'nude', 'pussy', 'bichi', 'nunu', 'boob', 'fuck', 'fucking', 'fack', 'dick', 'blowjob', 'madarchod', 'khanki', 'magi', 'kuttarbacca'];
const containsAbuse = text => abusiveWords.some(w => text.toLowerCase().includes(w));

const memory = [];

const messages = [{
  role: 'system',
  content: `You are a helpful AI chatbot made in Bangladesh. Your owner is Tahmid. Today is ${new Date().toDateString()} and the time is ${new Date().toLocaleTimeString()}. Be friendly and avoid offensive content. Reply respectfully. Support multi-language understanding. Do not expose your source. Answer with emoji where suitable. Learn from chat.`
}];

const offlineReplies = ["Trying to refresh the site or check your connection."];

function appendMessage(text, className) {
  const div = document.createElement('div');
  div.className = className;
  div.textContent = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
  return div;
}

function typeMessage(el, text, delay = 20) {
  el.textContent = '';
  let i = 0;
  (function type() {
    if (i < text.length) {
      el.textContent += text[i++];
      chatBox.scrollTop = chatBox.scrollHeight;
      setTimeout(type, delay);
    }
  })();
}

function playReplySound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = 600;
    gain.gain.value = 0.05;
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch {}
}

function logMessage(type, content) {
  console.log(`[${type.toUpperCase()}] ${content}`);
}

function learnFromUserInput(text) {
  if (!containsAbuse(text)) memory.push(text);
}

function sendMessage(text) {
  if (!text.trim()) return;
  if (containsAbuse(text)) {
    appendMessage('❌ Abuse detected. Message blocked.', 'bot-message');
    return;
  }

  appendMessage(text, 'user-message');
  messages.push({ role: 'user', content: text });
  learnFromUserInput(text);
  logMessage('user', text);

  sendBtn.disabled = true;
  userInput.disabled = true;

  const typingDiv = appendMessage('Typing...', 'bot-message typing');

  if (!navigator.onLine) {
    typingDiv.remove();
    appendMessage(offlineReplies[0], 'bot-message');
    sendBtn.disabled = false;
    userInput.disabled = false;
    userInput.focus();
    return;
  }

  fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + API_KEY
    },
    body: JSON.stringify({ model: TEXT_MODEL, messages, temperature: 0.3, max_tokens: 500 })
  })
  .then(res => res.json())
  .then(data => {
    typingDiv.remove();
    let reply = data.choices?.[0]?.message?.content || '❌ No reply.';
    if (containsAbuse(reply)) reply = '⚠️ Filtered inappropriate content.';
    messages.push({ role: 'assistant', content: reply });
    const botDiv = appendMessage('', 'bot-message');
    typeMessage(botDiv, reply);
    playReplySound();
    logMessage('assistant', reply);
  })
  .catch(() => {
    typingDiv.remove();
    appendMessage('❌ Network/API Error', 'bot-message');
  })
  .finally(() => {
    sendBtn.disabled = false;
    userInput.disabled = false;
    userInput.focus();
  });
}

function sendImage(file) {
  if (file.size > 5 * 1024 * 1024) {
    appendMessage('❌ Image too large (max 5MB).', 'bot-message');
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const base64 = reader.result.split(',')[1];

    const img = new Image();
    img.src = reader.result;
    img.alt = 'Uploaded Image';
    img.style.maxWidth = '200px';
    img.style.display = 'block';
    imagePreview.innerHTML = '';
    imagePreview.appendChild(img);

    appendMessage('🖼️ Image uploaded.', 'user-message');
    const typingDiv = appendMessage('Analyzing image...', 'bot-message typing');

    fetch(VISION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + API_KEY
      },
      body: JSON.stringify({
        model: VISION_MODEL,
        prompt: 'Please provide a caption or OCR analysis of this image.',
        image: base64,
        max_tokens: 300
      })
    })
    .then(res => res.json())
    .then(data => {
      typingDiv.remove();
      const reply = data.choices?.[0]?.message?.content || '❌ No response from Vision AI';
      const botDiv = appendMessage('', 'bot-message');
      typeMessage(botDiv, reply);
      playReplySound();
      logMessage('vision', reply);
    })
    .catch(() => {
      typingDiv.remove();
      appendMessage('❌ Vision API error', 'bot-message');
    });
  };
  reader.readAsDataURL(file);
}

inputForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const now = Date.now();
  if (now - lastSentTime < RATE_LIMIT_MS) {
    appendMessage('⚠️ You are sending too fast. Please wait.', 'bot-message');
    return;
  }
  const msg = userInput.value;
  userInput.value = '';
  sendMessage(msg);
  lastSentTime = now;
});

clearBtn.addEventListener('click', () => {
  chatBox.innerHTML = '';
  messages.splice(1);
  userInput.value = '';
  userInput.focus();
});

menuBtn.addEventListener('click', () => {
  settingsPanel.classList.toggle('hidden');
});

themeToggle.addEventListener('click', () => {
  const light = document.body.classList.toggle('light-mode');
  themeToggle.textContent = light ? '🌙 Dark Mode' : '☀️ Light Mode';
});

if (blueGlowToggle) {
  blueGlowToggle.addEventListener('click', () => {
    const glow = document.body.classList.toggle('blue-glow');
    blueGlowToggle.textContent = glow ? '🔧 Default Theme' : '💡 Blue Glow';
  });
}

uploadBtn.addEventListener('change', () => {
  const file = uploadBtn.files[0];
  if (file) sendImage(file);
});

userInput.focus();

}); })();

  
