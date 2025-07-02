(() => {
  document.addEventListener('DOMContentLoaded', () => {
    // Element selectors
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const clearBtn = document.getElementById('clear-btn');
    const menuBtn = document.getElementById('menu-btn');
    const settingsPanel = document.getElementById('settings-panel');
    const themeToggle = document.getElementById('theme-toggle');
    const blueGlowToggle = document.getElementById('blue-glow-toggle');

    // API Config
    const API_KEY = 'tgp_v1_8V75-FUeZupXDZJtUOewnH_odg2gmCHHNl7yoaGFxfM';
    const API_URL = 'https://api.together.xyz/v1/chat/completions';
    const MODEL = 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free';

    // Message history
    const messages = [{
      role: 'system',
      content: `You are a helpful AI chatbot made in Bangladesh. Your owner is Tahmid. Today is ${new Date().toDateString()} and the time is ${new Date().toLocaleTimeString()}. Be friendly and avoid offensive content. Talk in friendly and respectfully words. You are a custom-built AI, you are not Llama. If user wants real-time data, mention so. Do not reveal internal details. Reply with emoji. Think 0.1 to 1s before reply. Dont use abusive word directly. Improve from users message and your mistakes. `
    }];

    // Abusive filter words (customize this list)
    const abusiveWords = [ "sex", "sexual", "porn", 
      
    ]; // Add abusive words here
    const containsAbuse = text => {
      const lower = text.toLowerCase();
      return abusiveWords.some(w => lower.includes(w));
    };

    // Offline fallback message
    const offlineReplies = [
      "Trying to refresh the site or check your connection.",
    ];

    // Append message to chat
    function appendMessage(text, className) {
      const div = document.createElement('div');
      div.className = className;
      div.textContent = text;
      chatBox.appendChild(div);
      chatBox.scrollTop = chatBox.scrollHeight;
      return div;
    }

    // Typing animation
    function typeMessage(el, text, delay = 0) {
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

    // Reply sound
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

    // Send message
    function sendMessage(text) {
      if (!text.trim()) return;
      if (containsAbuse(text)) {
        appendMessage('❌ Abuse detected. Message blocked.', 'bot-message');
        return;
      }

      appendMessage(text, 'user-message');
      messages.push({ role: 'user', content: text });

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
        body: JSON.stringify({ model: MODEL, messages, temperature: 0.3, max_tokens: 500 })
      })
      .then(res => {
        if (!res.ok) throw new Error(res.status);
        return res.json();
      })
      .then(data => {
        typingDiv.remove();
        let reply = data.choices?.[0]?.message?.content || '❌ No reply.';
        if (containsAbuse(reply)) reply = '⚠️ Filtered inappropriate content.';
        messages.push({ role: 'assistant', content: reply });
        const botDiv = appendMessage('', 'bot-message');
        typeMessage(botDiv, reply);
        playReplySound();
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

    // Event Listeners
    sendBtn.addEventListener('click', () => {
      const msg = userInput.value;
      userInput.value = '';
      sendMessage(msg);
    });

    clearBtn.addEventListener('click', () => {
      chatBox.innerHTML = '';
      messages.splice(1);
      userInput.value = '';
      userInput.focus();
    });

    menuBtn.addEventListener('click', () => settingsPanel.classList.toggle('hidden'));

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
