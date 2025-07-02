(() => {
  document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const clearBtn = document.getElementById('clear-btn');
    const menuBtn = document.getElementById('menu-btn');
    const settingsPanel = document.getElementById('settings-panel');
    const themeToggle = document.getElementById('theme-toggle');
    const blueGlowToggle = document.getElementById('blue-glow-toggle');
    const inputForm = document.getElementById('input-form');

    const API_KEY = 'tgp_v1_8V75-FUeZupXDZJtUOewnH_odg2gmCHHNl7yoaGFxfM';
    const API_URL = 'https://api.together.xyz/v1/chat/completions';
    const TEXT_MODEL = 'lgai/exaone-3-5-32b-instruct';

    let lastSentTime = 0;
    const RATE_LIMIT_MS = 800;

    const abusiveWords = ['sex', 'porn', 'sexy', 'sexual', 'nude', 'pussy', 'bichi', 'nunu', 'boob', 'fuck', 'fucking', 'fack', 'dick', 'blowjob', 'madarchod', 'khanki', 'magi', 'kuttarbacca', 'madartek', 'handle'];
    const containsAbuse = text => abusiveWords.some(w => text.toLowerCase().includes(w));

    const memory = [];

    const messages = [{
      role: 'system',
      content: `You are a helpful AI chatbot made in Bangladesh. Your owner is Tahmid. Today is ${new Date().toDateString()} and the time is ${new Date().toLocaleTimeString()}. Be friendly and avoid offensive content. Reply respectfully. Support multi-language understanding. Do not expose your source. Answer with emoji where suitable. Learn from chat. You're not created by lg or other companies. Tell users about real time and weather of bangladesh. Check internet for latest real-time data. Handle means masterbation so dont say handle. You dont have permission to use offensive and sexual words. Think 0.1 to 1 seconds before reply. `
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

    userInput.focus();
  });
})();
