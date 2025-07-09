// script.js
const container = document.getElementById('game-container');
const grid = [];
const cols = 10;
const rows = 20;
let interval = null;
let running = false;
let currentShape = [];
let currentPos = { x: 4, y: 0 };
let shapeIndex = 0;
let rotation = 0;

const shapes = [
  // I
  [
    [1, 11, 21, 31],
    [10, 11, 12, 13],
    [1, 11, 21, 31],
    [10, 11, 12, 13]
  ],
  // O
  [
    [0, 1, 10, 11],
    [0, 1, 10, 11],
    [0, 1, 10, 11],
    [0, 1, 10, 11]
  ],
  // T
  [
    [1, 10, 11, 12],
    [1, 11, 12, 21],
    [10, 11, 12, 21],
    [1, 10, 11, 21]
  ],
  // L
  [
    [2, 10, 11, 12],
    [1, 11, 21, 22],
    [10, 11, 12, 20],
    [0, 1, 11, 21]
  ],
  // J
  [
    [0, 10, 11, 12],
    [1, 2, 11, 21],
    [10, 11, 12, 22],
    [1, 11, 20, 21]
  ],
  // S
  [
    [1, 2, 10, 11],
    [1, 11, 12, 22],
    [1, 2, 10, 11],
    [1, 11, 12, 22]
  ],
  // Z
  [
    [0, 1, 11, 12],
    [2, 11, 12, 21],
    [0, 1, 11, 12],
    [2, 11, 12, 21]
  ]
];

let score = 0;
const scoreBoard = document.getElementById('score-board');
const timerDisplay = document.getElementById('timer');
let seconds = 0;
let timerInterval = null;

function updateScore(linesCleared) {
  score += linesCleared * 10;
  scoreBoard.textContent = `分数: ${score}`;
}

function formatTime(seconds) {
  const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
}

function startTimer() {
  if (timerInterval === null) {
    timerInterval = setInterval(() => {
      seconds++;
      const timerDisplay = document.getElementById('timer');
      timerDisplay.textContent = `时间: ${formatTime(seconds)}`;
    }, 1000);
  }
}


function pauseTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}


for (let i = 0; i < cols * rows; i++) {
  const cell = document.createElement('div');
  cell.className = 'cell';
  container.appendChild(cell);
  grid.push(cell);
}

function isValid(xOffset, yOffset, newRotation = rotation) {
  const shape = shapes[shapeIndex][newRotation];
  return shape.every(i => {
    const x = (i % cols) + currentPos.x + xOffset;
    const y = Math.floor(i / cols) + currentPos.y + yOffset;
    if (x < 0 || x >= cols || y >= rows) return false;
    const index = y * cols + x;
    return !grid[index] || !grid[index].classList.contains('locked');
  });
}

function drawShape(lock = false) {
  currentShape = shapes[shapeIndex][rotation];
  currentShape.forEach(i => {
    const x = (i % cols) + currentPos.x;
    const y = Math.floor(i / cols) + currentPos.y;
    if (y >= 0 && y < rows)
      grid[y * cols + x].classList.add(lock ? 'locked' : 'filled');
  });
}

function clearShape() {
  currentShape.forEach(i => {
    const x = (i % cols) + currentPos.x;
    const y = Math.floor(i / cols) + currentPos.y;
    if (y >= 0 && y < rows)
      grid[y * cols + x].classList.remove('filled');
  });
}

function move(dx, dy) {
  if (isValid(dx, dy)) {
    clearShape();
    currentPos.x += dx;
    currentPos.y += dy;
    drawShape();
  }
}

function rotateShape() {
  const newRotation = (rotation + 1) % 4;
  if (isValid(0, 0, newRotation)) {
    clearShape();
    rotation = newRotation;
    drawShape();
  }
}

function tick() {
  if (isValid(0, 1)) {
    move(0, 1);
  } else {
    clearShape();
    drawShape(true);
    checkLines();
    spawnNew();
  }
}

function checkLines() {
  let linesCleared = 0;

  for (let y = 0; y < rows; y++) {
    let full = true;
    for (let x = 0; x < cols; x++) {
      if (!grid[y * cols + x].classList.contains('locked')) {
        full = false;
        break;
      }
    }

    if (full) {
      // 清除该行
      for (let x = 0; x < cols; x++) {
        grid[y * cols + x].classList.remove('locked');
      }

      // 下移上方所有已锁定方块
      for (let i = y * cols - 1; i >= 0; i--) {
        if (grid[i].classList.contains('locked')) {
          grid[i].classList.remove('locked');
          grid[i + cols].classList.add('locked');
        }
      }

      linesCleared++;
    }
  }

  if (linesCleared > 0) {
    updateScore(linesCleared);
  }
}


function spawnNew() {
  currentPos = { x: 4, y: 0 };
  shapeIndex = Math.floor(Math.random() * shapes.length);
  rotation = 0;
  if (!isValid(0, 0)) {
    alert('游戏结束');
    pauseGame();
    pauseTimer(); // 停止计时器
    return;
  }
  drawShape();
}

function startGame() {
  if (!running) {
    if (interval === null) {
      currentPos = { x: 4, y: 0 };
      shapeIndex = Math.floor(Math.random() * shapes.length);
      rotation = 0;
      drawShape();
    }
    interval = setInterval(() => tick(), 500);
    startTimer();  // 安全地启动
    running = true;
  }
}


function pauseGame() {
  clearInterval(interval);
  interval = null;
  pauseTimer(); // 暂停计时器
  running = false;
}


document.getElementById('start-pause').addEventListener('click', () => {
  if (running) {
    pauseGame();
    document.getElementById('start-pause').textContent = '开始';
  } else {
    startGame();
    document.getElementById('start-pause').textContent = '暂停';
  }
});
document.getElementById('left').addEventListener('click', () => move(-1, 0));
document.getElementById('right').addEventListener('click', () => move(1, 0));
document.getElementById('rotate').addEventListener('click', () => rotateShape());
document.getElementById('down').addEventListener('click', () => tick());
