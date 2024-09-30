// Ball variables
const ballRadius = 10

// Paddle variables
const paddleHeight = 14
const paddleWidth = 90
const paddleOffsetBottom = 10

// Bricks variables
const brickRowCount = 3
const brickColumnCount = 5
const brickWidth = 78
const brickHeight = 24
const brickPadding = 12
const brickOffsetTop = 35
const brickOffsetLeft = 26

class Game {
  level = 0
  score = 0
  lives = 3
  delta = 0.5
  velocity = 2
  gameOver = false
  levelColors = ['#51d0de', '#9bc400', '#ffde22', '#ff6f3c', '#eb2632', '#27296d']
  leftKeyPressed = false
  rightKeyPressed = false

  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')

    const color = this.levelColors[this.level]

    const paddleX = (canvas.width - paddleWidth) / 2
    const paddleY = canvas.height - paddleHeight - paddleOffsetBottom * this.level

    const ballX = canvas.width / 2
    const ballY = canvas.height - paddleHeight - paddleOffsetBottom * this.level - ballRadius
    const dx = 2 + this.level * this.delta
    const dy = -2 - this.level * this.delta

    this.ball = new Ball(ballX, ballY, color, ballRadius, dx, dy)
    this.paddle = new Paddle(paddleX, paddleY, color , paddleWidth, paddleHeight)
    this.bricks = []
    this.generateBrickList()
  }

  generateBrickList() {
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft
        const brickY = r * (brickHeight + brickPadding * 1.25) + brickOffsetTop

        this.bricks.push(
          new Brick(brickX, brickY, brickWidth, brickHeight, this.getLevelColor())
        )
      }
    }
  }

  getLevelColor() {
    return this.levelColors[Math.min(this.level, this.levelColors.length - 1)]
  }

  setLevel(level) {
    this.level = level
  }

  getContext() {
    return this.canvas.getContext('2d')
  }

  start() {
    this.requestAnimationId = null
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.paddle.draw(this.ctx)
    this.ball.draw(this.ctx)
    this.drawBricks()
    this.listenKeyboard()
    this.collisionDetection()
    this.drawScore()
    this.drawLives()
    this.ball.move({
      width: this.canvas.width,
      height: this.canvas.height,
      level: this.level,
      paddleX: this.paddle.getX(),
      handleBottomCollision: () => {
        this.lives--
        if (this.lives) {
          this.resetCurrentLevel()
        } else {
          alert('GAME OVER!')
          this.gameOver = true
        }
      }
    })

    if (this.gameOver) return

    requestAnimationFrame(() => this.start())
  }

  drawBricks() {
    this.bricks.forEach(brick => brick.draw(this.ctx))
  }

  drawScore() {
    this.ctx.font = '16px Arial'
    this.ctx.fillStyle = this.levelColors[this.level]
    this.ctx.fillText(`Score: ${this.score}`, 10, 20)
  }

  brickAndBallColliding(brick) {
    const distX = Math.abs(this.ball.getX() - brick.getX() - brick.width / 2)
    const distY = Math.abs(this.ball.getY() - brick.getY() - brick.height / 2)

    if (distX > (brick.width / 2 + ballRadius)) {
        return false;
    }

    if (distY > (brick.height / 2 + ballRadius)) {
        return false;
    }

    if (distX <= (brick.width / 2)) {
        return true;
    }
    if (distY <= (brick.height / 2)) {
        return true;
    }

    const dx = distX - brick.width / 2;
    const dy = distY - brick.height / 2;
    return (dx * dx + dy * dy <= (ballRadius * ballRadius));
  }

  collisionDetection() {
    for (let i = 0; i < this.bricks.length; i++) {
      if (this.brickAndBallColliding(this.bricks[i])) {
        this.ball.setDy(this.ball.getDy() * -1)
        this.score++
        this.bricks.splice(i, 1)
        return
      }
    }

    if (this.checkIsCompleteLevel()) {
      this.displayNextLevel()
    }
  }

  displayNextLevel() {
    this.level++
    this.generateBrickList()
    this.resetCurrentLevel()
  }

  resetCurrentLevel() {
    const maxPaddleOffsetBottom = paddleOffsetBottom * Math.min(this.level, this.levelColors.length - 1)
    const ballX = this.canvas.width / 2
    const ballY = this.canvas.height - paddleHeight - maxPaddleOffsetBottom - ballRadius
    const dx = 2 + this.level * this.delta
    const dy = -2 - this.level * this.delta
    const paddleX = (this.canvas.width - paddleWidth) / 2
    const paddleY = this.canvas.height - paddleHeight - maxPaddleOffsetBottom
    const color = this.getLevelColor()

    this.ball = new Ball(ballX, ballY, color, ballRadius, dx, dy)
    this.paddle = new Paddle(paddleX, paddleY, color, paddleWidth, paddleHeight)
  }

  drawLives() {
    this.ctx.font = "16px Arial"
    this.ctx.fillStyle = this.getLevelColor()
    this.ctx.fillText(`Lives:`, this.canvas.width - 95, 21)

    for (let i = 0; i < this.lives; i++) {
      const liveX = i * 14 + this.canvas.width - 42

      this.ctx.beginPath()
      this.ctx.arc(liveX, 16, 6, 0, Math.PI * 2)
      this.ctx.fillStyle = this.getLevelColor()
      this.ctx.fill()
      this.ctx.closePath()
    }
  }

  listenKeyboard() {
    const paddleX = this.paddle.getX()

    if (this.rightKeyPressed && paddleX < this.canvas.width - paddleWidth) {
      this.paddle.setX(paddleX + paddleWidth * 0.1)
    } else if (this.leftKeyPressed && paddleX > 0) {
      this.paddle.setX(paddleX - paddleWidth * 0.1)
    }
  }

  checkIsCompleteLevel() {
    return this.bricks.length === 0
  }

  setRightKeyPressed(value) {
    this.rightKeyPressed = value
  }

  setLeftKeyPressed(value) {
    this.leftKeyPressed = value
  }
}

