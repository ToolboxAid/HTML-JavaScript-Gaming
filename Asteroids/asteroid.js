// ToolboxAid.com
// David Quesenberry
// 11/19/2024
// asteroid.js

import { canvasConfig } from './global.js';
import ObjectVector from '../scripts/objectVector.js';
import CanvasUtils from '../scripts/canvas.js';

class Asteroid extends ObjectVector {
  constructor(x, y, size = 'medium') {
    // Generate the vectorMap dynamically based on size
    const vectorMap = Asteroid.generateVectorMap(size);

    // Ensure the vectorMap has at least three points
    if (vectorMap.length < 3) {
      throw new Error("'vectorMap' frame must contain at least three points.");
    }

    // Set the framesMap with the vectorMap vectorMap
    const framesMap = vectorMap;

    // Random velocity
    const velocityX = (Math.random() - 0.5) * 100;
    const velocityY = (Math.random() - 0.5) * 100;

    // Initialize the parent class with the generated framesMap
    super(x, y, framesMap, velocityX, velocityY);  // Pass framesMap here

    // Initialize additional properties (like size) if needed
    this.size = size;

    this.velocityRotation = (Math.random() - 0.5) * 5;
  }

  update(deltaTime) {
    this.rotationAngle += this.velocityRotation;
    super.update(deltaTime);
    this.wrapAround();
  }

  draw() {
    super.draw();
    CanvasUtils.drawBounds(this.x, this.y, this.width, this.height, 'white', 1);  // Blue color and line width of 2
  }

  wrapAround() {// Screen wrapping logic
    if (this.x > canvasConfig.width) this.x = this.width * -1;
    if (this.x+this.width < 0) this.x = canvasConfig.width;
    if (this.y > canvasConfig.height) this.y = this.height * -1;
    if (this.y+this.height < 0) this.y = canvasConfig.height;
  }

  
  static generateVectorMap(size) {// generate vectorMap based on the asteroid size
    const sizeFactor = Asteroid.getSizeFactor(size);

    // Random number of points between 7 and 10
    const numPoints = Math.floor(Math.random() * 3) + 7;
    const points = [];

    // Generate random jagged points for the asteroid vectorMap
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2; // Divide the circle evenly

      // Increase the variability of the radius to make it more jagged
      const radius = sizeFactor + (Math.random() * sizeFactor * 0.6); // Adding more variation

      // Apply additional random variance to make the vectorMap more jagged
      const randomOffsetX = (Math.random() - 0.5) * sizeFactor * 0.2; // Small random offset on the X axis
      const randomOffsetY = (Math.random() - 0.5) * sizeFactor * 0.2; // Small random offset on the Y axis

      // Calculate X and Y positions with added random offsets
      const x = Math.cos(angle) * radius + randomOffsetX;
      const y = Math.sin(angle) * radius + randomOffsetY;

      points.push([x, y]);
    }

    return points;
  }

  // Determine size factor based on asteroid size
  static getSizeFactor(size) {
    switch (size) {
      case 'small':
        return 10; // Smaller radius
      case 'medium':
        return 20; // Medium radius
      case 'large':
        return 30; // Larger radius
      default:
        return 20; // Default to medium
    }
  }
}

export default Asteroid;

// Example usage
const smallAsteroid = new Asteroid(100, 100, 'small');
console.log('Small Asteroid:', smallAsteroid.vectorMap);

const mediumAsteroid = new Asteroid(200, 200, 'medium');
console.log('Medium Asteroid:', mediumAsteroid.vectorMap);

const largeAsteroid = new Asteroid(300, 300, 'large');
console.log('Large Asteroid:', largeAsteroid.vectorMap);
