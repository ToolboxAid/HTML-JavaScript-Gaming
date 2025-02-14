// ToolboxAid.com
// David Quesenberry
// 11/19/2024
// asteroid.js

import ObjectVector from '../scripts/objectVector.js';

import RandomUtils from '../scripts/math/randomUtils.js';
import CollisionUtils from '../scripts/physics/collisionUtils.js'; // do not delete, part of below test

class Asteroid extends ObjectVector {
  constructor(x, y, size = 'large') {
    const vectorMap = Asteroid.generateVectorMap(size);
    const vectorMap1 = [[10, 40], [50, 20], [45, 5], [25, -10], [50, -35], [30, -45], [10, -38], [-20, -45], [-43, -18], [-43, 20], [-25, 20], [-25, 40],];
    const speed = 100;
    // Ensure the vectorMap has at least three points
    if (vectorMap.length < 3) {
      throw new Error("'vectorMap' frame must contain at least three points.");
    }

    const velocityX = Asteroid.randomRange(size) * speed;
    const velocityY = Asteroid.randomRange(size) * speed;

    // Initialize the parent class with the generated vectorMap
    super(x, y, vectorMap, velocityX, velocityY);  // Pass vectorMap here

    this.size = size;

    this.velocityRotation = (Math.random() - 0.5) * 8;
  }

  static randomRange(size) {

    // Random velocity
    let min = 0.25;
    let max = 0.50;
    
    switch (size) {
      case 'small':
        min *= 2;
        max *= 4;
        break;
      case 'medium':
        min *= 1.5;
        max *= 2; 
        break;
      case 'large':
        min *= 1;
        max *= 1; 
        break;
      default:
        console.error("Invalid size. Use 'small', 'medium', or 'large'.");
        min *= 0;
        max *= 0; 
        break;
    }

    const random = RandomUtils.randomRange(min, max, false);
    const sign = RandomUtils.randomRange(0, 1, true) < 0.5 ? -1 : 1;
    return random * sign;
  }

  update(deltaTime) {
    this.rotationAngle += this.velocityRotation;
    super.update(deltaTime);
    this.wrapAround();
  }

  static generateVectorMap(size) {
    const sizeFactor = Asteroid.getSizeFactor(size);

    // Random number of points between 10 and 12
    const numPoints = Math.floor(Math.random() * 3) + 10;
    const points = [];

    // Generate random jagged points for the asteroid vectorMap
    let currentAngle = 0;
    for (let i = 0; i < numPoints; i++) {
      // Increment angle by a random step to create irregular intervals
      const angleStep = (Math.PI * 2) / numPoints + Math.random() * 0.4 - 0.2;
      currentAngle += angleStep;

      // Increase the variability of the radius to make it more jagged
      const radius = sizeFactor + (Math.random() * sizeFactor * 0.8);

      // Calculate X and Y positions
      const x = Math.cos(currentAngle) * radius;
      const y = Math.sin(currentAngle) * radius;

      points.push([x, y]);
    }
    //points.push([0, 0]);

    return points;
  }

  static generateVectorMap1(size) {// old generate vectorMap based on the asteroid size
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

  static getSizeFactor(size) {  // Determine size factor based on asteroid size
    switch (size) {
      case 'small':
        return 6; // Smaller radius
      case 'medium':
        return 12; // Medium radius
      case 'large':
        return 18; // Larger radius
      default:
        return 16; // Default to medium
    }
  }
}

export default Asteroid;

// Example usage and tests
if (false) {
  const smallAsteroid = new Asteroid(100, 100, 'small');
  console.log('Small Asteroid:', smallAsteroid);

  const mediumAsteroid = new Asteroid(200, 200, 'medium');
  console.log('Medium Asteroid:', mediumAsteroid);

  const largeAsteroid = new Asteroid(300, 300, 'large');
  console.log('Large Asteroid:', largeAsteroid);

  // Collusion test
  const otherObject = new Asteroid(205, 205, 'small');
  otherObject.rotationAngle = -30; // Example rotation for the other object

  if (mediumAsteroid.collisionDetection(otherObject)) {
    console.log("Collision detected!");
  } else {
    console.log("No collision.");
  }
  if (smallAsteroid.collisionDetection(otherObject)) {
    console.log("Collision detected!");
  } else {
    console.log("No collision.");
  }

}