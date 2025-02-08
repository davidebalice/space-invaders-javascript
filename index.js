// Seleziona gli elementi dal DOM
const scoreEl = document.querySelector('#scoreEl')
const volumeStop = document.querySelector('#volumeStop')
const canvas = document.querySelector('canvas')
const canvasContainer = document.getElementById('body')
const c = canvas.getContext('2d')

// Imposta le dimensioni del canvas
canvas.width = 1024
canvas.height = 576

canvas.width = window.innerWidth - 20
canvas.height = window.innerHeight - 20

// Inizializza le variabili di gioco
let player = new Player()
let projectiles = []
let grids = []
let invaderProjectiles = []
let particles = []
let bombs = []
let powerUps = []
let enemyType = 0
let gameOver = false
let startGame = false
let volume = true

// Inizializza lo stato dei tasti
let keys = {
  a: {
    pressed: false
  },
  d: {
    pressed: false
  },
  space: {
    pressed: false
  },
  ArrowLeft: {
    pressed: false
  },
  ArrowRight: {
    pressed: false
  },
  ctrl: {
    pressed: false
  },
  mouseLeft: {
    pressed: false
  }
}

// Inizializza altre variabili di gioco
let frames = 0
let randomInterval = Math.floor(Math.random() * 500 + 500)
let game = {
  over: false,
  active: true
}
let score = 0

let spawnBuffer = 500
let fps = 60
let fpsInterval = 1000 / fps
let msPrev = window.performance.now()

// Funzione per inizializzare il gioco
function init() {
  player = new Player()
  projectiles = []
  grids = []
  invaderProjectiles = []
  particles = []
  bombs = []
  powerUps = []

  keys = {
    a: {
      pressed: false
    },
    d: {
      pressed: false
    },
    space: {
      pressed: false
    },
    ArrowLeft: {
      pressed: false
    },
    ArrowRight: {
      pressed: false
    },
    ctrl: {
      pressed: false
    },
    mouseLeft: {
      pressed: false
    }
  }

  frames = 0
  randomInterval = Math.floor(Math.random() * 500 + 500)
  game = {
    over: false,
    active: true
  }
  score = 0
  document.querySelector('#finalScore').innerHTML = score
  document.querySelector('#scoreEl').innerHTML = score

  // Crea particelle iniziali
  for (let i = 0; i < 100; i++) {
    particles.push(
      new Particle({
        position: {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height
        },
        velocity: {
          x: 0,
          y: 0.3
        },
        radius: Math.random() * 2,
        color: 'white'
      })
    )
  }
}

function endGame() {
  console.log('you lose')
  audio.gameOver.play()
  startGame = false

  // Makes player disappear
  setTimeout(() => {
    player.opacity = 0
    game.over = true
  }, 0)

  setTimeout(() => {
    game.active = false
    document.querySelector('#restartScreen').style.display = 'flex'
    document.querySelector('#finalScore').innerHTML = score
  }, 2000)

  createParticles({
    object: player,
    color: 'white',
    fades: true
  })
}

