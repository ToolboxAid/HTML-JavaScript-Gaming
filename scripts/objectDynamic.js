// ToolboxAid.com
// David Quesenberry
// objectDynamic.js
// 10/16/2024
class ObjectDynamic extends ObjectStatic {
    constructor(x, y, width, height, velocityX, velocityY) {
        super(x, y, width, height); // Call the parent constructor with size for width and height
        this.velocityX = velocityX; // Velocity in X direction
        this.velocityY = velocityY; // Velocity in Y direction
    }

    // Update the position of the object based on velocity
    update(deltaTime) {
        this.x += this.velocityX * deltaTime;
        this.y += this.velocityY * deltaTime;
    }
}
