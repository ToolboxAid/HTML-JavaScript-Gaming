// Space Invaders
// original resolution 256x244
// my resolution will be 512x488 

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set the canvas dimensions
canvas.width = 512;
canvas.height = 488;

// Define the player (spaceship)
const player = {
  x: canvas.width / 2 - 25,
  y: canvas.height - 60,
  width: 50,
  height: 50,
  speed: 5,
  dx: 0
};

// Define the bullets array
const bullets = [];
const enemyBullets = [];

// Load enemy sprite
const enemyImage = new Image();
enemyImage.src = 'assets/sprites/enemy.png'; // Assume enemy.png exists

// Define the enemies array
const enemies = [];
const enemyRows = 5;
const enemyColumns = 11;
const enemyWidth = 9;
const enemyHeight = 9;
const enemyPaddingWidth = 15;
const enemyPaddingHeight = 8;
const enemyMoveDown = 40;
const enemyScale = 2;
const enemySpeedX = 10;
let enemyDirection = 1;

// Define enemy animation
let frameCount = 0;
let dynamicAnimationInterval = 1;

// Base configuration
const baseWidth = 50;
const baseHeight = 25;
const baseRows = 5;  // 5 rows of destructible cells per base
const baseColumns = 8; // 10 columns of destructible cells per base
const bases = [];

// Base class for destructible bases
class Base {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.cells = Array.from({ length: baseRows }, () => new Array(baseColumns).fill(1)); // 1 represents intact cells
  }

  // Draw the base with cells
  draw() {
    const cellWidth = baseWidth / baseColumns;
    const cellHeight = baseHeight / baseRows;

    for (let row = 0; row < baseRows; row++) {
      for (let col = 0; col < baseColumns; col++) {
        if (this.cells[row][col] === 1) {  // Only draw intact cells
          ctx.fillStyle = 'green';
          ctx.fillRect(
            this.x + col * cellWidth,
            this.y + row * cellHeight,
            cellWidth,
            cellHeight
          );
        }
      }
    }
  }

  // Check if a bullet hits a cell, and chip away at the base
  hit(bullet) {
    const cellWidth = baseWidth / baseColumns;
    const cellHeight = baseHeight / baseRows;

    const relativeX = bullet.x - this.x;
    const relativeY = bullet.y - this.y;

    const cellCol = Math.floor(relativeX / cellWidth);
    const cellRow = Math.floor(relativeY / cellHeight);

    // Check if the bullet is within the base bounds
    if (cellCol >= 0 && cellCol < baseColumns && cellRow >= 0 && cellRow < baseRows) {
      if (this.cells[cellRow][cellCol] === 1) {
        this.cells[cellRow][cellCol] = 0; // Chip away the base
        return true;  // Collision detected
      }
    }
    return false;
  }
}

// Enemy class for handling individual enemy properties and animations
class Enemy {
  constructor(x, y, sprite) {
    this.x = x;
    this.y = y;
    this.width = enemyWidth;
    this.height = enemyHeight;
    this.animationFrame = 0;
    this.sprite = sprite;
  }

  draw() {
    const stretchWidth = this.width * enemyScale;   // Example: Stretch the width by 2x
    const stretchHeight = this.height * enemyScale; // Example: Stretch the height by 2x

    ctx.drawImage(
      enemyImage,                          // The image
      this.animationFrame * this.width, this.sprite * 9, // Source x, y (crop the image if needed)
      this.width - 1, this.height - 1,        // Source width, height (original dimensions)
      this.x, this.y,                      // Destination x, y (position on canvas)
      stretchWidth, stretchHeight          // Destination width, height (stretched size)
    );
  }

  // Update enemies based on number of remaining enemies
  update(changeDirOccurred) {
    this.animationFrame = (this.animationFrame + 1) % 2;  // Update animation frame

    if (changeDirOccurred) {
      this.y += enemyMoveDown;
    } else {
      this.x += (enemySpeedX * enemyDirection);
    }
  }
}

// Create enemies in a grid
function createEnemies() {
  let sprite = 1.5;
  for (let row = 0; row < enemyRows; row++) {
    for (let col = 0; col < enemyColumns; col++) {
      enemies.push(new Enemy(
        col * ((enemyWidth * enemyScale) + enemyPaddingWidth) + 50,
        row * ((enemyHeight * enemyScale) + enemyPaddingHeight) + 100,
        Math.round(sprite)
      ));
    }
    let roundedSprite = Math.round(sprite);
    console.log(`Rounded Sprite: ${roundedSprite}`);
    sprite -= 0.5;
  }
}

// Create bases
function createBases() {

  let base = (512 / 6) - (50 / 2);
  let next = (512 / 6);

  for (let row = 0; row < baseRows; row++) {
    bases.push(new Base(base + (next * row), canvas.height - 150));
  }

}

