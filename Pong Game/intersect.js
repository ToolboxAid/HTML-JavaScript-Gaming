// Square properties (square)
let squareX = 10; // Square X position
let squareY = 10; // Square Y position
let squareVelocityX = 250; // Velocity in X
let squareVelocityY = 500; // Velocity in Y
let squareSize = 10; // Size of the square

// Rectangle properties (rect)
let rectX = 50; // Rectangle X position
let rectY = 20; // Rectangle Y position
let rectWidth = 10; // Width of the rectangle
let rectHeight = 480; // Height of the rectangle

// Draw a line from point (x1, y1) to (x2, y2)
function drawLine(ctx, x1, y1, x2, y2) {
    ctx.beginPath(); // Start a new path
    ctx.moveTo(x1, y1); // Move to the starting point
    ctx.lineTo(x2, y2); // Draw a line to the ending point
    ctx.stroke(); // Render the line
}

// Check for intersection
function checkIntersection(ctx) {
    // Calculate future position of the square
    let futureSquareX = squareX + squareVelocityX;
    let futureSquareY = squareY + squareVelocityY;

    // Determine the square's future boundaries
    let futureSquareLeft = futureSquareX;
    let futureSquareRight = futureSquareX + squareSize;
    let futureSquareTop = futureSquareY;
    let futureSquareBottom = futureSquareY + squareSize;

    // Determine the rectangle's boundaries
    let rectLeft = rectX;
    let rectRight = rectX + rectWidth;
    let rectTop = rectY;
    let rectBottom = rectY + rectHeight;

    // Draw the current square (blue)
    ctx.fillStyle = "blue";
    ctx.fillRect(squareX, squareY, squareSize, squareSize);

    // Draw the future square (green)
    ctx.fillStyle = "green";
    ctx.fillRect(futureSquareLeft, futureSquareTop, squareSize, squareSize);

    // Draw the rectangle (red)
    ctx.fillStyle = "red";
    ctx.fillRect(rectX, rectY, rectWidth, rectHeight);

    // Draw a line between the current square and future square
    ctx.strokeStyle = 'purple'; // Change the line color to purple
    drawLine(ctx, squareX + squareSize / 2, squareY + squareSize / 2, futureSquareX + squareSize / 2, futureSquareY + squareSize / 2);

    // Initialize entry and exit points
    let entryPoint = null;
    let exitPoint = null;

    // Check against the four edges of the rectangle for entry and exit points
    // Left edge (entry)
    if (squareX + squareSize <= rectLeft && futureSquareX + squareSize > rectLeft) {
        let slope = (squareVelocityY / squareVelocityX);
        let intersectY = squareY + slope * (rectLeft - squareX);
        if (intersectY >= rectTop && intersectY <= rectBottom) {
            entryPoint = { x: rectLeft, y: intersectY };
        }
    }
    
    // Right edge (exit)
    if (squareX < rectRight && futureSquareX + squareSize >= rectRight) {
        let slope = (squareVelocityY / squareVelocityX);
        let intersectY = squareY + slope * (rectRight - squareX);
        if (intersectY >= rectTop && intersectY <= rectBottom) {
            exitPoint = { x: rectRight, y: intersectY };
        }
    }

    // Top edge (entry)
    if (squareY + squareSize <= rectTop && futureSquareY + squareSize > rectTop) {
        let slope = (squareVelocityX / squareVelocityY);
        let intersectX = squareX + slope * (rectTop - squareY);
        if (intersectX >= rectLeft && intersectX <= rectRight) {
            entryPoint = { x: intersectX, y: rectTop };
        }
    }

    // Bottom edge (exit)
    if (squareY < rectBottom && futureSquareY + squareSize >= rectBottom) {
        let slope = (squareVelocityX / squareVelocityY);
        let intersectX = squareX + slope * (rectBottom - squareY);
        if (intersectX >= rectLeft && intersectX <= rectRight) {
            exitPoint = { x: intersectX, y: rectBottom };
        }
    }

    // Log the entry and exit points if they exist
    if (entryPoint) {
        //console.log("Entry Point:", entryPoint);
        ctx.fillStyle = 'yellow';
        ctx.fillRect(entryPoint.x - 5, entryPoint.y - 5, 10, 10); // Draw entry point
    }

    if (exitPoint) {
        //console.log("Exit Point:", exitPoint);
        ctx.fillStyle = 'orange';
        ctx.fillRect(exitPoint.x - 5, exitPoint.y - 5, 10, 10); // Draw exit point
    }

    // Calculate angles if entry and exit points exist
    if (entryPoint && exitPoint) {
        let angleX = Math.atan2(exitPoint.y - entryPoint.y, exitPoint.x - entryPoint.x) * (180 / Math.PI); // Angle in degrees
        let angleY = Math.atan2(squareVelocityY, squareVelocityX) * (180 / Math.PI); // Angle of the square's movement

        console.log(`Intersection Point: Entry (${entryPoint.x}, ${entryPoint.y}), Exit (${exitPoint.x}, ${exitPoint.y}), Angle: ${angleX.toFixed(2)}°`);
    } else {
        console.log("No intersection.");
    }
}
