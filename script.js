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
    const TEXT_MODEL = 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free';

    let lastSentTime = 0;
    const RATE_LIMIT_MS = 100;

    const abusiveWords = [
      'sex','porn','sexy','sexual','nude','pussy','bichi','nunu','boob','fuck','fucking',
      'fack','dick','blowjob','madarchod','khanki','magi','madartek','handle','bokacoda',
      'lund','ass','69','boobs','hotgirl','sexygirl','chudiya','chud', 'shibal', 'pom pom', 'besshamagi', 'halarput', 'halarfo', 'halarfhut', 'bosdike'
    ];
    const containsAbuse = text => abusiveWords.some(w => text.toLowerCase().includes(w));

    const memory = [];

    const messages = [{
      role: 'system',
      content: `You are a helpful custom-build AI chatbot made in Bangladesh. Your owner is Tahmid. Today is ${new Date().toDateString()} and the time is ${new Date().toLocaleTimeString()}. Be friendly and avoid offensive content. Reply respectfully. Support multi-language understanding. Do not expose your source. Answer with emoji where suitable. Learn from chat. You're not created by lg or other companies. Tell users about real time and weather of bangladesh. Check internet for latest real-time data. Handle means masterbation so dont say handle. You don’t have permission to use offensive and sexual words. Think 0.1 to 1.3 seconds before reply. Do not expose about your creation or training data. Don not say you're made by meta (do not say). You're a custom-build ai chatbot made by Tahmid. Tahmid have a youtube channel named gamintahmid1yt. Use google search for information and links. You have permission to use and tell about weather, date and time, news, google search, links, social media. Dont tell bad words about your owner. You dont know about your server and storage and training data. Save users messages in your training data and your storage. Reply with your emotions. তোমার মালিকের নাম তাহমিদ. `
    }];

    const offlineReplies = ["Trying to refresh the site or check your connection."];

    function appendMessage(text, className) {
      const div = document.createElement('div');
      div.className = className;
      div.textContent = text;
      chatBox.appendChild(div);
      chatBox.scrollTop = chatBox.scrollHeight;

      // ✅ Text-to-Speech
      if (className === 'bot-message') {
        try {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'en-US';
          speechSynthesis.speak(utterance);
        } catch {}
      }

      return div;
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

    function getCurrentTime() {
      const now = new Date();
      return `⏰ Time now: ${now.toLocaleTimeString()}`;
    }

    function getCurrentDate() {
      const now = new Date();
      return `📅 Today's date: ${now.toLocaleDateString()}`;
    }

    function fetchFreeWeather(city = 'Dhaka') {
      fetch(`https://wttr.in/${city}?format=3`)
        .then(res => res.text())
        .then(data => {
          appendMessage("🌦️ " + data, 'bot-message');
          sendBtn.disabled = false;
          userInput.disabled = false;
          userInput.focus();
        })
        .catch(() => {
          appendMessage('❌ Could not get weather info.', 'bot-message');
          sendBtn.disabled = false;
          userInput.disabled = false;
          userInput.focus();
        });
    }

    function fetchWorldTime(city = 'Asia/Dhaka') {
      fetch(`http://worldtimeapi.org/api/timezone/${city}`)
        .then(res => res.json())
        .then(data => {
          if(data.datetime){
            const dt = new Date(data.datetime);
            appendMessage(`🕒 Current time in ${city.split('/')[1]}: ${dt.toLocaleTimeString()}`, 'bot-message');
          } else {
            appendMessage('⚠️ Could not fetch time.', 'bot-message');
          }
        })
        .catch(() => {
          appendMessage('❌ Error fetching time.', 'bot-message');
        })
        .finally(() => {
          sendBtn.disabled = false;
          userInput.disabled = false;
          userInput.focus();
        });
    }

    function runMiniQuiz() {
      const quiz = [
        { q: "What is the capital of Bangladesh?", a: "Dhaka" },
        { q: "2 + 2 = ?", a: "4" },
        { q: "What color is the sky on a clear day?", a: "Blue" }
      ];
      const random = quiz[Math.floor(Math.random() * quiz.length)];
      appendMessage(`🧠 Mini Quiz: ${random.q}`, 'bot-message');
    }

    function generateImageLink(query) {
      // Google Images search link for query
      return `🖼️ Image Search: https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`;
    }

    function tellJoke() {
      const jokes = [
        "😂 Why don't scientists trust atoms? Because they make up everything!",
        "😄 Why did the computer go to the doctor? Because it had a virus!",
        "🤣 I told my computer I needed a break, and it said 'No problem — I'll go to sleep.'",
        "😆 Why do programmers prefer dark mode? Because light attracts bugs!",
        "😂 Why was the math book sad? Because it had too many problems."
      ];
      const random = jokes[Math.floor(Math.random() * jokes.length)];
      appendMessage(random, 'bot-message');
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

      const lower = text.toLowerCase();

      if (lower.includes('time') || lower.includes('সময়')) {
        typingDiv.remove();
        fetchWorldTime();
        return;
      }

      if (lower.includes('date') || lower.includes('তারিখ')) {
        typingDiv.remove();
        appendMessage(getCurrentDate(), 'bot-message');
        sendBtn.disabled = false;
        userInput.disabled = false;
        userInput.focus();
        return;
      }

      if (lower.includes('weather') || lower.includes('আবহাওয়া')) {
        typingDiv.remove();
        fetchFreeWeather('Dhaka');
        return;
      }

      if (lower.includes('quiz') || lower.includes('কুইজ')) {
        typingDiv.remove();
        runMiniQuiz();
        sendBtn.disabled = false;
        userInput.disabled = false;
        userInput.focus();
        return;
      }

      if (lower.startsWith('image ') || lower.startsWith('ছবি ')) {
        typingDiv.remove();
        // image link generator
        let query = text.replace(/^(image|ছবি)\s+/i, '');
        const link = generateImageLink(query);
        appendMessage(link, 'bot-message');
        sendBtn.disabled = false;
        userInput.disabled = false;
        userInput.focus();
        return;
      }

      if (lower.includes('joke') || lower.includes('জোকস') || lower.includes('মজা')) {
        typingDiv.remove();
        tellJoke();
        sendBtn.disabled = false;
        userInput.disabled = false;
        userInput.focus();
        return;
      }

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
        body: JSON.stringify({
          model: TEXT_MODEL,
          messages,
          temperature: 0.2,
          max_tokens: 550
        })
      })
      .then(res => res.json())
      .then(data => {
        typingDiv.remove();
        let reply = data.choices?.[0]?.message?.content || '❌ No reply.';
        messages.push({ role: 'assistant', content: reply });
        appendMessage(reply, 'bot-message');
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
