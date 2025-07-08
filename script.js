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
  [ // T 形 4 个旋转状态
    [1, 10, 11, 12], // ┴ 竖中柱
    [1, 11, 12, 21], // ┤ 向右
    [10, 11, 12, 21], // ┬ 向下
    [1, 10, 11, 21]  // ├ 向左
  ]
];

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
  for (let y = 0; y < rows; y++) {
    let full = true;
    for (let x = 0; x < cols; x++) {
      if (!grid[y * cols + x].classList.contains('locked')) {
        full = false;
        break;
      }
    }
    if (full) {
      for (let x = 0; x < cols; x++) {
        grid[y * cols + x].classList.remove('locked');
      }
      for (let i = y * cols - 1; i >= 0; i--) {
        if (grid[i].classList.contains('locked')) {
          grid[i].classList.remove('locked');
          grid[i + cols].classList.add('locked');
        }
      }
    }
  }
}

function spawnNew() {
  currentPos = { x: 4, y: 0 };
  rotation = 0;
  if (!isValid(0, 0)) {
    alert('游戏结束');
    pauseGame();
    return;
  }
  drawShape();
}

function startGame() {
  if (!running) {
    currentPos = { x: 4, y: 0 };
    shapeIndex = 0;
    rotation = 0;
    drawShape();
    interval = setInterval(() => {
      tick();
    }, 500);
    running = true;
  }
}

function pauseGame() {
  clearInterval(interval);
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
