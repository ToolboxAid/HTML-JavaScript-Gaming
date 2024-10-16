/**
 * Represents a static object in a game.
 */
class ObjectStatic {
    /**
     * Creates an instance of ObjectStatic.
     * @param {number} x - The X position of the object.
     * @param {number} y - The Y position of the object.
     * @param {number} width - The width of the object.
     * @param {number} height - The height of the object.
     */
    constructor(x, y, width, height) {
        this.x = x; 
        this.y = y; 
        this.width = width; 
        this.height = height; 
    }

    /**
     * Updates the position of the object.
     * @param {number} newX - The new X position.
     * @param {number} newY - The new Y position.
     */
    updatePosition(newX, newY) {
        this.x = newX;
        this.y = newY;
    }

    /**
     * Draws the object on the canvas.
     * @param {CanvasRenderingContext2D} ctx - The drawing context.
     * @param {string} [fillColor='black'] - The fill color of the object.
     * @param {string|null} [borderColor=null] - The border color of the object.
     * @param {number} [borderWidth=0] - The width of the border.
     */
    draw(ctx, fillColor = 'black', borderColor = null, borderWidth = 0) {
        ctx.fillStyle = fillColor;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        if (borderColor && borderWidth > 0) {
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = borderWidth;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }
}

export default ObjectStatic; 