function animate() {
  if (!game.active) return
  requestAnimationFrame(animate)

  const msNow = window.performance.now()
  const elapsed = msNow - msPrev

  if (elapsed < fpsInterval) return

  msPrev = msNow - (elapsed % fpsInterval) // 3.34

  c.fillStyle = 'rgba(0, 0, 0, 0)'
  c.fillRect(0, 0, canvas.width, canvas.height)

  c.clearRect(0, 0, canvas.width, canvas.height)

  for (let i = powerUps.length - 1; i >= 0; i--) {
    const powerUp = powerUps[i]

    if (powerUp.position.x - powerUp.radius >= canvas.width)
      powerUps.splice(i, 1)
    else powerUp.update()
  }

  // spawn powerups
  if (frames > 100 && frames % 500 === 0) {
    powerUps.push(
      new PowerUp({
        position: {
          x: 0,
          y: Math.random() * 300 + 15
        },
        velocity: {
          x: 5,
          y: 0
        }
      })
    )
  }

  // spawn bombe
  if (frames % 200 === 0 && bombs.length < 3) {
    bombs.push(
      new Bomb({
        position: {
          x: randomBetween(Bomb.radius, canvas.width - Bomb.radius),
          y: randomBetween(Bomb.radius, canvas.height - Bomb.radius)
        },
        velocity: {
          x: (Math.random() - 0.5) * 6,
          y: (Math.random() - 0.5) * 6
        }
      })
    )
  }

  for (let i = bombs.length - 1; i >= 0; i--) {
    const bomb = bombs[i]

    if (bomb.opacity <= 0) {
      bombs.splice(i, 1)
    } else bomb.update()
  }

  player.update()

  for (let i = player.particles.length - 1; i >= 0; i--) {
    const particle = player.particles[i]
    particle.update()

    if (particle.opacity === 0) player.particles[i].splice(i, 1)
  }

  particles.forEach((particle, i) => {
    if (particle.position.y - particle.radius >= canvas.height) {
      particle.position.x = Math.random() * canvas.width
      particle.position.y = -particle.radius
    }

    if (particle.opacity <= 0) {
      setTimeout(() => {
        particles.splice(i, 1)
      }, 0)
    } else {
      particle.update()
    }
  })

  invaderProjectiles.forEach((invaderProjectile, index) => {
    if (
      invaderProjectile.position.y + invaderProjectile.height >=
      canvas.height
    ) {
      setTimeout(() => {
        invaderProjectiles.splice(index, 1)
      }, 0)
    } else invaderProjectile.update()

    // projectile hits player
    if (
      rectangularCollision({
        rectangle1: invaderProjectile,
        rectangle2: player
      })
    ) {
      invaderProjectiles.splice(index, 1)
      endGame()
    }
  })

  for (let i = projectiles.length - 1; i >= 0; i--) {
    const projectile = projectiles[i]

    for (let j = bombs.length - 1; j >= 0; j--) {
      const bomb = bombs[j]

      // se projectile tocca bomba, rimuovi proiettile
      if (
        Math.hypot(
          projectile.position.x - bomb.position.x,
          projectile.position.y - bomb.position.y
        ) <
          projectile.radius + bomb.radius &&
        !bomb.active
      ) {
        projectiles.splice(i, 1)
        bomb.explode()
      }
    }

    for (let j = powerUps.length - 1; j >= 0; j--) {
      const powerUp = powerUps[j]

      // se projectile tocca bomba, rimuovi proiettile
      if (
        Math.hypot(
          projectile.position.x - powerUp.position.x,
          projectile.position.y - powerUp.position.y
        ) <
        projectile.radius + powerUp.radius
      ) {
        projectiles.splice(i, 1)
        powerUps.splice(j, 1)
        player.powerUp = 'MachineGun'
        console.log('powerup started')
        audio.bonus.play()

        setTimeout(() => {
          player.powerUp = null
          console.log('powerup ended')
        }, 5000)
      }
    }

    if (projectile.position.y + projectile.radius <= 0) {
      projectiles.splice(i, 1)
    } else {
      projectile.update()
    }
  }

  for (let j = bombs.length - 1; j >= 0; j--) {
    const bomb = bombs[j]

    if (bomb && !gameOver) {
      if (
        player.position.x < bomb.position.x + bomb.width - 20 &&
        player.position.x + player.width > bomb.position.x &&
        player.position.y < bomb.position.y + bomb.height - 20 &&
        player.position.y + player.height > bomb.position.y &&
        !bomb.active
      ) {
        bomb.explode()
        endGame()
        gameOver = true
      }
    }
  }

  grids.forEach((grid, gridIndex) => {
    grid.update()

    // spawn proiettili
    if (frames % 100 === 0 && grid.invaders.length > 0) {
      grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(
        invaderProjectiles
      )
    }

    for (let i = grid.invaders.length - 1; i >= 0; i--) {
      const invader = grid.invaders[i]
      invader.update({ velocity: grid.velocity })

      for (let j = bombs.length - 1; j >= 0; j--) {
        const bomb = bombs[j]

        const invaderRadius = 15

        // se bomba tocca invader, rimuovi invader
        if (
          Math.hypot(
            invader.position.x - bomb.position.x,
            invader.position.y - bomb.position.y
          ) <
            invaderRadius + bomb.radius &&
          bomb.active
        ) {
          score += 50
          scoreEl.innerHTML = score

          grid.invaders.splice(i, 1)
          createScoreLabel({
            object: invader,
            score: 50
          })

          createParticles({
            object: invader,
            fades: true
          })
        }
      }

      // projectiles hit enemy
      projectiles.forEach((projectile, j) => {
        if (
          projectile.position.y - projectile.radius <=
            invader.position.y + invader.height &&
          projectile.position.x + projectile.radius >= invader.position.x &&
          projectile.position.x - projectile.radius <=
            invader.position.x + invader.width &&
          projectile.position.y + projectile.radius >= invader.position.y
        ) {
          setTimeout(() => {
            const invaderFound = grid.invaders.find(
              (invader2) => invader2 === invader
            )
            const projectileFound = projectiles.find(
              (projectile2) => projectile2 === projectile
            )

            // rimuovi invader e proiettile
            if (invaderFound && projectileFound) {
              score += 100
              scoreEl.innerHTML = score

              //score labels
              createScoreLabel({
                object: invader
              })

              createParticles({
                object: invader,
                fades: true
              })

              //proiettile colpisce invader
              audio.explode.play()
              grid.invaders.splice(i, 1)
              projectiles.splice(j, 1)

              if (grid.invaders.length > 0) {
                const firstInvader = grid.invaders[0]
                const lastInvader = grid.invaders[grid.invaders.length - 1]

                grid.width =
                  lastInvader.position.x -
                  firstInvader.position.x +
                  lastInvader.width
                grid.position.x = firstInvader.position.x
              } else {
                grids.splice(gridIndex, 1)
              }
            }
          }, 0)
        }
      })

      //gameover - rimuovi player se viene toccato da invader
      if (
        rectangularCollision({
          rectangle1: invader,
          rectangle2: player
        }) &&
        !game.over
      )
        endGame()
    } // end loop della griglia
  })

  if ((keys.a.pressed || keys.ArrowLeft.pressed) && player.position.x >= 0) {
    player.velocity.x = -7
    player.rotation = -0.15
  } else if (
    (keys.d.pressed || keys.ArrowRight.pressed) &&
    player.position.x + player.width <= canvas.width
  ) {
    player.velocity.x = 7
    player.rotation = 0.15
  } else {
    player.velocity.x = 0
    player.rotation = 0
  }

  // spawning enemies

  if (frames % randomInterval === 0) {
    spawnBuffer = spawnBuffer < 0 ? 100 : spawnBuffer
    enemyType++
    grids.push(new Grid(enemyType))
    if (enemyType >= 3) {
      enemyType = 0
    }
    randomInterval = Math.floor(Math.random() * 500 + spawnBuffer)
    frames = 0
    spawnBuffer -= 100
  }

  if (
    (keys.space.pressed || keys.mouseLeft.pressed) &&
    player.powerUp === 'MachineGun' &&
    frames % 2 === 0 &&
    !game.over
  ) {
    if (frames % 6 === 0) audio.shoot.play()
    projectiles.push(
      new Projectile({
        position: {
          x: player.position.x + player.width / 2,
          y: player.position.y
        },
        velocity: {
          x: 0,
          y: -10
        },
        color: 'yellow'
      })
    )
  }

  frames++
}

