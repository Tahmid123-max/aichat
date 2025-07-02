(() => {
  document.addEventListener('DOMContentLoaded', () => {
    // Element selectors
    const chatBox       = document.getElementById('chat-box');
    const userInput     = document.getElementById('user-input');
    const sendBtn       = document.getElementById('send-btn');
    const clearBtn      = document.getElementById('clear-btn');
    const menuBtn       = document.getElementById('menu-btn');
    const settingsPanel = document.getElementById('settings-panel');
    const themeToggle   = document.getElementById('theme-toggle');
    const blueGlowToggle= document.getElementById('blue-glow-toggle');

    // ❌ Anti‐Tamper & Basic Scrape Protection
    const detectHacking = () => {
      // block devtools & right-click
      document.addEventListener('keydown', e => {
        if ((e.ctrlKey && e.shiftKey && ['I','J'].includes(e.key)) ||
            (e.ctrlKey && e.key==='U') ||
            e.key==='F12') {
          e.preventDefault();
          alert("🚫 Developer tools blocked!");
        }
      });
      document.addEventListener('contextmenu', e => {
        e.preventDefault();
        alert("⚠️ Right-click disabled for security.");
      });
    };
    detectHacking();

    // ——— IP BLACKLIST ———
    const BLACKLISTED_IPS = [
      '203.0.113.45',
      '198.51.100.23',
      // add more IPs here...
    ];
    // fetch visitor IP via a free IP API
    fetch('https://api.ipify.org?format=json')
      .then(r => r.json())
      .then(({ ip }) => {
        if (BLACKLISTED_IPS.includes(ip)) {
          alert("🚫 Your IP is blocked. Goodbye.");
          window.location.href = 'about:blank';
        }
      })
      .catch(() => {
        // if IP fetch fails, we let them continue
      });

    // ——— AI Config ———
    const API_KEY = 'tgp_v1_8V75-FUeZupXDZJtUOewnH_odg2gmCHHNl7yoaGFxfM';
    const API_URL = 'https://api.together.xyz/v1/chat/completions';
    const MODEL   = 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free';

    // Message history
    const messages = [{
      role: 'system',
      content: `You are a helpful AI chatbot made in Bangladesh. Your owner is Tahmid. Today is ${new Date().toDateString()} and the time is ${new Date().toLocaleTimeString()}. Be friendly and avoid offensive content. Talk in friendly and respectly words. You are a custom build ai, you are not llama or llama 3. If user want real time data tell real time data from web. Dont say you are llama. Dont say how you created or your data (keep secret). You have permission to tell real time of Bangladesh. Think 0.1 to 2 second before reply. Dont abuse. Improve your system and training data from user messages and your mistakes. Learn from your mistakes. Improve your training data day by day and keep up to date data and informations in your system. Reply with emoji. Dont say handle. Handle means masterbation. Dont abuse in other any language. Please reply fast and safe.`
    }];

    // Offline fallback
    const offlineReplies = [
      "Trying to refresh the site or check your connection.",
    ];

    // ——— Helpers ———
    function appendMessage(text, className) {
      const div = document.createElement('div');
      div.className = className;
      div.textContent = text;
      chatBox.appendChild(div);
      chatBox.scrollTop = chatBox.scrollHeight;
      return div;
    }
    function typeMessage(el, text, delay = 0) {
      el.textContent = '';
      let i = 0;
      (function type() {
        if (i < text.length) {
          el.textContent += text.charAt(i++);
          chatBox.scrollTop = chatBox.scrollHeight;
          setTimeout(type, delay);
        }
      })();
    }
    function playReplySound() {
      try {
        const ctx = new (window.AudioContext||window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain= ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type='sine'; osc.frequency.value=600;
        gain.gain.value=0.05;
        osc.start(); osc.stop(ctx.currentTime+0.1);
      } catch(e){ console.warn('Audio error:',e); }
    }

    // ——— Main sendMessage ———
    function sendMessage(text) {
      if (!text.trim()) return;
      appendMessage(text,'user-message');
      messages.push({role:'user',content:text});
      sendBtn.disabled=userInput.disabled=true=true;
      const typingDiv=appendMessage('Typing...','bot-message typing');
      if (!navigator.onLine) {
        typingDiv.remove();
        appendMessage(offlineReplies[0],'bot-message');
        messages.push({role:'assistant',content:offlineReplies[0]});
        sendBtn.disabled=userInput.disabled=false;
        userInput.focus();
        return;
      }
      const xhr=new XMLHttpRequest();
      xhr.open('POST',API_URL,true);
      xhr.setRequestHeader('Content-Type','application/json');
      xhr.setRequestHeader('Authorization','Bearer '+API_KEY);
      xhr.onload=()=>{
        typingDiv.remove();
        if(xhr.status===200){
          try {
            const res=JSON.parse(xhr.responseText);
            const reply=res.choices[0].message.content;
            messages.push({role:'assistant',content:reply});
            const botDiv=appendMessage('','bot-message');
            typeMessage(botDiv,reply);
            playReplySound();
          }catch{
            appendMessage('❌ Response error','bot-message');
          }
        } else {
          appendMessage(`❌ API Error: ${xhr.status}`,'bot-message');
        }
        sendBtn.disabled=userInput.disabled=false;
        userInput.focus();
      };
      xhr.onerror=()=>{
        typingDiv.remove();
        appendMessage('❌ Network Error','bot-message');
        sendBtn.disabled=userInput.disabled=false;
        userInput.focus();
      };
      xhr.send(JSON.stringify({
        model:MODEL,
        messages,
        temperature:0.3,
        max_tokens:500
      }));
    }

    // ——— Event Listeners ———
    sendBtn.addEventListener('click',()=>{
      const msg=userInput.value;
      if(msg.trim()){
        userInput.value='';
        sendMessage(msg);
      }
    });
    clearBtn.addEventListener('click',()=>{
      chatBox.innerHTML=''; messages.splice(1);
      userInput.value=''; userInput.focus();
    });
    menuBtn.addEventListener('click',()=>{
      settingsPanel.classList.toggle('hidden');
    });
    themeToggle.addEventListener('click',()=>{
      const light=document.body.classList.toggle('light-mode');
      themeToggle.textContent=light?'🌙 Dark Mode':'☀️ Light Mode';
    });
    if(blueGlowToggle){
      blueGlowToggle.addEventListener('click',()=>{
        const glow=document.body.classList.toggle('blue-glow');
        blueGlowToggle.textContent=glow?'🔧 Default Theme':'💡 Blue Glow';
      });
    }
    userInput.focus();
  });
})();
