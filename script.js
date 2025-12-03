const grid = document.getElementById('grid');
const timerEl = document.getElementById('timer');
const movesEl = document.getElementById('moves');
const resetBtn = document.getElementById('reset');
const overlay = document.getElementById('overlay');
const finalTimeEl = document.getElementById('final-time');
const finalMovesEl = document.getElementById('final-moves');
const playerNameInput = document.getElementById('player-name');
const saveScoreBtn = document.getElementById('save-score');
const closeDialogBtn = document.getElementById('close-dialog');
const scoreList = document.getElementById('score-list');

const CARD_EMOJIS = [
  '😀', '🐱', '🐶', '🦊', '🦁', '🐼', '🐸', '🐵', '🐨', '🐷',
  '🐔', '🦄', '🐝', '🐙', '🦋', '🦖', '🐢', '🦩', '🌵', '🌸'
];
const CHAMPION = 'Memory Master';
const STORAGE_KEY = 'memory-master-scores';

let deck = [];
let flipped = [];
let matchedCount = 0;
let moves = 0;
let timer = 0;
let timerInterval = null;
let timerRunning = false;

function shuffle(array) {
  const clone = [...array];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}

function formatTime(seconds) {
  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  return `${mins}:${secs}`;
}

function buildDeck() {
  deck = shuffle([...CARD_EMOJIS, ...CARD_EMOJIS]).map((emoji, index) => ({
    id: index,
    emoji,
    matched: false,
  }));
}

function createCard(cardData) {
  const template = document.getElementById('card-template');
  const card = template.content.firstElementChild.cloneNode(true);
  card.dataset.id = cardData.id;
  card.querySelector('.card-back').textContent = cardData.emoji;
  card.addEventListener('click', () => handleFlip(card));
  return card;
}

function renderBoard() {
  grid.innerHTML = '';
  deck.forEach((cardData) => {
    const card = createCard(cardData);
    grid.appendChild(card);
  });
}

function resetState() {
  flipped = [];
  matchedCount = 0;
  moves = 0;
  timer = 0;
  timerRunning = false;
  movesEl.textContent = '0';
  timerEl.textContent = '00:00';
  stopTimer();
}

function startTimer() {
  if (timerRunning) return;
  timerRunning = true;
  timerInterval = setInterval(() => {
    timer += 1;
    timerEl.textContent = formatTime(timer);
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  timerRunning = false;
}

function handleFlip(cardEl) {
  const id = Number(cardEl.dataset.id);
  const cardData = deck[id];
  if (cardData.matched || flipped.includes(id) || flipped.length === 2) return;

  if (!timerRunning) startTimer();

  flipped.push(id);
  cardEl.classList.add('flipped');

  if (flipped.length === 2) {
    moves += 1;
    movesEl.textContent = String(moves);
    checkMatch();
  }
}

function cardElementById(id) {
  return grid.querySelector(`[data-id="${id}"]`);
}

function checkMatch() {
  const [firstId, secondId] = flipped;
  const first = deck[firstId];
  const second = deck[secondId];

  if (first.emoji === second.emoji) {
    first.matched = true;
    second.matched = true;
    matchedCount += 2;
    markMatched(firstId, secondId);
    flipped = [];
    if (matchedCount === deck.length) handleWin();
  } else {
    setTimeout(() => {
      flipped.forEach((id) => cardElementById(id).classList.remove('flipped'));
      flipped = [];
    }, 900);
  }
}

function markMatched(...ids) {
  ids.forEach((id) => cardElementById(id).classList.add('matched'));
}

function handleWin() {
  stopTimer();
  finalTimeEl.textContent = formatTime(timer);
  finalMovesEl.textContent = moves;
  overlay.classList.remove('hidden');
  playerNameInput.focus();
}

function loadScores() {
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const hasChampion = stored.some((entry) => entry.name === CHAMPION);
  if (!hasChampion) {
    stored.unshift({ name: CHAMPION, time: 75, date: 'Champion' });
  }
  return stored;
}

function saveScores(scores) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
}

function renderScores() {
  const scores = loadScores().slice();
  scores.sort((a, b) => {
    if (a.name === CHAMPION) return -1;
    if (b.name === CHAMPION) return 1;
    return a.time - b.time;
  });
  const topScores = scores.slice(0, 8);

  scoreList.innerHTML = '';
  topScores.forEach((score, index) => {
    const row = document.createElement('li');
    row.className = `score-row${score.name === CHAMPION ? ' champion' : ''}`;
    row.innerHTML = `
      <span>#${index + 1}</span>
      <span class="name">${score.name}</span>
      <span class="tag">${score.date || 'Today'}</span>
      <strong>${formatTime(score.time)}</strong>
    `;
    scoreList.appendChild(row);
  });
}

function handleSaveScore() {
  const name = playerNameInput.value.trim() || CHAMPION;
  const entry = {
    name,
    time: timer,
    date: new Date().toLocaleDateString(),
  };
  const scores = loadScores();
  scores.push(entry);
  saveScores(scores);
  renderScores();
  overlay.classList.add('hidden');
  startNewGame();
}

function startNewGame() {
  resetState();
  buildDeck();
  renderBoard();
}

resetBtn.addEventListener('click', () => {
  overlay.classList.add('hidden');
  startNewGame();
});

saveScoreBtn.addEventListener('click', handleSaveScore);
closeDialogBtn.addEventListener('click', () => overlay.classList.add('hidden'));
overlay.addEventListener('click', (event) => {
  if (event.target === overlay) overlay.classList.add('hidden');
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') overlay.classList.add('hidden');
});

startNewGame();
renderScores();
