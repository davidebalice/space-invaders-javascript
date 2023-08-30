class Player {
  constructor() {
    this.velocity = {
      x: 0,
      y: 0
    }

    this.rotation = 0
    this.opacity = 1

    const spaceship = new Image()
    spaceship.src = './img/spaceship.png'
    spaceship.onload = () => {
      const scale = 0.25
      this.spaceship = spaceship
      this.width = spaceship.width * scale
      this.height = spaceship.height * scale
      this.position = {
        x: canvas.width / 2 - this.width / 2,
        y: canvas.height - this.height - 20
      }
    }

    const fire = new Image()
    fire.src = './img/fire.png'
    this.fireImages = ['./img/fire.png', './img/fire2.png']
    fire.onload = () => {
      this.fire = fire
    }
    this.particles = []
    this.frames = 0
    this.fireFrame = 0

    this.fireAnimationTimer = 0
    this.fireAnimationFrameDuration = 20
    this.currentFireFrame = 0
    this.lastFrameTime = performance.now()
  }

  draw() {
    c.save()
    c.globalAlpha = this.opacity
    c.translate(
      player.position.x + player.width / 2,
      player.position.y + player.height / 2 - 4
    )
    c.rotate(this.rotation)

    c.translate(
      -player.position.x - player.width / 2,
      -player.position.y - player.height / 2
    )

    c.drawImage(
      this.spaceship,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    )

    if (this.fire) {
      // Draw the fire image, adjust offsets if needed
      c.drawImage(
        this.fire,
        this.position.x,
        this.position.y + 25,
        this.width,
        this.height
      )
    }
    c.restore()
  }

  update() {
    if (!this.spaceship) return

    this.draw()
    this.position.x += this.velocity.x

    if (this.opacity !== 1) return

    /*
    this.frames++
    if (this.frames % 2 === 0) {
      this.particles.push(
        new Particle({
          position: {
            x: this.position.x + this.width / 2,
            y: this.position.y + this.height
          },
          velocity: {
            x: (Math.random() - 0.5) * 1.5,
            y: 1.4
          },
          radius: Math.random() * 2,
          color: 'white',
          fades: true
        })
      )
    }
*/
    this.fireFrame++
    if (this.fireFrame >= this.fireAnimationFrameDuration) {
      this.fireFrame = 0
      if (this.currentFireImageIndex == 0) {
        this.currentFireImageIndex = 1
      } else {
        this.currentFireImageIndex = 0
      }
      console.log(this.currentFireImageIndex)
      this.fire.src = this.fireImages[this.currentFireImageIndex]
    }
  }
}
