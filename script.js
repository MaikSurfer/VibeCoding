const puzzleData = {
  grid: [
    "JAVA#####",
    "###TUNDRA",
    "##ALPINE#",
    "SAVANNA##",
    "##ANDEAN#",
    "###TIBET#",
    "MANILA###",
    "GLACIER##",
  ],
  masterColumn: 3,
  masterName: "ATLANTIC",
  timerSeconds: 300,
  clues: [
    { number: 1, answer: "JAVA", clue: "Indonesian island famed for its coffee and volcanoes." },
    { number: 2, answer: "TUNDRA", clue: "Treeless Arctic biome of permafrost and hardy shrubs." },
    { number: 3, answer: "ALPINE", clue: "High-mountain climate zone whose name comes from the European range." },
    { number: 4, answer: "SAVANNA", clue: "Tropical grassland dotted with acacias and seasonal rains." },
    { number: 5, answer: "ANDEAN", clue: "Relating to the longest continental mountain range in South America." },
    { number: 6, answer: "TIBET", clue: "Plateau region on the northern side of the Himalayas." },
    { number: 7, answer: "MANILA", clue: "Capital city on the island of Luzon in the Philippines." },
    { number: 8, answer: "GLACIER", clue: "Slow-moving river of ice sculpting valleys and fjords." },
  ],
};

const gridElement = document.getElementById("puzzle-grid");
const cluesList = document.getElementById("across-list");
const masterDisplay = document.getElementById("master-display");
const timerDisplay = document.getElementById("timer-display");
const timerToggleBtn = document.getElementById("timer-toggle");
const timerResetBtn = document.getElementById("timer-reset");
const checkBtn = document.getElementById("check-btn");
const clearBtn = document.getElementById("clear-btn");
const feedback = document.getElementById("feedback");

const inputs = [];
const cellMap = [];

function buildGrid() {
  const cols = puzzleData.grid[0].length;
  gridElement.style.setProperty("--cols", cols);

  puzzleData.grid.forEach((rowString, rowIndex) => {
    const row = [];
    [...rowString].forEach((char, colIndex) => {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.setAttribute("role", "gridcell");
      cell.dataset.row = rowIndex;
      cell.dataset.col = colIndex;

      if (colIndex === puzzleData.masterColumn && char !== "#") {
        cell.classList.add("master");
      }

      if (char === "#") {
        cell.classList.add("block");
        cell.setAttribute("aria-hidden", "true");
        gridElement.appendChild(cell);
        row.push(null);
        return;
      }

      const input = document.createElement("input");
      input.type = "text";
      input.maxLength = 1;
      input.autocomplete = "off";
      input.dataset.solution = char;
      input.dataset.row = rowIndex;
      input.dataset.col = colIndex;
      cell.appendChild(input);
      inputs.push(input);

      input.addEventListener("input", (event) => {
        const value = event.target.value.toUpperCase();
        event.target.value = value.replace(/[^A-Z]/g, "");
        event.target.parentElement.classList.remove("incorrect", "correct");
        updateMasterDisplay();
        moveToNextCell(event.target, value);
      });

      input.addEventListener("focus", () => {
        feedback.textContent = "";
        feedback.classList.remove("success", "error");
      });

      gridElement.appendChild(cell);
      row.push(input);
    });
    cellMap.push(row);
  });
}

function renderClues() {
  puzzleData.clues.forEach((entry) => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `<strong>${entry.number}.</strong> ${entry.clue} <span class="length">(${entry.answer.length})</span>`;
    cluesList.appendChild(listItem);
  });
}

function moveToNextCell(currentInput, value) {
  if (!value) return;
  const row = Number(currentInput.dataset.row);
  const col = Number(currentInput.dataset.col);
  // move right until find next input on same row
  for (let nextCol = col + 1; nextCol < cellMap[row].length; nextCol += 1) {
    const nextCell = cellMap[row][nextCol];
    if (nextCell) {
      nextCell.focus();
      break;
    }
  }
}

function updateMasterDisplay() {
  const letters = puzzleData.grid.map((rowString, rowIndex) => {
    const input = cellMap[rowIndex][puzzleData.masterColumn];
    if (!input) return "_";
    return input.value ? input.value.toUpperCase() : "_";
  });
  masterDisplay.textContent = letters.join(" ");
}

function checkAnswers() {
  let allCorrect = true;
  inputs.forEach((input) => {
    const expected = input.dataset.solution;
    const value = input.value.toUpperCase();
    const parent = input.parentElement;
    parent.classList.remove("correct", "incorrect");

    if (!value) {
      allCorrect = false;
      return;
    }

    if (value === expected) {
      parent.classList.add("correct");
    } else {
      parent.classList.add("incorrect");
      allCorrect = false;
    }
  });

  if (allCorrect) {
    feedback.textContent = `Great work! You uncovered the master keyword: ${puzzleData.masterName}.`;
    feedback.classList.remove("error");
    feedback.classList.add("success");
    pauseTimer();
  } else {
    feedback.textContent = "Keep going! Highlighted letters show which squares need attention.";
    feedback.classList.remove("success");
    feedback.classList.add("error");
  }
}

function clearIncorrectLetters() {
  inputs.forEach((input) => {
    const expected = input.dataset.solution;
    if (input.value.toUpperCase() !== expected) {
      input.value = "";
    }
    input.parentElement.classList.remove("correct", "incorrect");
  });
  updateMasterDisplay();
  feedback.textContent = "Incorrect letters cleared. Try those spots again!";
  feedback.classList.remove("success");
  feedback.classList.add("error");
}

let timerInterval = null;
let remainingSeconds = puzzleData.timerSeconds;
let timerActive = false;

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function updateTimerDisplay() {
  timerDisplay.textContent = formatTime(remainingSeconds);
}

function tick() {
  if (remainingSeconds > 0) {
    remainingSeconds -= 1;
    updateTimerDisplay();
    if (remainingSeconds === 0) {
      feedback.textContent = "Time's up! Check your answers or reset the clock for another try.";
      feedback.classList.remove("success");
      feedback.classList.add("error");
      pauseTimer();
    }
  }
}

function startTimer() {
  if (timerActive) return;
  timerInterval = setInterval(tick, 1000);
  timerActive = true;
  timerToggleBtn.textContent = "Pause";
}

function pauseTimer() {
  if (!timerActive) return;
  clearInterval(timerInterval);
  timerInterval = null;
  timerActive = false;
  timerToggleBtn.textContent = "Start";
}

function toggleTimer() {
  if (timerActive) {
    pauseTimer();
  } else {
    startTimer();
  }
}

function resetTimer() {
  pauseTimer();
  remainingSeconds = puzzleData.timerSeconds;
  updateTimerDisplay();
}

function init() {
  buildGrid();
  renderClues();
  updateMasterDisplay();
  updateTimerDisplay();

  timerToggleBtn.addEventListener("click", toggleTimer);
  timerResetBtn.addEventListener("click", () => {
    resetTimer();
    feedback.textContent = "Timer reset. Ready when you are!";
    feedback.classList.remove("success");
    feedback.classList.add("error");
  });
  checkBtn.addEventListener("click", checkAnswers);
  clearBtn.addEventListener("click", clearIncorrectLetters);
}

init();
