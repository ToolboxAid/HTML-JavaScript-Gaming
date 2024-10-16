// ToolboxAid.com
// David Quesenberry
// objectStatic.js
// 10/16/2024
class ObjectStatic {
    constructor(x, y, width, height) {
        this.x = x; // X position
        this.y = y; // Y position
        this.width = width; // Width of the object
        this.height = height; // Height of the object
    }

    // Draw the object on the canvas
    draw(ctx, fillColor) {
        ctx.fillStyle =fillColor; // Color of the object
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}
