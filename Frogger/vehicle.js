// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// frog.js

import objectPNG from '../scripts/objectPNG.js';

class Vehicle extends objectPNG {
    static DEBUG = new URLSearchParams(window.location.search).has('vehicle');

    constructor(x, y, spritePath, vehicleType, direction, speed) {
        // Call parent constructor with sprite details
        super(x, y, spritePath, 0, 0, 24, 24, 4, 'black');

        // Vehicle properties
        this.type = 'vehicle';
        this.vehicleType = vehicleType;  // 'car', 'truck', 'bulldozer', etc.
        this.direction = direction;       // 1 for right, -1 for left
        this.speed = speed;              // Pixels per frame
        this.isActive = true;            // Flag for active/inactive state

        if (Vehicle.DEBUG) {
            console.log(`Vehicle created: ${this.vehicleType} at (${x},${y}) moving ${direction > 0 ? 'right' : 'left'} at ${speed}px/frame`);
        }
    }

    draw(ctx) {
        super.draw(ctx);
// let cnt = 0;
//         if (Vehicle.DEBUG) {
//             // Draw vehicle debug box
//             ctx.strokeStyle = 'white';
//             ctx.lineWidth = 2;
//             ctx.strokeRect(this.x, this.y, this.width, this.height);

//             if (cnt++ === 0) {
//                 ctx.textAlign = 'left';
//                 ctx.font = '14px Arial';
//                 ctx.fillStyle = 'yellow';

//                 // Basic properties always available
//                 const basicProps = [
//                     `Type: ${this.vehicleType}`,
//                     `Position: (${Math.floor(this.x)}, ${Math.floor(this.y)})`,
//                     `Direction: ${this.direction}`,
//                     `Speed: ${this.speed}`,
//                     `Size: ${this.width}x${this.height}`
//                 ];

//                 // Draw basic properties
//                 basicProps.forEach((prop, index) => {
//                     ctx.fillText(prop, 50, 340 + (index * 20));
//                 });

//                 // Sprite loading status
//                 ctx.fillStyle = this.isLoaded ? '#0F0' : '#F00';
//                 ctx.fillText(`Sprite Loaded: ${this.isLoaded}`, 50, 440);
                
//                 // Only show sprite details if loaded
// // Inside the draw method, replace the PNG Data section:
//                 // Display PNG properties and values
//                 ctx.fillStyle = '#8F8';
//                 const yPos = 500;
//                 ctx.fillText('PNG Data:', 50, yPos);

//                 if (this.png) {
//                     let lineY = yPos + 20;
                    
//                     // Display core Image properties
//                     const imageProps = [
//                         `complete: ${this.png.complete}`,
//                         `naturalWidth: ${this.png.naturalWidth}`,
//                         `naturalHeight: ${this.png.naturalHeight}`,
//                         `width: ${this.png.width}`,
//                         `height: ${this.png.height}`,
//                         `src: ${this.png.src.split('/').pop()}` // Show just filename
//                     ];

//                     imageProps.forEach(prop => {
//                         ctx.fillText(prop, 70, lineY);
//                         lineY += 20;
//                     });

//                     // Display sprite-specific properties
//                     ctx.fillText('Sprite Properties:', 50, lineY + 20);
//                     lineY += 40;
                    
//                     const spriteProps = [
//                         `spriteX: ${this.spriteX}`,
//                         `spriteY: ${this.spriteY}`,
//                         `spriteWidth: ${this.spriteWidth}`,
//                         `spriteHeight: ${this.spriteHeight}`,
//                         `pixelSize: ${this.pixelSize}`
//                     ];

//                     spriteProps.forEach(prop => {
//                         ctx.fillText(prop, 70, lineY);
//                         lineY += 20;
//                     });
//                 } else {
//                     ctx.fillText('PNG not loaded', 70, yPos + 20);
//                 }
//             }
//         }
    }
    
}
export default Vehicle;
