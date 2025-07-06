document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector("#grid");
  const scoreDisplay = document.querySelector("#score");
  const startBtn = document.querySelector("#start-button");
  const leftBtn = document.getElementById("left-btn");
  const rightBtn = document.getElementById("right-btn");
  const rotateBtn = document.getElementById("rotate-btn");
  const downBtn = document.getElementById("down-btn");

  const width = 10;
  let squares = [];
  for (let i = 0; i < 200; i++) {
    const div = document.createElement("div");
    div.classList.add("square");
    grid.appendChild(div);
    squares.push(div);
  }

  let timerId = null;
  let score = 0;
  let currentPosition = 4;
  let currentRotation = 0;

  const lTetromino = [
    [1, width + 1, width * 2 + 1, 2],
    [width, width + 1, width + 2, width * 2 + 2],
    [1, width + 1, width * 2 + 1, width * 2],
    [width, width * 2, width * 2 + 1, width * 2 + 2],
  ];

  const zTetromino = [
    [0, width, width + 1, width * 2 + 1],
    [width + 1, width + 2, width * 2, width * 2 + 1],
    [0, width, width + 1, width * 2 + 1],
    [width + 1, width + 2, width * 2, width * 2 + 1],
  ];

  const tTetromino = [
    [1, width, width + 1, width + 2],
    [1, width + 1, width + 2, width * 2 + 1],
    [width, width + 1, width + 2, width * 2 + 1],
    [1, width, width + 1, width * 2 + 1],
  ];

  const oTetromino = [
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
  ];

  const iTetromino = [
    [1, width + 1, width * 2 + 1, width * 3 + 1],
    [width, width + 1, width + 2, width + 3],
    [1, width + 1, width * 2 + 1, width * 3 + 1],
    [width, width + 1, width + 2, width + 3],
  ];

  const tetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino];

  let random = Math.floor(Math.random() * tetrominoes.length);
  let current = tetrominoes[random][currentRotation];

  function draw() {
    current.forEach(index => {
      const target = currentPosition + index;
      if (squares[target]) squares[target].classList.add("tetromino");
    });
  }

  function undraw() {
    current.forEach(index => {
      const target = currentPosition + index;
      if (squares[target]) squares[target].classList.remove("tetromino");
    });
  }

  function isTaken(pos) {
    return squares[pos] && squares[pos].classList.contains("taken");
  }

  function isValidPosition(pos, shape) {
    return shape.every(index => {
      const target = pos + index;
      const col = target % width;
      return (
        target >= 0 &&
        target < squares.length &&
        !isTaken(target) &&
        col >= 0 &&
        col < width
      );
    });
  }

function moveDown() {
  if (!timerId) return;
  undraw();
  currentPosition += width;
  draw();
  freeze(); // 让 freeze() 自己判断是否到底
}


  function moveLeft() {
    undraw();
    const newPosition = currentPosition - 1;
    if (isValidPosition(newPosition, current)) {
      currentPosition = newPosition;
    }
    draw();
  }

  function moveRight() {
    undraw();
    const newPosition = currentPosition + 1;
    if (isValidPosition(newPosition, current)) {
      currentPosition = newPosition;
    }
    draw();
  }

  function rotate() {
    undraw();
    const nextRotation = (currentRotation + 1) % 4;
    const next = tetrominoes[random][nextRotation];
    if (isValidPosition(currentPosition, next)) {
      currentRotation = nextRotation;
      current = next;
    }
    draw();
  }

function freeze() {
  const willTouch = current.some(index => {
    const below = currentPosition + index + width;
    return below >= squares.length || squares[below].classList.contains("taken");
  });

  if (willTouch) {
    current.forEach(index =>
      squares[currentPosition + index].classList.add("taken")
    );

    // 生成新方块
    random = Math.floor(Math.random() * tetrominoes.length);
    currentRotation = 0;
    current = tetrominoes[random][currentRotation];
    currentPosition = 4;

    draw();
    addScore();
    gameOver();
  }
}


  function addScore() {
    for (let i = 0; i < 199; i += width) {
      const row = Array.from({ length: width }, (_, j) => i + j);
      if (row.every(index => squares[index].classList.contains("taken"))) {
        score += 10;
        scoreDisplay.textContent = score;
        row.forEach(index => {
          squares[index].classList.remove("taken");
          squares[index].classList.remove("tetromino");
        });
        const removed = squares.splice(i, width);
        squares = removed.concat(squares);
        squares.forEach(cell => grid.appendChild(cell));
      }
    }
  }

  function gameOver() {
    if (current.some(index => isTaken(currentPosition + index))) {
      scoreDisplay.textContent = "游戏结束";
      clearInterval(timerId);
      timerId = null;
    }
  }

  function handleKeyPress(e) {
    if (e.key === "ArrowLeft") moveLeft();
    else if (e.key === "ArrowRight") moveRight();
    else if (e.key === "ArrowDown") moveDown();
    else if (e.key === "ArrowUp") rotate();
  }

  // 键盘控制
  document.addEventListener("keydown", handleKeyPress);

  // 移动端按钮控制
  leftBtn.addEventListener("click", moveLeft);
  rightBtn.addEventListener("click", moveRight);
  rotateBtn.addEventListener("click", rotate);
  downBtn.addEventListener("click", moveDown);

  // 开始/暂停按钮
  startBtn.addEventListener("click", () => {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    } else {
      draw();
      timerId = setInterval(moveDown, 500);
    }
  });
});