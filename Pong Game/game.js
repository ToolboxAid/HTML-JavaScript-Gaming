// Font for Pong is 3x5 (ACROSS x DOWN)

// Variables to store the puck's position and radius 
const speedIncrease = 1.1;
const puckWidth = 20; // Width of the puck
const puckHeight = 20; // Height of the puck
const puckColor = "white";
let puckX = gameAreaWidth / 2;
let puckY = gameAreaHeight / 2;
let puckVelocityX = 1.5;
let puckVelocityY = 1.3;

// Paddle positions (use let to allow modification)
const paddleWidth = 20;
const paddleHeight = 110;
const leftPaddleX = 20;
const leftPaddleColor = "white";
const rightPaddleX = gameAreaWidth - leftPaddleX - paddleWidth;
const rightPaddleColor = "white";
const paddleSpeed = 8.0;
let leftPaddleY = (gameAreaHeight / 2) - (paddleHeight / 2);
let rightPaddleY = leftPaddleY;

// Function to draw the puck
function drawPuck(ctx) {
    ctx.fillStyle = puckColor;
    ctx.fillRect(puckX - puckWidth / 2, puckY - puckHeight / 2, puckWidth, puckHeight);
}

function movePuck() {
    // Update puck position based on velocity
    puckX += puckVelocityX;
    puckY += puckVelocityY;

    // Check for collision with canvas boundaries
    if (puckX + puckWidth / 2 > gameAreaWidth || puckX - puckWidth / 2 < 0) {
        puckVelocityX *= -1; // Reverse X direction
    }
    if (puckY + puckHeight / 2 > gameAreaHeight || puckY - puckHeight / 2 < 0) {
        puckVelocityY *= -1; // Reverse Y direction
    }

    // Check for paddle collisions
    // Check collision with left paddle
    if (puckX - puckWidth / 2 < leftPaddleX + paddleWidth &&
        puckY > leftPaddleY && puckY < leftPaddleY + paddleHeight) {

        // Calculate the hit position on the paddle
        let paddleCenterY = leftPaddleY + paddleHeight / 2;
        let offsetY = puckY - paddleCenterY; // Distance from center of paddle

        // Reverse X direction
        puckVelocityX *= -1;

        // Maintain the Y velocity, adjusting based on where it hits the paddle
        puckVelocityY = Math.sign(puckVelocityY) * (Math.abs(puckVelocityY) + offsetY * 0.1);
    }

    // Check collision with right paddle
    if (puckX + puckWidth / 2 > rightPaddleX &&
        puckY > rightPaddleY && puckY < rightPaddleY + paddleHeight) {

        // Calculate the hit position on the paddle
        let paddleCenterY = rightPaddleY + paddleHeight / 2;
        let offsetY = puckY - paddleCenterY; // Distance from center of paddle

        // Reverse X direction
        puckVelocityX *= -1;

        // Maintain the Y velocity, adjusting based on where it hits the paddle
        puckVelocityY = Math.sign(puckVelocityY) * (Math.abs(puckVelocityY) + offsetY * 0.1);
    }
}

// Function to draw paddles
function drawPaddles(ctx) {
    // Draw left paddle
    ctx.fillStyle = leftPaddleColor;
    ctx.fillRect(leftPaddleX, leftPaddleY, paddleWidth, paddleHeight);

    // Draw right paddle
    ctx.fillStyle = rightPaddleColor;
    ctx.fillRect(rightPaddleX, rightPaddleY, paddleWidth, paddleHeight);
}

// Function to move paddles
function movePaddles() {
    // Move left paddle
    if (keys.a && leftPaddleY > 0) {
        leftPaddleY -= paddleSpeed;
    }
    if (keys.z && leftPaddleY < gameAreaHeight - paddleHeight) {
        leftPaddleY += paddleSpeed;
    }

    // Move right paddle
    if (keys.up && rightPaddleY > 0) {
        rightPaddleY -= paddleSpeed;
    }
    if (keys.down && rightPaddleY < gameAreaHeight - paddleHeight) {
        rightPaddleY += paddleSpeed;
    }
}

// Function to handle actions based on key states
function handleInput() {
    // Move paddles
    movePaddles();
}

// Function to draw a dashed vertical line
function drawDashedLine(ctx) {
    ctx.save(); // Save the current context state

    // Set the line properties
    ctx.lineWidth = 8; // Line width
    ctx.strokeStyle = 'white'; // Line color

    // Set the line dash pattern (15px dash, 5px space)
    ctx.setLineDash([19, 19]);

    // Draw the dashed line
    const centerX = gameAreaWidth / 2; // Middle of the canvas
    ctx.beginPath();
    ctx.moveTo(centerX, 0); // Start from the top
    ctx.lineTo(centerX, gameAreaHeight); // End at the bottom
    ctx.stroke(); // Render the line

    ctx.restore(); // Restore the previous context state
}

function drawChar(ctx, char, x, y, pixelWidth, pixelHeight) {
    const charArray = font5x3[char];

    // If character not found, return
    if (!charArray) return;

    for (let row = 0; row < charArray.length; row++) {
        for (let col = 0; col < charArray[row].length; col++) {
            if (charArray[row][col] === 1) {
                ctx.fillRect(x + col * pixelWidth,
                    y + row * pixelHeight,
                    pixelWidth + 1,
                    pixelHeight + 1);
            }
        }
    }
}

// Game loop function
function gameLoop(ctx) {
    // Handle input
    handleInput();

    // Move the puck
    movePuck();

    // Draw the dashed line
    drawDashedLine(ctx);

    // Draw paddles
    drawPaddles(ctx);

    // Draw the puck
    drawPuck(ctx);

    // Draw Score
    const score1 = "01";
    const score2 = "23";
    let x = 280;
    const y = 30;
    const pixelWidth = 15;
    const pixelHeight = 20;
    for (let i = 0; i < score1.length; i++) {
        drawChar(ctx, score1[i], x + (i * 4 * pixelWidth), y, pixelWidth, pixelHeight);
    }
    for (let i = 0; i < score2.length; i++) {
        drawChar(ctx, score2[i], (x + 185) + (i * 4 * pixelWidth), y, pixelWidth, pixelHeight);
    }
}

// Object to keep track of key states
const keys = {
    left: false,
    right: false,
    up: false,
    down: false,
    a: false,
    z: false,
};

// Event listener for keydown
document.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'ArrowLeft':
            keys.left = true;
            break;
        case 'ArrowRight':
            keys.right = true;
            break;
        case 'Space':
            keys.space = true;
            break;
        case 'KeyA':
            keys.a = true;
            break;
        case 'KeyZ':
            keys.z = true;
            break;
        case 'ArrowUp':
            keys.up = true;
            break;
        case 'ArrowDown':
            keys.down = true;
            break;
    }
});

// Event listener for keyup
document.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'ArrowLeft':
            keys.left = false;
            break;
        case 'ArrowRight':
            keys.right = false;
            break;
        case 'Space':
            keys.space = false;
            break;
        case 'KeyA':
            keys.a = false;
            break;
        case 'KeyZ':
            keys.z = false;
            break;
        case 'ArrowUp':
            keys.up = false;
            break;
        case 'ArrowDown':
            keys.down = false;
            break;
    }
});
