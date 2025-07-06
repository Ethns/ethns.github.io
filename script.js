document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector("#grid");
  const scoreDisplay = document.querySelector("#score");
  const startBtn = document.querySelector("#start-button");

  const width = 10;
  let squares = [];
  for (let i = 0; i < 200; i++) {
    const div = document.createElement("div");
    div.classList.add("square");
    grid.appendChild(div);
    squares.push(div);
  }

  let timerId;
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
      if (squares[currentPosition + index])
        squares[currentPosition + index].classList.add("tetromino");
    });
  }

  function undraw() {
    current.forEach(index => {
      if (squares[currentPosition + index])
        squares[currentPosition + index].classList.remove("tetromino");
    });
  }

  function moveDown() {
    if (!timerId) return;
    undraw();
    if (!current.some(index => isTaken(currentPosition + index + width))) {
      currentPosition += width;
      draw();
    } else {
      freeze();
    }
  }

  function isTaken(pos) {
    return squares[pos] && squares[pos].classList.contains("taken");
  }

  function freeze() {
    current.forEach(index => squares[currentPosition + index].classList.add("taken"));
    // new tetromino
    random = Math.floor(Math.random() * tetrominoes.length);
    currentRotation = 0;
    current = tetrominoes[random][currentRotation];
    currentPosition = 4;
    draw();
    addScore();
    gameOver();
  }

  window.moveLeft = function () {
    undraw();
    const isAtLeft = current.some(index => (currentPosition + index) % width === 0);
    if (!isAtLeft && !current.some(index => isTaken(currentPosition + index - 1))) {
      currentPosition--;
    }
    draw();
  };

  window.moveRight = function () {
    undraw();
    const isAtRight = current.some(index => (currentPosition + index) % width === width - 1);
    if (!isAtRight && !current.some(index => isTaken(currentPosition + index + 1))) {
      currentPosition++;
    }
    draw();
  };

  window.rotate = function () {
    undraw();
    let nextRotation = (currentRotation + 1) % 4;
    let next = tetrominoes[random][nextRotation];
    // check rotation will stay in bounds
    const isOutOfLeft = next.some(index => (currentPosition + index) % width === width - 1);
    const isOutOfRight = next.some(index => (currentPosition + index) % width === 0);
    if (!isOutOfLeft && !isOutOfRight && !next.some(index => isTaken(currentPosition + index))) {
      currentRotation = nextRotation;
      current = next;
    }
    draw();
  };

  function control(e) {
    if (e.key === "ArrowLeft") moveLeft();
    else if (e.key === "ArrowRight") moveRight();
    else if (e.key === "ArrowDown") moveDown();
    else if (e.key === "ArrowUp") rotate();
  }

  document.addEventListener("keydown", control);

  startBtn.addEventListener("click", () => {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    } else {
      draw();
      timerId = setInterval(moveDown, 500);
    }
  });

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
});