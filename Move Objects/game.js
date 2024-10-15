// Function to get a random velocity between min and max
function getRandomVelocity(min, max) {
    return Math.random() * (max - min) + min;
}

// Variables to store the circle's position, radius, and random velocity
let circleX = 400; // Initial X position
let circleY = 300; // Initial Y position
const circleRadius = 25; // Radius of the circle

// Random velocity components between 1.0 and 5.0
let velocityX = getRandomVelocity(1.0, 5.0); // Change in X position per frame
let velocityY = getRandomVelocity(1.0, 5.0); // Change in Y position per frame

// Function to draw the filled circle
function drawFilledCircle(ctx) {
    ctx.beginPath();
    ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'yellow';
    ctx.fill();
}

// Function to update the circle's position
function updateCirclePosition() {
    // Update circle position
    circleX += velocityX;
    circleY += velocityY;

    // Check for boundary collisions and reverse direction if necessary
    if (circleX + circleRadius > gameAreaWidth || circleX - circleRadius < 0) {
        velocityX = -velocityX; // Reverse X direction
    }
    if (circleY + circleRadius > gameAreaHeight || circleY - circleRadius < 0) {
        velocityY = -velocityY; // Reverse Y direction
    }
}

// Game loop function
function gameLoop(ctx) {
    // Update the circle's position
    updateCirclePosition();

    // Call the drawing function
    drawFilledCircle(ctx);
}
