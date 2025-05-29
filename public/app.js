const socket = io();
const app = document.getElementById('app');
let candidates = [];
const COOLDOWN_MIN = 10000; // 10s
const COOLDOWN_MAX = 20000; // 20s
const ACTIVE_WINDOW = 2500; // 2.5s

function render() {
  app.innerHTML = '';
  candidates.forEach(c => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h2>${c.name} <small>(${c.party})</small></h2>
      <p class="metric">Votes: <span id="votes-${c.id}">${c.votes}</span></p>
      <p class="metric">Clicks: <span id="clicks-${c.id}">${c.clicks}</span></p>
      <p class="metric">Search Interest: <span id="trend-${c.id}">${c.trends}</span></p>
      <p class="metric">News (24h): <span id="news-${c.id}">${c.news}</span></p>
      <p class="metric">Social (24h): <span id="social-${c.id}">${c.social}</span></p>
      <button class="vote-btn" id="vote-${c.id}">Vote today</button>
      <button class="click-btn" id="click-${c.id}">Click!</button>
    `;
    app.appendChild(card);

    document.getElementById(`vote-${c.id}`).onclick = () => vote(c.id);
    setupClickButton(c.id);
  });
}

socket.on('snapshot', data => {
  candidates = data;
  render();
});

socket.on('update', ({ candidateId, field }) => {
  const span = document.getElementById(\`\${field}-\${candidateId}\`);
  if (span) {
    span.textContent = parseInt(span.textContent) + 1;
  }
});

function vote(id) {
  const btn = document.getElementById(`vote-${id}`);
  if (btn.disabled) return;
  socket.emit('vote', { candidateId: id });
  btn.disabled = true;
  btn.textContent = 'Voted ✓';
  // unlock next day
  setTimeout(() => {
    btn.disabled = false;
    btn.textContent = 'Vote today';
  }, 24 * 60 * 60 * 1000);
}

function setupClickButton(id) {
  const btn = document.getElementById(`click-${id}`);
  let cooldown = false;
  const cycle = () => {
    cooldown = true;
    btn.disabled = true;
    const wait = Math.random() * (COOLDOWN_MAX - COOLDOWN_MIN) + COOLDOWN_MIN;
    setTimeout(() => {
      cooldown = false;
      btn.disabled = false;
      // active window
      setTimeout(() => {
        cooldown = true;
        btn.disabled = true;
        setTimeout(cycle, 0); // start next cycle
      }, ACTIVE_WINDOW);
    }, wait);
  };
  cycle();
  btn.onclick = () => {
    if (!cooldown) {
      socket.emit('click', { candidateId: id });
    }
  };
}
