// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// physics.js

export default class Physics {
//    constructor() {}

    // Apply Gravity
    static applyGravity(object, gravity = 9.81, deltaTime) {
        object.yVelocity += gravity * deltaTime;
    }

    // Apply Wind (or any constant horizontal force)
    static applyWind(object, windForce, deltaTime) {
        object.xVelocity += windForce * deltaTime;
    }

    // Apply Friction (to simulate surface resistance)
    static applyFriction(object, frictionCoefficient = 0.1) {
        object.xVelocity *= (1 - frictionCoefficient);
        object.yVelocity *= (1 - frictionCoefficient);
    }

    // Apply Elasticity (Bounce)
    static applyBounce(object, elasticity = 0.9) {
        object.yVelocity *= -elasticity;
    }

    // Apply Drag (air or water resistance)
    static applyDrag(object, dragCoefficient = 0.05) {
        object.xVelocity *= (1 - dragCoefficient);
        object.yVelocity *= (1 - dragCoefficient);
    }

    // Apply Acceleration
    static applyAcceleration(object, acceleration, deltaTime) {
        object.xVelocity += acceleration.x * deltaTime;
        object.yVelocity += acceleration.y * deltaTime;
    }

    // Apply Angular Motion (Rotation)
    static applyRotation(object, angularVelocity, deltaTime) {
        object.rotation += angularVelocity * deltaTime;
    }

    // Apply Momentum (p = mv)
    static applyMomentum(object, mass) {
        object.momentumX = object.xVelocity * mass;
        object.momentumY = object.yVelocity * mass;
    }

    // Apply Impulse (a sudden change in velocity)
    static applyImpulse(object, impulse) {
        object.xVelocity += impulse.x;
        object.yVelocity += impulse.y;
    }

    // Projectile Motion (combined gravity and wind)
    static applyProjectileMotion(object, deltaTime) {
        this.applyGravity(object, 9.81, deltaTime);
        this.applyWind(object, 0, deltaTime); // No wind by default
        object.x += object.xVelocity * deltaTime;
        object.y += object.yVelocity * deltaTime;
    }

    // Apply Spring Force (Hooke’s Law)
    static applySpringForce(object, springConstant, displacement) {
        let force = -springConstant * displacement;
        object.xVelocity += force;
    }

    // Kinematics (Position Update based on acceleration)
    static applyKinematics(object, deltaTime) {
        object.x += object.xVelocity * deltaTime;
        object.y += object.yVelocity * deltaTime;
    }
}



/*
// game.js
import Physics from './physics.js';

// Create an instance of the Physics class
const physics = new Physics(9.81, 0.05); // Gravity and wind

// Example object to apply physics on
const puck = {
    xVelocity: 2,
    yVelocity: 0,
    updatePosition() {
        this.x += this.xVelocity;
        this.y += this.yVelocity;
    },
    draw() {
        // Drawing logic here
    }
};

// In your game loop
function gameLoop(deltaTime) {
    // Apply gravity and wind to the puck
    physics.applyForces(puck, deltaTime);

    // Update puck's position based on its velocity
    puck.updatePosition();

    // Draw puck
    puck.draw();
}

*/