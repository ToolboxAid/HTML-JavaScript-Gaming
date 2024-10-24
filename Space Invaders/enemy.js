class Enemy {
    constructor(frames, offsetX = 0, pixelSize = 30) {
        this.frames = frames;
        this.currentFrameIndex = 0;
        this.offsetX = offsetX;
        this.pixelSize = pixelSize;
    }

    // Method to draw the current frame
    draw(ctx) {
        const frame = this.frames[this.currentFrameIndex];
        for (let row = 0; row < frame.length; row++) {
            for (let col = 0; col < frame[row].length; col++) {
                //console.log("draw");
                const pixel = frame[row][col];
                const color = pixel === '1' ? 'white' : 'black';
                ctx.fillStyle = color;
                ctx.fillRect((col * this.pixelSize) + this.offsetX, row * this.pixelSize, this.pixelSize, this.pixelSize);
            }
        }
       //ctx.drawLine(ctx,0,0,500,600,5,"yellow");
    }

    // Method to switch to the next frame
    nextFrame() {
        this.currentFrameIndex = (this.currentFrameIndex + 1) % this.frames.length;
    }
}

export default Enemy;
