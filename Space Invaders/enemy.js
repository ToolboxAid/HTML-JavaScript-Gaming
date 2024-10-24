import ObjectStatic from '../scripts/objectStatic.js'; // Ensure the class is capitalized

class Enemy extends ObjectStatic {
    constructor(x, y, frames, pixelSize = 3) {
        super(x,y); // Call the parent class constructor
        this.frames = frames;
        this.currentFrameIndex = 0;
        this.pixelSize = pixelSize;
        this.value = 0;
        this.value = 0;

/*
### Enemy Point Values
- **Squid**: 10 points
- **Octopus**: 20 points
- **Crab**: 30 points
- **Shielded Alien (if applicable in some versions)**: 40 points
*/
    }

    // Method to draw the current frame
    draw(ctx) {
        const frame = this.frames[this.currentFrameIndex];
        for (let row = 0; row < frame.length; row++) {
            for (let col = 0; col < frame[row].length; col++) {
                const pixel = frame[row][col];
                const color = pixel === '1' ? 'white' : 'red';
                ctx.fillStyle = color;
                ctx.fillRect((col * this.pixelSize) + this.x, (row * this.pixelSize) + this.y, this.pixelSize, this.pixelSize);
            }
        }
    }

    // Method to switch to the next frame
    nextFrame() {
        this.currentFrameIndex = (this.currentFrameIndex + 1) % this.frames.length;
    }
}

export default Enemy;
