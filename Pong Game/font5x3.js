// ToolboxAid.com
// David Quesenberry
// font5x3.js
// 10/16/2024

// Font for Pong is 3x5 (ACROSS x DOWN)

const font5x3 = {
    '0': [
        [1, 1, 1],
        [1, 0, 1],
        [1, 0, 1],
        [1, 0, 1],
        [1, 1, 1],
    ],
    '1': [
        [0, 1, 0],
        [1, 1, 0],
        [0, 1, 0],
        [0, 1, 0],
        [1, 1, 1],
    ],
    '2': [
        [1, 1, 1],
        [0, 0, 1],
        [1, 1, 1],
        [1, 0, 0],
        [1, 1, 1],
    ],
    '3': [
        [1, 1, 1],
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 1],
        [1, 1, 1],
    ],
    '4': [
        [1, 0, 1],
        [1, 0, 1],
        [1, 1, 1],
        [0, 0, 1],
        [0, 0, 1],
    ],
    '5': [
        [1, 1, 1],
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 1],
        [1, 1, 1],
    ],
    '6': [
        [1, 1, 1],
        [1, 0, 0],
        [1, 1, 1],
        [1, 0, 1],
        [1, 1, 1],
    ],
    '7': [
        [1, 1, 1],
        [0, 0, 1],
        [0, 0, 1],
        [0, 0, 1],
        [0, 0, 1],
    ],
    '8': [
        [1, 1, 1],
        [1, 0, 1],
        [1, 1, 1],
        [1, 0, 1],
        [1, 1, 1],
    ],
    '9': [
        [1, 1, 1],
        [1, 0, 1],
        [1, 1, 1],
        [0, 0, 1],
        [1, 1, 1],
    ]
};

function formatScore(score) {
    return score.toString().padStart(2, '0'); // Format score to 2 digits
}

function drawChar(ctx, char, x, y, pixelWidth, pixelHeight) {
    const characterMatrix = font5x3[char];
    if (!characterMatrix) return; // Ignore if character doesn't exist

    ctx.fillStyle = 'blue'; // Set fill color to pink

    for (let row = 0; row < characterMatrix.length; row++) {
        for (let col = 0; col < characterMatrix[row].length; col++) {
            if (characterMatrix[row][col] === 1) {
                ctx.fillRect(x + col * pixelWidth, y + row * pixelHeight, pixelWidth, pixelHeight);
            }
        }
    }
}

function drawScores(ctx, scores) {
    const pixelWidth = 15;
    const pixelHeight = 20;
    const x = 280; // X position for player 1 score
    const y = 30; // Y position for scores

    // Draw Player 1 Score
    const formattedScore1 = formatScore(scores.player1);
    drawChar(ctx, formattedScore1[0], x, y, pixelWidth, pixelHeight); // Tens
    drawChar(ctx, formattedScore1[1], x + 4 * pixelWidth, y, pixelWidth, pixelHeight); // Units

    // Draw Player 2 Score
    const formattedScore2 = formatScore(scores.player2);
    drawChar(ctx, formattedScore2[0], x + 185, y, pixelWidth, pixelHeight); // Tens
    drawChar(ctx, formattedScore2[1], x + 185 + 4 * pixelWidth, y, pixelWidth, pixelHeight); // Units
}

// Export the drawScores function
export { drawScores }; // Ensure this is added
