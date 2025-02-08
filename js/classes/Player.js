class Player {
  constructor() {
    this.velocity = {
      x: 0,
      y: 0
    }
    this.radius = 18
    this.rotation = 0
    this.opacity = 1

    // Carica l'immagine dell'astronave
    const spaceship = new Image()
    spaceship.src = './img/spaceship.png'
    spaceship.onload = () => {
      const scale = 0.25
      this.spaceship = spaceship
      this.width = spaceship.width * scale
      this.height = spaceship.height * scale
      this.position = {
        x: canvas.width / 2 - this.width / 2,
        y: canvas.height - this.height - 50
      }
    }

    // Carica l'immagine del fuoco
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

    this.isTouching = false
    this.touchStartX = 0

    // Aggiungi eventi touch per il movimento
    canvas.addEventListener('touchstart', (event) => {
      this.isTouching = true
      this.touchStartX = event.touches[0].clientX // Memorizza la posizione X iniziale del tocco
    })

    canvas.addEventListener('touchmove', (event) => {
      if (!this.isTouching) return

      const touchX = event.touches[0].clientX // Posizione X corrente del tocco
      const deltaX = touchX - this.touchStartX // Calcola lo spostamento
      this.touchStartX = touchX // Aggiorna la posizione di riferimento

      // Aggiorna la posizione dell'astronave
      this.velocity.x = deltaX * 0.1 // Velocità proporzionale allo spostamento
    })

    canvas.addEventListener('touchend', () => {
      this.isTouching = false
      this.velocity.x = 0 // Ferma il movimento quando il tocco finisce
    })
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

    // Disegna l'astronave
    c.drawImage(
      this.spaceship,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    )

    // Disegna il fuoco
    if (this.fire) {
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

    this.fireFrame++
    if (this.fireFrame >= this.fireAnimationFrameDuration) {
      this.fireFrame = 0
      if (this.currentFireImageIndex == 0) {
        this.currentFireImageIndex = 1
      } else {
        this.currentFireImageIndex = 0
      }
      this.fire.src = this.fireImages[this.currentFireImageIndex]
    }
  }

  initTouchControls() {
    // Aggiungi gli eventi touch
    canvas.addEventListener('touchstart', (event) => {
      this.handleTouch(event)
    })

    canvas.addEventListener('touchmove', (event) => {
      this.handleTouch(event)
    })

    canvas.addEventListener('touchend', () => {
      this.velocity.x = 0 // Ferma la nave al termine del tocco
    })
  }

  handleTouch(event) {
    event.preventDefault() // Previeni il comportamento di default del browser
    const touch = event.touches[0]
    const touchX = touch.clientX

    this.velocity.x = touchX < canvas.width / 2 ? -10 : 10
    /*
    // Muovi la nave in base alla posizione del tocco
    if (touchX < canvas.width / 2) {
      this.velocity.x = -5 // Muovi a sinistra
    } else {
      this.velocity.x = 5 // Muovi a destra
    }*/
  }
}