document.querySelector('#volumeButton').addEventListener('click', () => {
  if (volume) {
    Howler.volume(0)
    volume = false
    volumeStop.style.display = 'block'
  } else {
    Howler.volume(0.6)
    volume = true
    volumeStop.style.display = 'none'
  }
})

document.querySelector('#startButton').addEventListener('click', () => {
  audio.backgroundMusic.play()
  audio.start.play()
  setTimeout(() => {
    startGame = true
  }, 2000)

  const starshipStartScreenContainer = document.getElementById(
    'starshipStartScreenContainer'
  )
  starshipStartScreenContainer.classList.add('takeOff')
  const startButton = document.getElementById('startButton')
  startButton.style.display = 'none'
  const startButton2 = document.getElementById('startButton2')
  startButton2.style.display = 'block'

  setTimeout(function () {
    document.querySelector('#startScreen').style.display = 'none'
    document.querySelector('#scoreContainer').style.display = 'block'
    init()
    animate()
  }, 2000)
})

document.querySelector('#restartButton').addEventListener('click', () => {
  audio.select.play()
  document.querySelector('#restartScreen').style.display = 'none'
  gameOver = false
  startGame = true
  init()
  animate()
})

function shoot() {
  if (player.powerUp === 'MachineGun') return

  audio.shoot.play()
  projectiles.push(
    new Projectile({
      position: {
        x: player.position.x + player.width / 2,
        y: player.position.y
      },
      velocity: {
        x: 0,
        y: -10
      }
    })
  )
}

