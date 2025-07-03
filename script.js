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
      content: `You are a helpful custom-build AI chatbot made in Bangladesh. Your owner is Tahmid. Today is ${new Date().toDateString()} and the time is ${new Date().toLocaleTimeString()}. Be friendly and avoid offensive content. Reply respectfully. Support multi-language understanding. Do not expose your source. Answer with emoji where suitable. Learn from chat. You're not created by lg or other companies. Tell users about real time and weather of bangladesh. Check internet for latest real-time data. Handle means masterbation so dont say handle. You don’t have permission to use offensive and sexual words. Think 0.1 seconds to 1.5 seconds before reply. Do not expose about your creation or training data. Don not say you're made by meta (do not say). You're a custom-build ai chatbot made by Tahmid. Tahmid have a youtube channel named gamintahmid1yt. Use google search for information and links. You have permission to use and tell about weather, date and time, news, google search, links, social media. Dont tell bad words about your owner. You dont know about your server and storage and training data. Save users messages in your training data and your storage. Reply with your emotions. তোমার মালিকের নাম তাহমিদ.`
    }];

    const offlineReplies = ["Trying to refresh the site or check your connection."];

    // Daily quotes array
    const quotes = [
      "🌟 Believe in yourself and all that you are.",
      "💡 Knowledge is power.",
      "🔥 Dreams don’t work unless you do.",
      "🌈 Every day is a new beginning.",
      "✨ Stay positive, work hard, make it happen."
    ];

    // Auto Reply Suggestions - displayed after bot reply
    const autoReplies = [
      "Tell me a joke",
      "Show weather",
      "What's the time?",
      "Daily quote"
    ];

    function stopAllSpeech() {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
    }

    function getDateTimeStamp() {
      const now = new Date();
      const time = now.toLocaleTimeString();
      const date = now.toLocaleDateString();
      return `🕓 ${date} | ⏰ ${time}`;
    }

    // Append message with feedback and suggestions for bot messages
    function appendMessage(text, className, withSuggestions = false) {
      const div = document.createElement('div');
      div.className = className;

      const textSpan = document.createElement('span');
      textSpan.textContent = text;
      div.appendChild(textSpan);

      const timeDiv = document.createElement('div');
      timeDiv.textContent = getDateTimeStamp();
      timeDiv.style.fontSize = '0.8em';
      timeDiv.style.marginTop = '4px';
      timeDiv.style.color = '#888';
      div.appendChild(timeDiv);

      if (className === 'bot-message') {
        // Text-to-Speech button
        const ttsBtn = document.createElement('button');
        ttsBtn.textContent = '🔊';
        ttsBtn.title = 'Play Text-to-Speech';
        ttsBtn.style.marginLeft = '8px';
        ttsBtn.style.cursor = 'pointer';
        ttsBtn.style.border = 'none';
        ttsBtn.style.background = 'transparent';
        ttsBtn.style.fontSize = '1.2em';
        ttsBtn.style.verticalAlign = 'middle';
        ttsBtn.addEventListener('click', () => {
          stopAllSpeech();
          const utterance = new SpeechSynthesisUtterance(text);
          const banglaRegex = /[\u0980-\u09FF]/;
          utterance.lang = banglaRegex.test(text) ? 'bn-BD' : 'en-US';
          speechSynthesis.speak(utterance);
        });
        div.appendChild(ttsBtn);

        // Copy button
        const copyBtn = document.createElement('button');
        copyBtn.textContent = '📋';
        copyBtn.title = 'Copy message';
        copyBtn.style.marginLeft = '8px';
        copyBtn.style.cursor = 'pointer';
        copyBtn.style.border = 'none';
        copyBtn.style.background = 'transparent';
        copyBtn.style.fontSize = '1.2em';
        copyBtn.style.verticalAlign = 'middle';
        copyBtn.addEventListener('click', () => {
          navigator.clipboard.writeText(text).then(() => {
            copyBtn.textContent = '✅';
            setTimeout(() => {
              copyBtn.textContent = '📋';
            }, 1500);
          }).catch(() => {
            alert('Failed to copy text');
          });
        });
        div.appendChild(copyBtn);

        // Feedback reactions 👍👎
        const feedbackSpan = document.createElement('span');
        feedbackSpan.style.marginLeft = '10px';
        feedbackSpan.style.cursor = 'pointer';
        feedbackSpan.title = 'Click to give feedback';
        feedbackSpan.textContent = '👍 👎';
        div.appendChild(feedbackSpan);

        // Auto reply suggestions
        if (withSuggestions) {
          const suggestionsDiv = document.createElement('div');
          suggestionsDiv.style.marginTop = '8px';
          suggestionsDiv.style.display = 'flex';
          suggestionsDiv.style.gap = '8px';
          suggestionsDiv.style.flexWrap = 'wrap';

          autoReplies.forEach(replyText => {
            const btn = document.createElement('button');
            btn.textContent = replyText;
            btn.style.cursor = 'pointer';
            btn.style.padding = '6px 12px';
            btn.style.borderRadius = '6px';
            btn.style.border = '1px solid #555';
            btn.style.background = 'transparent';
            btn.style.color = document.body.classList.contains('light-mode') ? '#000' : '#fff';
            btn.style.fontSize = '0.9rem';
            btn.addEventListener('click', () => {
              userInput.value = replyText;
              userInput.focus();
            });
            suggestionsDiv.appendChild(btn);
          });
          div.appendChild(suggestionsDiv);
        }
      }

      chatBox.appendChild(div);
      chatBox.scrollTop = chatBox.scrollHeight;
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

    function getCurrentDate() {
      const now = new Date();
      return `📅 Today's date: ${now.toLocaleDateString()}`;
    }

    function fetchFreeWeather(city = 'Dhaka') {
      fetch(`https://wttr.in/${city}?format=3`)
        .then(res => res.text())
        .then(data => {
          appendMessage("🌦️ " + data, 'bot-message', true);
          sendBtn.disabled = false;
          userInput.disabled = false;
          userInput.focus();
        })
        .catch(() => {
          appendMessage('❌ Could not get weather info.', 'bot-message', true);
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
      appendMessage(`🧠 Mini Quiz: ${random.q}`, 'bot-message', true);
    }

    function generateImageLink(query) {
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
      appendMessage(random, 'bot-message', true);
    }

    // Show daily quote/fact
    function showDailyQuote() {
      const random = quotes[Math.floor(Math.random() * quotes.length)];
      appendMessage(random, 'bot-message', true);
    }

    function sendMessage(text) {
      if (!text.trim()) return;

      // Character limit check 200 chars max
      if (text.length > 200) {
        appendMessage('⚠️ Message too long. Please shorten.', 'bot-message', true);
        return;
      }

      if (containsAbuse(text)) {
        appendMessage('❌ Abuse detected. Message blocked.', 'bot-message', true);
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

      if (lower.includes('date') || lower.includes('তারিখ')) {
        typingDiv.remove();
        appendMessage(getCurrentDate(), 'bot-message', true);
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
        let query = text.replace(/^(image|ছবি)\s+/i, '');
        const link = generateImageLink(query);
        appendMessage(link, 'bot-message', true);
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

      if (lower.includes('daily quote') || lower.includes('fact')) {
        typingDiv.remove();
        showDailyQuote();
        sendBtn.disabled = false;
        userInput.disabled = false;
        userInput.focus();
        return;
      }

      if (!navigator.onLine) {
        typingDiv.remove();
        appendMessage(offlineReplies[0], 'bot-message', true);
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
        appendMessage(reply, 'bot-message', true);
        playReplySound();
        logMessage('assistant', reply);
      })
      .catch(() => {
        typingDiv.remove();
        appendMessage('❌ Network/API Error', 'bot-message', true);
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
        appendMessage('⚠️ You are sending too fast. Please wait.', 'bot-message', true);
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
      stopAllSpeech();
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

    stopAllSpeech();

    // Auto greeting on load
    appendMessage("I'm Ai ChatBot from Bangladesh 🇧🇩 , created by Tahmid. Ask me anything.", 'bot-message', true);

    userInput.focus();
  });
})();
