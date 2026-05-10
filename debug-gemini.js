const fs = require('fs');
const env = fs.readFileSync('.env','utf8');
const key = env.split(/\r?\n/).find((l)=>l.startsWith('NETLIFY_GEMINI_API_KEY='))?.split('=')[1];
console.log('KEY', !!key);
const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key='+key;
const body = {
  contents:[{ role:'user', parts:[{ text: 'hello' }] }],
  generationConfig:{ temperature:0.2, responseMimeType:'application/json' },
};
(async ()=>{
  const res = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
  console.log('STATUS='+res.status);
  console.log(await res.text());
})();
