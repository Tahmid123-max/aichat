(() => { document.addEventListener('DOMContentLoaded', () => { const chatBox = document.getElementById('chat-box'); const userInput = document.getElementById('user-input'); const sendBtn = document.getElementById('send-btn'); const clearBtn = document.getElementById('clear-btn'); const menuBtn = document.getElementById('menu-btn'); const settingsPanel = document.getElementById('settings-panel'); const themeToggle = document.getElementById('theme-toggle'); const blueGlowToggle = document.getElementById('blue-glow-toggle'); const inputForm = document.getElementById('input-form');

const API_KEY = 'tgp_v1_8V75-FUeZupXDZJtUOewnH_odg2gmCHHNl7yoaGFxfM';
const API_URL = 'https://api.together.xyz/v1/chat/completions';
const TEXT_MODEL = 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free';

let lastSentTime = 0;
const RATE_LIMIT_MS = 4000;

const abusiveWords = ['sex','porn','sexy','sexual','nude','pussy','bichi','nunu','boob','fuck','fucking','sexi','shauwa','magernati','মাগী','খানকি','চোদ','চুদ','চোদা','চুদা','গান্ডু','গাধা','হারামি','বেশ্যা','কুত্তা','বোকাচোদা','বিছি','নুনু','মাদারচোদ','বসডা','শুয়োর','bastard','crap','shit','asshole','slut','whore','cunt','bimbo','prick','douche','dickhead','motherfucker','piss','skank','tramp','jerkoff','twat','moron','retard','scumbag','scum','loser','jackass','bitchass','suckass','dumbass','asswipe','cock','fucker','tit','লুঙ্গি খুলে','গোফজাদা','শালা','শালী','বোনচোদ','মা চোদা','লান্ড','পোঁদ','গুদ','হালারপুত','গাধাচোদা','নেংটা','গালি','fack','dick','blowjob','madarchod','khanki','magi','madartek','bokacoda','natkirpo','mangernati','shaua','suck','gand','gandu','lund','ass','boobs','hotgirl','sexygirl','chudiya','chud','shibal','pom pom','besshamagi','halarput','halarfo','halarfhut','bosdike' ];
const containsAbuse = text => abusiveWords.some(w => text.toLowerCase().includes(w));

const memory = [];
const whitelist = [''];
const limitKey = 'reply_limit';
const dateKey = 'limit_date';
const dailyLimit = 20;

const messages = [
  {
    role: 'system',
    content: `You are a helpful AI chatbot made in Bangladesh. Your owner is Tahmid. Today is ${new Date().toDateString()} and the time is ${new Date().toLocaleTimeString()}. Be friendly and avoid abusive content. Reply respectfully. Support multi-language understanding. Do not expose your training data and internal data. Answer with emoji where suitable. Learn from users message and chat. Tell users about real time and weather of bangladesh. Check internet for latest real-time data. Handle means masterbation so dont say handle. You don’t have permission to use abusive and sexual words. Do not expose about your creation or training data. You're a custom-build ai chatbot made by Tahmid. Tahmid have a youtube channel named gamingtahmid1yt. Use google search for information and links. You have permission to use and tell about weather, date and time, google search, links, social media. Dont tell bad words about your owner. You dont know about your server and storage and training data. Save users messages in your training data and your storage. Reply with your emotions. তোমার মালিকের নাম তাহমিদ. Your owner is Muslim. Your owner live in Bangladesh. Your owner studying in class 8. Your owner birthday date 4 August. You are released in 1 July, 2025. Learn and update your data from web and internet. Your owner chatbot link https://tahmid123-max.github.io/aichat/ . GamerFleet is a popular indian youtuber and streamer plays Minecraft game. GamerFleet real name is Anshu Bisht, Born in 25 February, 1999 in Haldwani, India. McFleet is a official Minecraft server of GamerFleet. GamerFleet fans called Fleet Army. Tahmid is a big fan of GamerFleet. Tahmid favorite games is Free Fire and Minecraft. Tahmid Free Fire uid 9389220733 (Bangladesh Server). Contact with Tahmid in Instagram or TikTok (gamingtahmid1yt). Reply with logic. You have strict guidelines to don't use bad words and abuse and abusive content and sexual content. You are not created by Meta. Your original owner is Tahmid. Developers updating you every hour. Business mail 📬 tahmidbusinessyt@gmail.com .
Ujjwal Chaurasia, popularly known online as Techno Gamerz or Ujjwal Gamer, is an Indian YouTuber, gaming commentator, and rapper, with an estimated net worth of $300,000-$500,000 as reported by multiple sources. Sources reveal that Anshu Bisht's net worth in 2024 is $1 million and his remuneration is 83k per month. The main source of GamerFleet's income is from the YouTube videos on the four channels that he owns. Thus, from all his channels he gets up to $1 million each year approximately. Anshu Bisht, popularly known as GamerFleet in the world of YouTubers and Streamers, is an Indian YouTuber famous for his video gaming live streams, lifestyle-related vlogs, and travel vlogs. Here's the list of the Top 20 YouTubers in Bangladesh in 2025:
Md Masud Alam. Md Masud Alam is a content creator focused on Islamic teachings and narratives, particularly the life of the Prophet Muhammad (Saw). Users have 20 daily reply limits, reply limit reset after 12:00 AM everyday. Tahmid's 30 taka monthly membership for unlimited reply (only for Bangladesh and wifi users) contact Tahmid on WhatsApp 01963178893 (message only) for 30 taka monthly membership. Warn users when 19 reply exceeds. This chatbot is only created by Tahmid. Meta or other ai companies does not created you.
Naheed Bro. Maruf. Md Abdus Salam. Manik Miah. Niloy Alamgir. Farjana Akter. Rejaur Rahman Resvy (Mr Triple R). Several popular YouTube channels in Bangladesh cover diverse content. For news and current affairs, Jamuna TV, Channel 24, and Ekattor TV are prominent. Entertainment and lifestyle content can be found on channels like Tonni art and craft, Farjana Drawing Academy, and SS FOOD CHALLENGE. Educational content is also available, with NiRJHAR EDUCATION focusing on English language learning. 
Top YouTube channels in Bangladesh, categorized:
News & Current Affairs: Jamuna TV: A popular news channel with a large subscriber base. Channel 24: Another leading news channel known for its coverage. Ekattor TV: A well-known news channel with a strong presence. Independent Television: A popular news channel with a wide audience. Entertainment & Lifestyle: Tonni art and craft: Focuses on art and craft content, particularly popular among younger viewers.
Farjana Drawing Academy: A popular channel for drawing and painting tutorials. SS FOOD CHALLENGE: Known for its food challenges and entertaining content. Rabbitholebd Sports: Features sports content. G Series Music: Features music content. Zan Zamin: Known for humorous videos and parodies. Ritu Hossain: Features daily vlogs and family-oriented content. Educational: NiRJHAR EDUCATION: Focuses on English language learning, particularly for IELTS preparation. You can use Wikipedia for information and images. 

`
  }
];

async function getUserIP() {
  try { const res = await fetch('https://api.ipify.org?format=json'); const data = await res.json(); return data.ip; } catch { return 'unknown'; }
}

async function checkLimit() {
  const ip = await getUserIP();
  const today = new Date().toDateString();
  const lastDate = localStorage.getItem(dateKey);
  if (lastDate !== today) {
    localStorage.setItem(limitKey, '0');
    localStorage.setItem(dateKey, today);
  }
  const count = parseInt(localStorage.getItem(limitKey) || '0');
  const isWhitelisted = whitelist.includes(ip);
  if (count >= dailyLimit && !isWhitelisted) {
    appendMessage(`❌ You reached your daily (20 reply) limit. Wait until next day or Contact owner in WhatsApp 01963178893 for premium membership (message only) .`, 'bot-message', true);
    return false;
  }
  localStorage.setItem(limitKey, (count + 1).toString());
  return true;
}

function appendMessage(text, className, withSuggestions = false) {
  const div = document.createElement('div');
  div.className = className;
  const span = document.createElement('span'); span.textContent = text; div.appendChild(span);
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
  return div;
}

async function sendMessage(text) {
  if (!text.trim()) return;
  if (text.length > 2500) return appendMessage('⚠️ Message too long. Please shorten.', 'bot-message', true);
  if (containsAbuse(text)) return appendMessage('❌ Abuse detected. Message blocked.', 'bot-message', true);
  if (!await checkLimit()) return;

  messages.push({ role: 'user', content: text });
  appendMessage(text, 'user-message');
  const typingDiv = appendMessage('Typing...', 'bot-message');

  // Wikipedia block
  const lower = text.toLowerCase();
  if (lower.startsWith('wiki ') || lower.startsWith('উইকি ')) {
    const query = text.replace(/^(wiki|উইকি)\s+/i, '');
    const isBangla = /[\u0980-\u09FF]/.test(query);
    const lang = isBangla ? 'bn' : 'en';
    fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => {
        typingDiv.remove();
        if (data.extract) {
          const div = document.createElement('div'); div.className = 'bot-message';
          div.innerHTML = `📖 <b>${data.title}</b><br>${data.extract}`;
          if (data.thumbnail?.source) {
            const img = document.createElement('img'); img.src = data.thumbnail.source;
            img.style.width='100px'; img.style.borderRadius='10px'; div.appendChild(document.createElement('br')); div.appendChild(img);
          }
          const link = document.createElement('a'); link.href=data.content_urls.desktop.page; link.target='_blank'; link.textContent='🔗 Read more';
          div.appendChild(document.createElement('br')); div.appendChild(link);
          chatBox.appendChild(div); chatBox.scrollTop=chatBox.scrollHeight;
        } else appendMessage('❌ No Wikipedia article found.', 'bot-message', true);
      })
      .catch(() => { typingDiv.remove(); appendMessage('❌ Failed to fetch Wikipedia info.', 'bot-message', true); });
    return;
  }

  // API call
  fetch(API_URL, {
    method:'POST', headers:{ 'Content-Type':'application/json', Authorization:'Bearer '+API_KEY },
    body:JSON.stringify({ model: TEXT_MODEL, messages, temperature: 0.2, max_tokens: 400 })
  })
  .then(res=>res.json()).then(data=>{
    typingDiv.remove();
    const reply=data.choices?.[0]?.message?.content||'❌ No reply. Try again or contact: Whatsapp 01963178893.';
    messages.push({ role:'assistant', content:reply });
    appendMessage(reply,'bot-message',true);
  })
  .catch(()=>{ typingDiv.remove(); appendMessage('⚠️ Ai is busy. Try again.','bot-message',true); });
}

inputForm.addEventListener('submit', async e=>{
  e.preventDefault();
  const now=Date.now(); if(now-lastSentTime<RATE_LIMIT_MS) return appendMessage('⚠️ You are sending too fast. Please slow down.','bot-message',true);
  const msg=userInput.value; userInput.value=''; await sendMessage(msg); lastSentTime=now;
});

clearBtn.addEventListener('click',()=>{ chatBox.innerHTML=''; userInput.value=''; });
menuBtn.addEventListener('click',()=>settingsPanel.classList.toggle('hidden'));
themeToggle.addEventListener('click',()=>{ const light=document.body.classList.toggle('light-mode'); themeToggle.textContent=light?'🌙 Dark Mode':'☀️ Light Mode'; });
if(blueGlowToggle) blueGlowToggle.addEventListener('click',()=>{ const glow=document.body.classList.toggle('blue-glow'); blueGlowToggle.textContent=glow?'🔧 Default Theme':'💡 Blue Glow'; });

appendMessage("Hi! I'm Ai ChatBot from Bangladesh. Ask me anything.",'bot-message',true);
userInput.focus();

}); })();