// Player movement
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') player.dx = player.speed;
  if (e.key === 'ArrowLeft') player.dx = -player.speed;
  if (e.key === ' ') shootBullet();
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') player.dx = 0;
});

// Create player bullets, only allow one at a time
function shootBullet() {
  if (bullets.length === 0) {  // Only allow a bullet if none exist
    bullets.push({
      x: player.x + player.width / 2 - 2.5,
      y: player.y,
      width: 5,
      height: 20,
      speed: 7.5
    });
  }
}

// Update player position
function updatePlayer() {
  player.x += player.dx;
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
}

// Update bullets
function updateBullets() {
  bullets.forEach((bullet, index) => {
    bullet.y -= bullet.speed;

    // Check for collision with bases
    bases.forEach(base => {
      if (base.hit(bullet)) {
        bullets.splice(index, 1);  // Remove bullet on collision
      }
    });

    // Remove bullet if it goes off-screen
    if (bullet.y < 0) {
      bullets.splice(index, 1);
    }
  });
}

function enimiesAnimationRequired() {
  // Calculate the number of remaining enemies
  const remainingEnemies = enemies.length;
  const initialEnemyCount = enemyRows * enemyColumns;

  let AnimationRequired = false;

  // Set the dynamic animation interval based on remaining enemies
  // Start at 60 frames (1 second) and go down to 1 frame (1/100 of a second)
  const maxInterval = 60;  // 1 second at 60 FPS
  const minInterval = 2;   // 2 frame, representing 2/60 second

  // Update animation based on dynamic animation interval
  if (frameCount % dynamicAnimationInterval === 0) {

    AnimationRequired = true;

    dynamicAnimationInterval = Math.max(minInterval, Math.floor(maxInterval * (remainingEnemies / initialEnemyCount)));
    console.log(`FrameCount: ${frameCount}, dynamicAnimationInterval: ${dynamicAnimationInterval}`);
  }

  // Log the interval for debugging purposes (optional)
  // console.log(`Remaining Enemies: ${remainingEnemies}, Dynamic Animation Interval: ${dynamicAnimationInterval}`);
  return AnimationRequired;
}

function enemiesDirectionChange() {
  let changeDirOccurred = false;
  enemies.forEach(enemy => {
    if (!changeDirOccurred) {
      if (enemyDirection == 1) {
        if (enemy.x + (enemy.width * enemyScale) + enemy.width> canvas.width || enemy.x < 0) {
          changeDirOccurred = true;
        }
      } else {
        if (enemy.x - enemy.width < 0) {
          changeDirOccurred = true;
        }
      }
    }
  });
  return changeDirOccurred;
}

// Update enemies  // enimies get updated based on time (frameCount), not the loop
function updateEnemies() {
  if (enimiesAnimationRequired()) {
    let directionChange = enemiesDirectionChange();
    if (directionChange) {
      enemyDirection *= -1;
    }
    enemies.forEach(enemy =>
      enemy.update(directionChange));

    // Call the function to play the sound
    frameCount = 0;
    playCachedWav('fastinvader1.wav');
  }
}

// Collision detection between bullets and enemies
function detectCollisions() {
  bullets.forEach((bullet, bulletIndex) => {
    enemies.forEach((enemy, enemyIndex) => {
      if (
        bullet.x < enemy.x + (enemy.width * enemyScale) &&
        bullet.x + bullet.width > enemy.x &&
        bullet.y < enemy.y + (enemy.height * enemyScale) &&
        bullet.y + bullet.height > enemy.y
      ) {
        enemies.splice(enemyIndex, 1);
        bullets.splice(bulletIndex, 1);
      }
    });
  });
}

// Draw score
function drawScore() {
  // Set the font to Courier
  //ctx.font = '30px Courier';

  // Set the font to Press Start 2P (retro arcade font)
  ctx.font = '15px "Press Start 2P"';
  // Set the text color (optional)
  ctx.fillStyle = 'white';

  // Print the text at position (x, y)
  ctx.fillText('Score(1)', 25, 25);
  ctx.fillText('Score(2)', 375, 25);
  ctx.fillText('High-Score', 200, 25);
  ctx.fillText('  10', 45, 50);
  ctx.fillText('9999', 395, 50);
  ctx.fillText('  20', 255, 50);
}

// Draw player
function drawPlayer() {
  ctx.fillStyle = 'white';
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

// Draw bullets
function drawBullets() {
  bullets.forEach(bullet => {
    ctx.fillStyle = 'yellow';
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  });
}

// Game loop
function gameLoop() {

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  updatePlayer();
  updateBullets();
  updateEnemies();
  detectCollisions();

  bases.forEach(base => base.draw());  // Draw the bases
  drawPlayer();
  drawBullets();
  enemies.forEach(enemy => enemy.draw());
  drawScore();

  frameCount++;

  requestAnimationFrame(gameLoop);
}

// Initialize game
createEnemies();
createBases();
gameLoop();
