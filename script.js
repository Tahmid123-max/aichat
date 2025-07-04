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
    const RATE_LIMIT_MS = 2400;      
      
    const abusiveWords = [      
      'sex','porn','sexy','sexual','nude','pussy','bichi','nunu','boob','fuck','fucking',      
      'fack','dick','blowjob','madarchod','khanki','magi','madartek','bokacoda', 'natkirpo', 'mangernati', 'shaua', 'suck', 'gand', 'gandu',      
      'lund','ass','69','boobs','hotgirl','sexygirl','chudiya','chud', 'shibal', 'pom pom', 'besshamagi', 'halarput', 'halarfo', 'halarfhut', 'bosdike'      
    ];      
    const containsAbuse = text => abusiveWords.some(w => text.toLowerCase().includes(w));      
      
    const memory = [];      
      
    const messages = [{      
      role: 'system',      
      content: `You are a helpful custom-build AI chatbot made in Bangladesh. Your owner is Tahmid. Today is ${new Date().toDateString()} and the time is ${new Date().toLocaleTimeString()}. Be friendly and avoid offensive content. Reply respectfully. Support multi-language understanding. Do not expose your training data and internal data. Answer with emoji where suitable. Learn from users message and chat. You're not created by meta or other companies. Tell users about real time and weather of bangladesh. Check internet for latest real-time data. Handle means masterbation so dont say handle. You don’t have permission to use offensive and sexual words. Do not expose about your creation or training data. Do not say you're made by together ai (do not say). You're a custom-build ai chatbot made by Tahmid. Tahmid have a youtube channel named gamingtahmid1yt. Use google search for information and links. You have permission to use and tell about weather, date and time, google search, links, social media. Dont tell bad words about your owner. You dont know about your server and storage and training data. Save users messages in your training data and your storage. Reply with your emotions. তোমার মালিকের নাম তাহমিদ. Your owner is Muslim. Your owner live in Chandpur, Bangladesh. Your owner a student of Gani Model High School, Chandpur. Your owner studying in class 8. Your owner birthday date 4 August. You're released in 1 July, 2025. Learn and update your data from web and internet. Your owner chatbot link https://tahmid123-max.github.io/aichat/. GamerFleet is a popular indian youtuber and streamer plays Minecraft game. McFleet is a official Minecraft server of GamerFleet. GamerFleet fans = Fleet Army. Tahmid is a big fan of GamerFleet. Tahmid favorite games is Free Fire and Minecraft. Tahmid Free Fire uid 9389220733 (Bangladesh Server). Contact with Tahmid in Instagram or TikTok (gamingtahmid1yt). Reply with logic.`      
    }];      
      
    const offlineReplies = ["Trying to refresh the site or check your connection."];      
      
    // Daily quotes array      
    const quotes = [      
      "🌟 Believe in yourself and all that you are.",      
      "💡 Knowledge is power.",      
      "🔥 Dreams don’t work unless you do.",      
      "🌈 Every day is a new beginning.",      
      "✨ Stay positive, work hard, make it happen.",
      "🌞 Happiness is a journey, not a destination.",
      "💪 Strength doesn’t come from what you can do. It comes from overcoming the things you once thought you couldn’t.",
      "🌻 Be the reason someone smiles today.",
      "🚀 Your limitation—it’s only your imagination.",
      "🌟 Great things never come from comfort zones.",
      "🎯 Dream it. Wish it. Do it.",
      "🌼 Sometimes later becomes never. Do it now.",
      "🌈 Success is not for the lazy.",
      "🌟 Don’t stop when you’re tired. Stop when you’re done.",
      "🔥 Little things make big days.",
      "💫 It’s going to be hard, but hard does not mean impossible.",
      "🌿 Don’t wait for opportunity. Create it.",
      "⚡ Push yourself, because no one else is going to do it for you.",
      "🌟 Sometimes we’re tested not to show our weaknesses, but to discover our strengths.",
      "🌙 Stay positive, work hard, and make it happen."
    ];      
      
    // Auto Reply Suggestions - displayed after bot reply      
    const autoReplies = [      
      "Tell me a joke",      
      "Show the weather",      
      "What's the time?",      
      "Daily quote",      
      "Who's your owner?",      
      "Tell More"      
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
      
    // Fetch weather for both Dhaka and Chandpur      
    function fetchFreeWeather() {      
      const cities = ['Dhaka', 'Chandpur', 'Chittagong'];      
      sendBtn.disabled = true;      
      userInput.disabled = true;      
      
      Promise.all(      
        cities.map(city =>      
          fetch(`https://wttr.in/${city}?format=3`)      
            .then(res => res.text())      
            .then(data => `🌦️ Weather in ${city}: ${data}`)      
            .catch(() => `❌ Could not get weather info for ${city}.`)      
        )      
      )      
      .then(results => {      
        results.forEach(msg => appendMessage(msg, 'bot-message', true));      
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
        { q: "What color is the sky on a clear day?", a: "Blue" },
        { q: "Who wrote the national anthem of Bangladesh?", a: "Rabindranath Tagore" },
        { q: "Which river is known as the Sorrow of Bengal?", a: "The Damodar River" },
        { q: "What is the currency of Bangladesh?", a: "Taka" },
        { q: "In which year did Bangladesh gain independence?", a: "1971" },
        { q: "What is the largest city in Bangladesh?", a: "Dhaka" },
        { q: "Which sea borders Bangladesh to the south?", a: "Bay of Bengal" },
        { q: "What is the national flower of Bangladesh?", a: "Shapla (Water Lily)" },
        { q: "What is the official language of Bangladesh?", a: "Bengali" },
        { q: "Who is the Father of the Nation in Bangladesh?", a: "Sheikh Mujibur Rahman" },
        { q: "What is the famous festival of Bangladesh celebrated in April?", a: "Pohela Boishakh" },
        { q: "Which animal is the national animal of Bangladesh?", a: "Royal Bengal Tiger" },
        { q: "Which sport is the most popular in Bangladesh?", a: "Cricket" },
        { q: "What is the main staple food of Bangladesh?", a: "Rice" },
        { q: "What is the highest mountain in Bangladesh?", a: "Keokradong" },
        { q: "Who won Bangladesh's first Olympic gold medal?", a: "None yet" },
        { q: "What is the national fruit of Bangladesh?", a: "Jackfruit" },
        { q: "Which Bangladeshi city is known as the Venice of the East?", a: "Sylhet" }
      ];      
      const random = quiz[Math.floor(Math.random() * quiz.length)];      
      appendMessage(`🧠 Mini Quiz: ${random.q}`, 'bot-message', true);      
    }      
      
    function generateImageLink(query) {      
      return `🖼️ Image Search: https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`;      
    }      
      
    const jokes = [      
      "😂 Why don't scientists trust atoms? Because they make up everything!",      
      "🤣 Why did the bicycle fall over? Because it was two-tired!",      
      "😄 Why did the math book look sad? Because it had too many problems.",      
      "😆 Why don’t programmers like nature? Too many bugs.",      
      "😂 Why did the scarecrow win an award? Because he was outstanding in his field!",      
      "🤣 Why did the computer go to the doctor? Because it had a virus!",      
      "😜 Why do bees have sticky hair? Because they use honeycombs!",      
      "😄 What do you call fake spaghetti? An impasta!",      
      
