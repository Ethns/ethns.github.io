document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector("#grid");
  const scoreDisplay = document.querySelector("#score");
  const startBtn = document.querySelector("#start-button");

  const width = 10;
  let squares = Array.from({ length: 200 }, () => {
    const div = document.createElement("div");
    div.classList.add("square");
    grid.appendChild(div);
    return div;
  });

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
      squares[currentPosition + index].classList.add("tetromino");
    });
  }

  function undraw() {
    current.forEach(index => {
      squares[currentPosition + index].classList.remove("tetromino");
    });
  }

  function moveDown() {
    undraw();
    currentPosition += width;
    draw();
    freeze();
  }

  function freeze() {
    if (current.some(index => squares[currentPosition + index + width].classList.contains("taken"))) {
      current.forEach(index => squares[currentPosition + index].classList.add("taken"));
      random = Math.floor(Math.random() * tetrominoes.length);
      current = tetrominoes[random][currentRotation];
      currentPosition = 4;
      draw();
      addScore();
      gameOver();
    }
  }

  function moveLeft() {
    undraw();
    const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0);
    if (!isAtLeftEdge) currentPosition -= 1;
    if (current.some(index => squares[currentPosition + index].classList.contains("taken"))) {
      currentPosition += 1;
    }
    draw();
  }

  function moveRight() {
    undraw();
    const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1);
    if (!isAtRightEdge) currentPosition += 1;
    if (current.some(index => squares[currentPosition + index].classList.contains("taken"))) {
      currentPosition -= 1;
    }
    draw();
  }

  function rotate() {
    undraw();
    currentRotation++;
    if (currentRotation === current.length) currentRotation = 0;
    current = tetrominoes[random][currentRotation];
    draw();
  }

  function control(e) {
    if (e.keyCode === 37) moveLeft();
    else if (e.keyCode === 38) rotate();
    else if (e.keyCode === 39) moveRight();
    else if (e.keyCode === 40) moveDown();
  }

  document.addEventListener("keydown", control);

  startBtn.addEventListener("click", () => {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    } else {
      draw();
      timerId = setInterval(moveDown, 800);
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
    if (current.some(index => squares[currentPosition + index].classList.contains("taken"))) {
      scoreDisplay.textContent = "游戏结束";
      clearInterval(timerId);
    }
  }
});
