document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.querySelector('canvas')
  const btn = document.querySelector('.start-btn')
  const ctx = canvas.getContext('2d')

  const ballRadius = 10
  const paddleHeight = 10
  const paddleWidth = 70
  const paddleOffsetBottom = 10

  const brickRowCount = 3
  const brickColumnCount = 5
  const brickWidth = 70
  const brickHeight = 20
  const brickPadding = 15
  const brickOffsetTop = 35
  const brickOffsetLeft = 40

  let currentLevel = 5
  const levelColors = ['#0095DD', '#f8b500', '#ff6f3c', '#402a23', '#eb2632', '#27296d']
  const totalLevels = levelColors.length

  let paddleX = (canvas.width - paddleWidth) / 2

  let x = canvas.width / 2
  let y = canvas.height - 10 - paddleOffsetBottom * currentLevel

  let dx = 2 + currentLevel * 0.5
  let dy = -2 - currentLevel * 0.5
  
  let leftPressed = false
  let rightPressed = false

  let score = 0
  let lives = 3

  let requestAnimation

  const bricks = [];

  for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
      bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
  }

  const resetLevel = () => {
    x = canvas.width / 2
    y = canvas.height - 10 - paddleOffsetBottom * currentLevel
    const index = Math.random() < 0.5
    dx = ([1, -1].at(index)) * (2 + currentLevel * 0.5)
    dy = -2 - currentLevel * 0.5
    paddleX = (canvas.width - paddleWidth) / 2;
  }

  const nextLevel = () => {
    currentLevel++

    if (currentLevel >= totalLevels) {
      alert('CONGRATULATIONS YOU COMPLETED ALL LEVELS!')
      cancelAnimationFrame(requestAnimation)
      document.location.reload()
    } else {
      for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
          bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
      }
      resetLevel()
    }
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
    ctx.roundRect(paddleX, canvas.height - paddleHeight - paddleOffsetBottom * currentLevel, paddleWidth, paddleHeight, 4)
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
          ctx.roundRect(brickX, brickY, brickWidth, brickHeight, 8)
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
    ctx.fillText('Score: ' + score, 10, 20)
  }

  const drawLives = () => {
    ctx.font = "16px Arial";
    ctx.fillStyle = levelColors[currentLevel];
    ctx.fillText(`Lives:`, canvas.width - 95, 21);

    for (let i = 0; i < lives; i++) {
      const liveX = i * 14 + canvas.width - 42

      ctx.beginPath()
      ctx.arc(liveX, 16, 6, 0, Math.PI * 2)
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
    } else if (y + dy > canvas.height - ballRadius - paddleOffsetBottom * currentLevel) {
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
    requestAnimation = requestAnimationFrame(draw);
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
