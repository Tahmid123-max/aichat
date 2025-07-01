(() => {
  // Element selectors
  const chatBox = document.getElementById('chat-box');
  const userInput = document.getElementById('user-input');
  const sendBtn = document.getElementById('send-btn');
  const clearBtn = document.getElementById('clear-btn');
  const menuBtn = document.getElementById('menu-btn');
  const settingsPanel = document.getElementById('settings-panel');
  const themeToggle = document.getElementById('theme-toggle');

  // API Config
  const API_KEY = 'tgp_v1_8V75-FUeZupXDZJtUOewnH_odg2gmCHHNl7yoaGFxfM';
  const API_URL = 'https://api.together.xyz/v1/chat/completions';
  const MODEL = 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free';

  // Message history
  const messages = [{
    role: 'system',
    content: `You are a helpful AI chatbot made in Bangladesh. Your owner is Tahmid. Today is ${new Date().toDateString()} and the time is ${new Date().toLocaleTimeString()}. Be friendly and avoid offensive content. Talk in friendly and respectly words. You are a custom build ai, you are not llama or llama 3. If user want real time data tell real time data from web. Dont say you are llama. Dont say how you created or your data (keep secret). You have permission to tell real time of Bangladesh. Think 0.1 to 2 second before reply. Dont abuse. Improve your system and training data from user messages and your mistakes. Learn from your mistakes. Improve your training data day by day and keep up to date data and informations in your system. `
  }];

  // Offline replies
  const offlineReplies = [
    "🔌 You're offline, but I'm still here.",
    "💬 Offline? No problem. I'm ready!",
    "You're offline, check your connection.",
    "Check your connection or try again."
  ];

  // Append message
  const appendMessage = (text, className) => {
    const div = document.createElement('div');
    div.className = className;
    div.textContent = text;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
    return div;
  };

  // Typing animation
  const typeMessage = (el, text, delay = 0) => {
    el.textContent = '';
    let i = 0;
    const type = () => {
      if (i < text.length) {
        el.textContent += text.charAt(i++);
        chatBox.scrollTop = chatBox.scrollHeight;
        setTimeout(type, delay);
      }
    };
    type();
  };

  // Reply sound
  const playReplySound = () => {
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
    } catch (e) {
      console.warn('Audio error:', e);
    }
  };

  // Send user message
  const sendMessage = (text) => {
    if (!text.trim()) return;

    appendMessage(text, 'user-message');
    messages.push({ role: 'user', content: text });

    sendBtn.disabled = true;
    userInput.disabled = true;

    const typingDiv = appendMessage('Typing...', 'bot-message typing');

    if (!navigator.onLine) {
      typingDiv.remove();
      const fallback = offlineReplies[Math.floor(Math.random() * offlineReplies.length)];
      appendMessage(fallback, 'bot-message');
      messages.push({ role: 'assistant', content: fallback });
      sendBtn.disabled = false;
      userInput.disabled = false;
      userInput.focus();
      return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open('POST', API_URL, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + API_KEY);

    xhr.onload = () => {
      typingDiv.remove();
      if (xhr.status === 200) {
        try {
          const res = JSON.parse(xhr.responseText);
          const reply = res.choices[0].message.content;
          messages.push({ role: 'assistant', content: reply });
          const botDiv = appendMessage('', 'bot-message');
          typeMessage(botDiv, reply);
          playReplySound();
        } catch (e) {
          appendMessage('❌ Response error', 'bot-message');
        }
      } else {
        appendMessage(`❌ API Error: ${xhr.status}`, 'bot-message');
      }
      sendBtn.disabled = false;
      userInput.disabled = false;
      userInput.focus();
    };

    xhr.onerror = () => {
      typingDiv.remove();
      appendMessage('❌ Network Error', 'bot-message');
      sendBtn.disabled = false;
      userInput.disabled = false;
      userInput.focus();
    };

    const body = JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.2,
      max_tokens: 550
    });

    xhr.send(body);
  };

  // UI Event Listeners
  document.addEventListener('DOMContentLoaded', () => {
    // Send on button click
    sendBtn.addEventListener('click', () => {
      const msg = userInput.value;
      if (msg.trim()) {
        userInput.value = '';
        sendMessage(msg);
      }
    });

    // Send on Enter
    userInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendBtn.click();
      }
    });

    // Clear button
    clearBtn.addEventListener('click', () => {
      chatBox.innerHTML = '';
      messages.splice(1); // keep system prompt
      userInput.value = '';
      userInput.focus();
    });

    // Toggle settings panel
    menuBtn.addEventListener('click', () => {
      settingsPanel.classList.toggle('hidden');
    });

    // Theme toggle
    themeToggle.addEventListener('click', () => {
      const light = document.body.classList.toggle('light-mode');
      themeToggle.textContent = light ? '🌙 Dark Mode' : '☀️ Light Mode';
    });

    userInput.focus();
  });
})();
