document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.querySelector('canvas')
  const btn = document.querySelector('.start-btn')
  const ctx = canvas.getContext('2d')

  const ballRadius = 10
  const paddleHeight = 10
  const paddleWidth = 70

  const brickRowCount = 3
  const brickColumnCount = 5
  const brickWidth = 70
  const brickHeight = 20
  const brickPadding = 15
  const brickOffsetTop = 40
  const brickOffsetLeft = 40

  let currentLevel = 0
  const levelColors = ['#0095DD', '#ff6f3c', '#402a23', '#eb2632']

  let paddleX = (canvas.width - paddleWidth) / 2

  let x = canvas.width / 2
  let y = canvas.height - 10 - 5 * currentLevel

  let dx = 2 + currentLevel
  let dy = -2 - currentLevel
  
  let leftPressed = false
  let rightPressed = false

  let score = 0
  let lives = 3

  const bricks = [];

  for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
      bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
  }

  const resetLevel = () => {
    x = canvas.width / 2
    y = canvas.height - 10 - 5 * currentLevel
    dx = 2 + currentLevel
    dy = -2 - currentLevel
    paddleX = (canvas.width - paddleWidth) / 2;
  }

  const nextLevel = () => {
    for (let c = 0; c < brickColumnCount; c++) {
      bricks[c] = [];
      for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
      }
    }
    resetLevel()
  }

  const collisionDetection = () => {
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        const brick = bricks[c][r];
        if (brick.status === 1) {
          if (x > brick.x && x < brick.x + brickWidth && y > brick.y && y < brick.y + brickHeight) {
            dy = -dy
            brick.status = 0
            score++
          }
        }
      }
    }

    if (checkBreakAllBricks()) {
      currentLevel++
      nextLevel()
    }
  }

  const checkBreakAllBricks = () => {
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        const brick = bricks[c][r];
        if (brick.status === 1) {
          return false
        }
      }
    }

    return true
  }

  const drawBall = () => {
    ctx.beginPath()
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = levelColors[currentLevel];
    ctx.fill();
    ctx.closePath();
  }

  const drawPaddle = () => {
    ctx.beginPath()
    ctx.rect(paddleX, canvas.height - paddleHeight - 5 * currentLevel, paddleWidth, paddleHeight)
    ctx.fillStyle = levelColors[currentLevel];
    ctx.fill()
    ctx.closePath()
  }

  const drawBricks = () => {
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        if (bricks[c][r].status === 1) {
          const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft
          const brickY = r * (brickHeight + brickPadding) + brickOffsetTop
          bricks[c][r].x = brickX;
          bricks[c][r].y = brickY;
          ctx.beginPath();
          ctx.rect(brickX, brickY, brickWidth, brickHeight)
          ctx.fillStyle = levelColors[currentLevel];
          ctx.fill()
          ctx.closePath()
        }
      }
    }
  }

  const drawScore = () => {
    ctx.font = '16px Arial'
    ctx.fillStyle = levelColors[currentLevel]
    ctx.fillText('Score: ' + score, 8, 20)
  }

  const drawLives = () => {
    ctx.font = "16px Arial";
    ctx.fillStyle = levelColors[currentLevel];
    ctx.fillText(`Lives:`, canvas.width - 100, 20);

    for (let i = 0; i < lives; i++) {
      const liveX = i * (8 + 4) + canvas.width - 50

      ctx.beginPath()
      ctx.rect(liveX, 8, 8, 15)
      ctx.fillStyle = levelColors[currentLevel];
      ctx.fill()
      ctx.closePath()
    }
  }

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks()
    drawBall()
    drawPaddle()
    collisionDetection()
    drawScore()
    drawLives()

    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
      dx = -dx
    }

    if (y + dy < ballRadius) {
      dy = -dy
    } else if (y + dy > canvas.height - ballRadius - 5 * currentLevel) {
      if (x > paddleX && x < paddleX + paddleWidth) {
        dy = -dy
      } else {
        lives--
        if (!lives) {
          alert('GAME OVER!')
          document.location.reload()
        } else {
          resetLevel()
        }
      }
    }

    if (rightPressed && paddleX < canvas.width - paddleWidth) {
      paddleX += 7;
    } else if (leftPressed && paddleX > 0) {
      paddleX -= 7;
    }

    x += dx;
    y += dy;
    requestAnimationFrame(draw);
  }

  const handleKeyDown = (e) => {
    rightPressed = ['Right', 'ArrowRight'].includes(e.key)
    leftPressed = ['Left', 'ArrowLeft'].includes(e.key)
  }

  const handleKeyUp = (e) => {
    rightPressed = false
    leftPressed = false
  }

  const startGame = () => {
    draw()
  }

  btn.addEventListener('click', () => {
    startGame()
    btn.disabled = true
  })

  document.addEventListener('keydown', handleKeyDown, false)
  document.addEventListener('keyup', handleKeyUp, false)
})