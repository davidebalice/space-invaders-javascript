class Bomb {
  static radius = 26
  constructor({ position, velocity }) {
    this.position = position
    this.velocity = velocity
    this.radius = 0
    this.color = 'red'
    this.opacity = 0.1
    this.active = false

    const image = new Image()
    image.src = `./img/bomb.png`
    image.onload = () => {
      const scale = 1.6
      this.image = image
      this.width = image.width * scale
      this.height = image.height * scale
      this.position = {
        x: position.x,
        y: position.y
      }
    }

    gsap.to(this, {
      radius: 30
    })
  }

  draw() {
    c.save()
    c.globalAlpha = this.opacity
    c.beginPath()
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
    c.closePath()
    c.fillStyle = this.color
    c.fill()
    c.restore()
    c.drawImage(
      this.image,
      this.position.x - 25,
      this.position.y - 31,
      this.width,
      this.height
    )
  }

  update() {
    this.draw()
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

    // Cambia direzione quando la bomba raggiunge i bordi del canvas
    if (
      this.position.x + this.radius + this.velocity.x >= canvas.width ||
      this.position.x - this.radius + this.velocity.x <= 0
    ) {
      this.velocity.x = -this.velocity.x
    } else if (
      this.position.y + this.radius + this.velocity.y >= canvas.height ||
      this.position.y - this.radius + this.velocity.y <= 0
    )
      this.velocity.y = -this.velocity.y
  }

  explode() {
    audio.bomb.play()
    this.active = true
    this.velocity.x = 0
    this.velocity.y = 0
    gsap.to(this, {
      radius: 200,
      color: 'white'
    })

    gsap.to(this, {
      delay: 0.1,
      opacity: 0,
      duration: 0.15
    })
  }
}

class PowerUp {
  constructor({ position, velocity }) {
    this.position = position
    this.velocity = velocity
    this.image = new Image()
    this.image.src = `./img/power.png`
    this.size = 50
  }

  draw() {
    c.drawImage(
      this.image,
      this.position.x - this.size / 2,
      this.position.y - this.size / 2,
      this.size,
      this.size
    )
  }

  update() {
    this.draw()
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y
  }
}
