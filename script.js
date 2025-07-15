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
let gameStarted = false;
let gameOver = false;
let downInterval = null;
let score = 0;
let seconds = 0;
let timerInterval = null;

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

const downButton = document.getElementById('down');
const scoreBoard = document.getElementById('score-board');
const timerDisplay = document.getElementById('timer');

function updateScore(linesCleared) {
  score += linesCleared * 10;
  scoreBoard.textContent = `${score}`;
}

function startAutoDrop() {
  tick(); // 立即触发一次
  downInterval = setInterval(() => {
    tick();
  }, 100);
}

function stopAutoDrop() {
  clearInterval(downInterval);
  downInterval = null;
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
      timerDisplay.textContent = `${formatTime(seconds)}`;
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
    pauseTimer();
    setControlButtons(false);
    document.getElementById('start-pause').textContent = '重新开始';
    gameStarted = false;
    gameOver = true;  // 标记结束
    return;
  }

  drawShape();
}


function startGame() {
  if (!running) {
    if (!gameStarted) {
      currentPos = { x: 4, y: 0 };
      shapeIndex = Math.floor(Math.random() * shapes.length);
      rotation = 0;
      drawShape();
      gameStarted = true;
    }
    interval = setInterval(() => tick(), 500);
    startTimer();
    running = true;
    setControlButtons(true);
  }
}

function setControlButtons(enabled) {
  const buttons = ['left', 'right', 'rotate', 'down'];
  buttons.forEach(id => {
    document.getElementById(id).disabled = !enabled;
  });
}

function pauseGame() {
  clearInterval(interval);
  interval = null;
  pauseTimer();
  running = false;
  setControlButtons(false); // 禁用按钮
}

function resetGame() {
  // 清除棋盘
  grid.forEach(cell => {
    cell.classList.remove('filled', 'locked');
  });

  score = 0;
  seconds = 0;
  gameOver = false;
  gameStarted = false;
  document.getElementById('score-board').innerHTML = '0';
  document.getElementById('timer').innerHTML = '00:00:00';
  document.getElementById('start-pause').textContent = '暂停';

  startGame();
}

//登录逻辑
document.addEventListener('DOMContentLoaded', () => {
  const loginScreen = document.getElementById('login-screen');
  const gameScreen = document.getElementById('game-screen');
  const usernameInput = document.getElementById('username-input');
  const loginButton = document.getElementById('login-button');
  const loginError = document.getElementById('login-error');

  const usersKey = 'tetris_users';
  const currentUserKey = 'tetris_current_user';

  function getUsers() {
    return JSON.parse(localStorage.getItem(usersKey)) || [];
  }

  function addUser(name) {
    const users = getUsers();
    users.push(name);
    localStorage.setItem(usersKey, JSON.stringify(users));
    localStorage.setItem(currentUserKey, name);
  }

  function isNameTaken(name) {
    return getUsers().includes(name);
  }

  // 准备连接web socket
  const socket = io('https://ts-ke8i.onrender.com');
  let currentUser = null;
  let opponentName = null;
  let roomId = null;
  socket.on('matchFound', (data) => {
    roomId = data.roomId;
    opponentName = data.opponent;

    console.log(`加入房间 ${roomId}，对手：${opponentName}`);

    // 更新自己以及匹配到的玩家信息
    const playerSelfUsername = document.getElementById('player-self-username');
    const playerOpponentUsername = document.getElementById('player-opponent-username');
    playerSelfUsername.innerHTML = `${currentUser}`
    playerOpponentUsername.innerHTML = `${opponentName}`
  });

  function showGameScreen() {
    loginScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    currentUser = localStorage.getItem('tetris_current_user');
    socket.emit('joinQueue', { name: currentUser });
  }

  loginButton.addEventListener('click', () => {
    const name = usernameInput.value.trim();
    if (!name) {
      loginError.textContent = '用户名不能为空';
    } else if (isNameTaken(name)) {
      loginError.textContent = '该用户名已存在，请换一个';
    } else {
      addUser(name);
      showGameScreen();
    }
  });

  // 自动登录
  const savedName = localStorage.getItem(currentUserKey);
  if (savedName) {
    showGameScreen();
  }
});

document.getElementById('start-pause').addEventListener('click', () => {
  if (gameOver) {
    resetGame(); // 重置游戏
    return;
  }
  if (running) {
    pauseGame();
    document.getElementById('start-pause').textContent = '开始';
  } else {
    startGame();
    document.getElementById('start-pause').textContent = '暂停';
  }
});

// 通用长按函数
function attachLongPress(buttonId, actionFn) {
  const btn = document.getElementById(buttonId);
  let interval = null;

  const start = (e) => {
    e.preventDefault();
    if (!running) return;
    actionFn();
    interval = setInterval(actionFn, 100);
  };

  const stop = () => {
    clearInterval(interval);
    interval = null;
  };

  btn.addEventListener("mousedown", start);
  btn.addEventListener("touchstart", start);
  ["mouseup", "mouseleave", "touchend", "touchcancel"].forEach(evt => {
    btn.addEventListener(evt, stop);
  });
}

attachLongPress("left", () => move(-1, 0));
attachLongPress("right", () => move(1, 0));
attachLongPress("rotate", () => rotateShape());
attachLongPress("down", () => tick());
