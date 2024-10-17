// ToolboxAid.com
// David Quesenberry
// font5x3.js
// 10/16/2024

// Font for Pong is 3 x 5 (ACROSS x DOWN)

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