addEventListener('keydown', ({ key }) => {
  if (game.over) return

  switch (key) {
    case 'a':
      keys.a.pressed = true
      break
    case 'd':
      keys.d.pressed = true
      break
    case 'ArrowRight':
      keys.ArrowRight.pressed = true
      break
    case 'ArrowLeft':
      keys.ArrowLeft.pressed = true
      break
    case ' ':
      keys.space.pressed = true
      if (startGame) {
        shoot()
      }
      break
  }
})

addEventListener('keyup', ({ key }) => {
  switch (key) {
    case 'a':
      keys.a.pressed = false
      break
    case 'd':
      keys.d.pressed = false
      break
    case 'ArrowRight':
      keys.ArrowRight.pressed = false
      break
    case 'ArrowLeft':
      keys.ArrowLeft.pressed = false
      break
    case ' ':
      keys.space.pressed = false
      break
  }
})

function handleMouseDown(event) {
  if (event.button === 0) {
    keys.space.pressed = true
    // Se il gioco è iniziato, spara
    if (startGame) {
      shoot()
    }
  }
}

function handleMouseUp(event) {
  if (event.button === 0) {
    keys.space.pressed = false
  }
}

// Aggiungi listener per il mouse
document.addEventListener('mousedown', handleMouseDown)
document.addEventListener('mouseup', handleMouseUp)

// Quando il mouse si muove
let lastMouseX = 0 // Memorizza l'ultima posizione X del mouse

window.addEventListener('mousemove', (event) => {
  // Controlla la direzione del movimento
  if (event.clientX < lastMouseX) {
    player.rotation = -0.15 // Rotazione a sinistra
  } else if (event.clientX > lastMouseX) {
    player.rotation = 0.15 // Rotazione a destra
  }

  // Sposta il player solo orizzontalmente
  player.position.x = event.clientX - player.width / 2
  lastMouseX = event.clientX // Aggiorna la posizione del mouse
})

// Resetta la rotazione quando il mouse smette di muoversi
window.addEventListener('mouseleave', () => {
  player.rotation = 0
})

// Movimento con touch
let lastTouchX = 0 // Memorizza l'ultima posizione X del tocco

canvas.addEventListener('touchstart', (event) => {
  const touch = event.touches[0]
  player.position.x = touch.clientX - player.width / 2
  lastTouchX = touch.clientX // Memorizza la posizione iniziale del tocco
})

canvas.addEventListener('touchmove', (event) => {
  const touch = event.touches[0]

  // Controlla la direzione del movimento
  if (touch.clientX < lastTouchX) {
    player.rotation = -0.15 // Rotazione a sinistra
  } else if (touch.clientX > lastTouchX) {
    player.rotation = 0.15 // Rotazione a destra
  }

  // Sposta il player solo orizzontalmente
  player.position.x = touch.clientX - player.width / 2
  lastTouchX = touch.clientX // Aggiorna la posizione del tocco
})

// Resetta la rotazione quando il tocco finisce
canvas.addEventListener('touchend', () => {
  player.rotation = 0
})
