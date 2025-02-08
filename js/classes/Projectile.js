class Projectile {
  constructor({ position, velocity, color = 'red' }) {
    this.position = position
    this.velocity = velocity

    this.radius = 4
    this.color = color
    this.width = 6
    this.height = 14
  }

  // Disegna il proiettile
  draw() {
    c.beginPath()
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
    c.fillStyle = this.color
    c.fill()
    c.closePath()
  }

  // Aggiorna la posizione del proiettile
  update() {
    this.draw()
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y
  }
}
