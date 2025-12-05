const emojis = [
  "🐱", "🐶", "🐻", "🦊", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷",
  "🐵", "🐸", "🐔", "🐙", "🐳", "🦄", "🐝", "🦋", "🌸", "🍀"
];

const totalPairs = emojis.length;
const gameEl = document.getElementById("game");
const timerEl = document.getElementById("timer");
const resetBtn = document.getElementById("reset");
const leaderboardEl = document.getElementById("leaderboard");
const cardTemplate = document.getElementById("card-template");

let board = [];
let firstCard = null;
let secondCard = null;
let matchesFound = 0;
let timerInterval = null;
let startTime = null;
const storageKey = "memory-master-top10";

const formatTime = (elapsedMs) => {
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const shuffle = (items) => {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
};

const startTimer = () => {
  if (timerInterval) return;
  startTime = Date.now();
  timerInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    timerEl.textContent = formatTime(elapsed);
  }, 250);
};

const renderLeaderboard = () => {
  const scores = getLeaderboard();
  leaderboardEl.innerHTML = "";

  if (!scores.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No masters yet. Finish a game to claim your spot!";
    leaderboardEl.appendChild(empty);
    return;
  }

  scores.slice(0, 10).forEach((score) => {
    const li = document.createElement("li");
    li.textContent = score.time;
    leaderboardEl.appendChild(li);
  });
};

const getLeaderboard = () => {
  try {
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.error("Failed to read leaderboard", err);
    return [];
  }
};

const updateLeaderboard = (elapsedMs) => {
  const scores = getLeaderboard();
  scores.push({ timeMs: elapsedMs, time: formatTime(elapsedMs) });
  scores.sort((a, b) => a.timeMs - b.timeMs);
  const trimmed = scores.slice(0, 10);
  localStorage.setItem(storageKey, JSON.stringify(trimmed));
  renderLeaderboard();
};

const resetSelection = () => {
  firstCard = null;
  secondCard = null;
};

const disableBoard = (disabled) => {
  board.forEach((card) => {
    card.button.disabled = disabled || card.matched;
  });
};

const checkForMatch = () => {
  if (!firstCard || !secondCard) return;
  const isMatch = firstCard.symbol === secondCard.symbol;

  if (isMatch) {
    firstCard.matched = true;
    secondCard.matched = true;
    firstCard.button.classList.add("matched");
    secondCard.button.classList.add("matched");
    matchesFound += 1;
    resetSelection();

    if (matchesFound === totalPairs) {
      const elapsed = Date.now() - startTime;
      stopTimer();
      updateLeaderboard(elapsed);
      setTimeout(() => alert(`You are a Memory Master! Time: ${formatTime(elapsed)}`), 300);
    }
    return;
  }

  disableBoard(true);
  setTimeout(() => {
    firstCard.button.classList.remove("flipped");
    secondCard.button.classList.remove("flipped");
    disableBoard(false);
    resetSelection();
  }, 850);
};

const handleCardClick = (card) => {
  if (card.matched || card === firstCard || card === secondCard) return;
  card.button.classList.add("flipped");

  if (!firstCard) {
    firstCard = card;
    startTimer();
    return;
  }

  if (!secondCard) {
    secondCard = card;
    checkForMatch();
  }
};

const buildCard = (symbol) => {
  const clone = cardTemplate.content.firstElementChild.cloneNode(true);
  const front = clone.querySelector(".card-front");
  front.textContent = symbol;

  const card = { symbol, matched: false, button: clone };

  clone.addEventListener("click", () => handleCardClick(card));
  return card;
};

const setupBoard = () => {
  board = [];
  gameEl.innerHTML = "";
  timerEl.textContent = "00:00";
  matchesFound = 0;
  resetSelection();
  stopTimer();

  const deck = shuffle([...emojis, ...emojis]);
  deck.forEach((symbol) => {
    const card = buildCard(symbol);
    board.push(card);
    gameEl.appendChild(card.button);
  });
};

resetBtn.addEventListener("click", setupBoard);
renderLeaderboard();
setupBoard();
