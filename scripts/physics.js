// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// physics.js

export default class Physics {
    constructor() {
        throw new Error("'Physics' has only static methods.");
    }

    // Apply gravity to the object (e.g., spaceship) using the Physics class
    static applyGravity(object, gravity = 9.81, deltaTime) {
        object.yVelocity += gravity * deltaTime;
    }// Physics.applyGravity(spaceship, 9.81, deltaTime);  // Apply gravity of 9.81 units (default) over deltaTime


    // Apply wind force to the object (e.g., puck) using the Physics class (or any constant horizontal force)
    static applyWind(object, windForce, deltaTime) {
        object.xVelocity += windForce * deltaTime;
    } // Physics.applyWind(puck, 2.5, deltaTime);  // Apply a wind force of 2.5 units over deltaTime


    // Apply friction to the object (e.g., puck) using the Physics class (to simulate surface resistance)
    static applyFriction(object, frictionCoefficient = 0.1) {
        object.xVelocity *= (1 - frictionCoefficient);
        object.yVelocity *= (1 - frictionCoefficient);
    }// Physics.applyFriction(puck, 0.05);  // Apply friction with a coefficient of 0.05

    // Apply bounce (elasticity) to the object (e.g., ball) using the Physics class
    static applyBounce(object, elasticity = 0.9) {
        object.yVelocity *= -elasticity;
    } // Physics.applyBounce(ball, 0.8);  // Apply bounce with an elasticity of 0.8

    // Apply drag (resistance) to the object (e.g., spaceship) using the Physics class (air or water resistance)
    static applyDrag(object, dragCoefficient = 0.05) {
        object.xVelocity *= (1 - dragCoefficient);
        object.yVelocity *= (1 - dragCoefficient);
    } // Physics.applyDrag(spaceship, 0.1);  // Apply drag with a coefficient of 0.1

    // Apply acceleration to the object (e.g., spaceship) using the Physics class
    static applyAcceleration(object, acceleration, deltaTime) {
        object.xVelocity += acceleration.x * deltaTime;
        object.yVelocity += acceleration.y * deltaTime;
    } // Physics.applyAcceleration(spaceship, acceleration, deltaTime);

    // Applies rotation to the object based on its angular velocity and the elapsed time (deltaTime).
    static applyRotation(object, angularVelocity, deltaTime) {
        object.rotation += angularVelocity * deltaTime;
    }// Physics.applyRotation(spaceship, spaceship.angularVelocity, deltaTime);

    // Apply Rotation (around the origin)
    static applyRotationToPoint(originalX, originalY, rotationAngle) {
        // Convert the angle to radians
        const radians = (rotationAngle * Math.PI) / 180;

        // Apply the rotation formula
        const rotatedX = originalX * Math.cos(radians) - originalY * Math.sin(radians);
        const rotatedY = originalX * Math.sin(radians) + originalY * Math.cos(radians);

        // Return the rotated coordinates
        return { rotatedX, rotatedY };
    }  // const rotatedPoint = Physics.applyRotationToPoint(originalX, originalY, rotationAngle);

    // Apply momentum to the object using the Physics class - Apply Momentum (p = mv)
    static applyMomentum(object, mass) {
        object.momentumX = object.xVelocity * mass;
        object.momentumY = object.yVelocity * mass;
    } // Physics.applyMomentum(object, mass);

    // Apply the impulse to the object using the Physics class (a sudden change in velocity)
    static applyImpulse(object, impulse) {
        object.xVelocity += impulse.x;
        object.yVelocity += impulse.y;
    }// Physics.applyImpulse(object, impulse);

    // Apply projectile motion to the object (considering/combined gravity and wind)
    static applyProjectileMotion(object, deltaTime) {
        this.applyGravity(object, 9.81, deltaTime);
        this.applyWind(object, 0, deltaTime); // No wind by default
        object.x += object.xVelocity * deltaTime;
        object.y += object.yVelocity * deltaTime;
    }// Physics.applyProjectileMotion(projectile, deltaTime);


    // Apply spring force to the object (Hooke’s Law)
    static applySpringForce(object, springConstant, displacement) {
        let force = -springConstant * displacement;
        object.xVelocity += force;
    } // Physics.applySpringForce(object, springConstant, displacement);

    // Apply kinematics to update position based on velocity (Position Update based on acceleration)
    static applyKinematics(object, deltaTime) {
        object.x += object.xVelocity * deltaTime;
        object.y += object.yVelocity * deltaTime;
    }// Physics.applyKinematics(object, deltaTime);

}
