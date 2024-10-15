// Variables to store the ball's position and radius 
const ballRadius = 8;
const speedIncrease = 1.1;
let ballX = gameAreaWidth / 2;
let ballY = gameAreaHeight / 2;
let ballVelocityX = 1.5;
let ballVelocityY = 1.3;


// Object to keep track of key states
const keys = {
    left: false,
    right: false,
    up: false,
    down: false,
    a: false,
    z: false,
};

// Paddle positions (use let to allow modification)
let leftPaddleY = gameAreaHeight / 2;
let rightPaddleY = gameAreaHeight / 2;
const paddleWidth = 10;
const paddleHeight = 50;
const leftPaddleX = 30;
const rightPaddleX = gameAreaWidth - leftPaddleX - paddleWidth;
const paddleSpeed = 4.00; 


// Function to draw the ball
function drawBall(ctx) {
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'yellow';
    ctx.fill();
}

// Function to move the ball
function moveBall() {
    // Update ball position based on velocity
    ballX += ballVelocityX;
    ballY += ballVelocityY;

    // Check for collision with canvas boundaries
    if (ballX + ballRadius > gameAreaWidth || ballX - ballRadius < 0) {
        ballVelocityX *= -1; // Reverse X direction
        //ballVelocityX *= speedIncrease; // Increase speed
    }
    if (ballY + ballRadius > gameAreaHeight || ballY - ballRadius < 0) {
        ballVelocityY *= -1; // Reverse Y direction
        //ballVelocityY *= speedIncrease; // Increase speed
    }

    // Check for paddle collisions
    // Check collision with left paddle
    if (ballX - ballRadius < leftPaddleX + paddleWidth &&
        ballY > leftPaddleY && ballY < leftPaddleY + paddleHeight) {
        
        // Calculate the hit position on the paddle
        let paddleCenterY = leftPaddleY + paddleHeight / 2;
        let offsetY = ballY - paddleCenterY; // Distance from center of paddle

        // Adjust ball's velocity based on where it hits the paddle
        ballVelocityX *= -1; // Reverse X direction
        ballVelocityY += offsetY * 0.1; // Modify Y velocity based on offset
        ballVelocityX *= speedIncrease; // Increase speed
    }

    // Check collision with right paddle
    if (ballX + ballRadius > rightPaddleX &&
        ballY > rightPaddleY && ballY < rightPaddleY + paddleHeight) {
        
        // Calculate the hit position on the paddle
        let paddleCenterY = rightPaddleY + paddleHeight / 2;
        let offsetY = ballY - paddleCenterY; // Distance from center of paddle

        // Adjust ball's velocity based on where it hits the paddle
        ballVelocityX *= -1; // Reverse X direction
        ballVelocityY += offsetY * 0.1; // Modify Y velocity based on offset
        ballVelocityX *= speedIncrease; // Increase speed
    }
}

// Function to draw paddles
function drawPaddles(ctx) {
    // Draw left paddle
    ctx.fillStyle = 'green';
    ctx.fillRect(leftPaddleX, leftPaddleY, paddleWidth, paddleHeight);
    
    // Draw right paddle
    ctx.fillStyle = 'red';
    ctx.fillRect(rightPaddleX, rightPaddleY, paddleWidth, paddleHeight);
}

// Function to move paddles
function movePaddles() {
    // Move left paddle
    if (keys.a && leftPaddleY > 0) {
        leftPaddleY -= paddleSpeed; // Move up
    }
    if (keys.z && leftPaddleY < gameAreaHeight - paddleHeight) {
        leftPaddleY += paddleSpeed; // Move down
    }

    // Move right paddle
    if (keys.up && rightPaddleY > 0) {
        rightPaddleY -= paddleSpeed; // Move up
    }
    if (keys.down && rightPaddleY < gameAreaHeight - paddleHeight) {
        rightPaddleY += paddleSpeed; // Move down
    }
}

// Function to handle actions based on key states
function handleInput() {
    // Move paddles
    movePaddles();
}

// Game loop function
function gameLoop(ctx) {
    // Handle input
    handleInput();

    // Move the ball
    moveBall();

    // Clear the canvas for the new frame
    ctx.clearRect(0, 0, gameAreaWidth, gameAreaHeight);

    // Draw paddles
    drawPaddles(ctx);

    // Draw the ball
    drawBall(ctx);

    // // Request another loop of animation
    // requestAnimationFrame(() => gameLoop(ctx));
}

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
