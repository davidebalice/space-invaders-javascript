class Grid {
  constructor(type) {
    this.position = {
      x: 0,
      y: 0
    }
    this.type = type
    this.velocity = {
      x: 3,
      y: 0
    }

    this.invaders = []

    const columns = Math.floor(Math.random() * 10 + 5) // Numero di colonne casuale tra 5 e 15
    const rows = Math.floor(Math.random() * 5 + 2) // Numero di righe casuale tra 2 e 7

    this.width = columns * 30 // Larghezza della griglia

    // Crea gli invasori e li aggiunge alla griglia
    for (let x = 0; x < columns; x++) {
      for (let y = 0; y < rows; y++) {
        this.invaders.push(
          new Invader({
            position: {
              x: x * 30,
              y: y * 30
            },
            type
          })
        )
      }
    }
  }

  update() {
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

    this.velocity.y = 0

    // Cambia direzione quando la griglia raggiunge i bordi del canvas
    if (this.position.x + this.width >= canvas.width || this.position.x <= 0) {
      this.velocity.x = -this.velocity.x * 1.15
      this.velocity.y = 30
    }
  }
}
