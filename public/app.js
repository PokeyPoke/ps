const socket = io();
const app = document.getElementById('app');
let data = [];

const COOLDOWN_MIN=10000, COOLDOWN_MAX=20000, ACTIVE=2500;

socket.on('snapshot', payload=>{
  data=payload; render();
});
socket.on('update', ({candidateId,field})=>{
  const span=document.getElementById(`${field}-${candidateId}`);
  if(span) span.textContent=parseInt(span.textContent)+1;
});

function render(){
  app.innerHTML='';
  data.forEach(c=>{
    const card=document.createElement('div');
    card.className='card';
    card.innerHTML=`
      <h2>${c.name} <small>(${c.party})</small></h2>
      <p class="metric">Votes: <span id="votes-${c.id}">${c.votes}</span></p>
      <p class="metric">Clicks: <span id="clicks-${c.id}">${c.clicks}</span></p>
      <p class="metric">Search Interest: <span id="trends-${c.id}">${c.trends}</span></p>
      <p class="metric">News (24h): <span id="news-${c.id}">${c.news}</span></p>
      <p class="metric">Social (24h): <span id="social-${c.id}">${c.social}</span></p>
      <button class="vote-btn" id="vote-${c.id}">Vote today</button>
      <button class="click-btn" id="click-${c.id}">Click!</button>
    `;
    app.appendChild(card);
    const vBtn=document.getElementById(`vote-${c.id}`);
    vBtn.onclick=()=>doVote(c.id,vBtn);
    setupClick(`click-${c.id}`,c.id);
  });
}

function doVote(id,btn){
  if(btn.disabled) return;
  socket.emit('vote',{candidateId:id});
  btn.disabled=true; btn.textContent='Voted ✓';
  setTimeout(()=>{btn.disabled=false;btn.textContent='Vote today';},86400000);
}

function setupClick(btnId,candidateId){
  const btn=document.getElementById(btnId);
  let ready=false;
  const loop=()=>{
    const wait=Math.random()*(COOLDOWN_MAX-COOLDOWN_MIN)+COOLDOWN_MIN;
    setTimeout(()=>{ready=true;btn.disabled=false;
      setTimeout(()=>{ready=false;btn.disabled=true;loop();},ACTIVE);
    },wait);
  };
  loop();
  btn.onclick=()=>{if(ready){socket.emit('click',{candidateId});}};
}