class Figure {
  constructor(x, y, color) {
    this.x = x
    this.y = y
    this.color = color
  }

  setX(x) {
    this.x = x
  }

  getX() {
    return this.x
  }

  setY(y) {
    this.y = y
  }

  getY() {
    return this.y
  }

  setColor(color) {
    this.color = color
  }
}

class Paddle extends Figure {

  constructor(x, y, color, width, height) {
    super(x, y, color)
    this.width = width
    this.height = height
  }

  draw(ctx) {
    ctx.beginPath()
    ctx.roundRect(this.x, this.y, this.width, this.height, this.width / 2)
    ctx.fillStyle = this.color
    ctx.fill()
    ctx.closePath()
  }
}

class Ball extends Figure {

  constructor(x, y, color, radius, dx, dy) {
    super(x, y, color)
    this.radius = radius
    this.dx = dx * this.generateRandomDirection()
    this.dy = -dy
  }

  generateRandomDirection() {
    const index = Math.random() < 0.5
    return [1, -1].at(index)
  }

  setDx(dx) {
    this.dx = dx
  }

  setDy(dy) {
    this.dy = dy
  }

  getDy() {
    return this.dy
  }

  draw(ctx) {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.fillStyle = this.color
    ctx.fill()
    ctx.closePath()
  }

  move({ width, height, level, paddleX, handleBottomCollision }) {
    this.x += this.dx
    this.y += this.dy

    if (this.x > width - this.radius || this.x < this.radius) {
      this.dx *= -1
    }

    if (this.y + this.dy <= this.radius) {
      this.dy *= -1
    } else if (this.y > height - this.radius - paddleHeight - paddleOffsetBottom * level) {
      if (this.x >= paddleX && this.x <= paddleX + paddleWidth) {
        this.dy = -this.dy
      } else {
        handleBottomCollision()
      }
    }
  }
}

class Brick extends Figure {

  constructor(x, y, width, height, color) {
    super(x, y, color)
    this.width = width
    this.height = height
  }

  draw(ctx) {
    ctx.beginPath()
    ctx.roundRect(this.x, this.y, this.width, this.height, 6)
    ctx.fillStyle = this.color
    ctx.fill()
    ctx.closePath()
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.querySelector('canvas')
  const btn = document.querySelector('.start-btn')

  const game = new Game(canvas)

  btn.addEventListener('click', () => {
    game.start()
    btn.disabled = true
  })

  document.addEventListener('keydown', (evt) => {
    game.setLeftKeyPressed(['Left', 'ArrowLeft'].includes(evt.key))
    game.setRightKeyPressed(['Right', 'ArrowRight'].includes(evt.key))
  })

  document.addEventListener('keyup', () => {
    game.setLeftKeyPressed(false)
    game.setRightKeyPressed(false)
  })
})
