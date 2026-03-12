// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// physicsUtils.js

export default class PhysicsUtils {
    // Play your game normally: game.html
    // Enable debug mode: game.html?physicsUtils
    static DEBUG = new URLSearchParams(window.location.search).has('physicsUtils');

    /** Constructor for PhysicsUtils class.
    * @throws {Error} Always throws error as this is a utility class with only static methods.
    * @example
    * ❌ Don't do this:
    * const physicsUtils = new PhysicsUtils(); // Throws Error
    * 
    * ✅ Do this:
    * PhysicsUtils.applyGravity(...); // Use static methods directly
    */
    constructor() {
        throw new Error('PhysicsUtils is a utility class with only static methods. Do not instantiate.');
    }

    static getVelocityX(object) {
        if (object && typeof object.velocityX === 'number') {
            return object.velocityX;
        }

        return object?.xVelocity ?? 0;
    }

    static getVelocityY(object) {
        if (object && typeof object.velocityY === 'number') {
            return object.velocityY;
        }

        return object?.yVelocity ?? 0;
    }

    static assignVelocityX(object, value) {
        if (!object) {
            return;
        }

        if ('velocityX' in object) {
            object.velocityX = value;
        }

        if ('xVelocity' in object) {
            object.xVelocity = value;
        }

        if (!('velocityX' in object) && !('xVelocity' in object)) {
            object.velocityX = value;
        }
    }

    static assignVelocityY(object, value) {
        if (!object) {
            return;
        }

        if ('velocityY' in object) {
            object.velocityY = value;
        }

        if ('yVelocity' in object) {
            object.yVelocity = value;
        }

        if (!('velocityY' in object) && !('yVelocity' in object)) {
            object.velocityY = value;
        }
    }

    // Apply gravity to the object (e.g., spaceship) using the PhysicsUtils class
    static applyGravity(object, gravity = 9.81, deltaTime) {
        this.assignVelocityY(object, this.getVelocityY(object) + gravity * deltaTime);
    }// PhysicsUtils.applyGravity(spaceship, 9.81, deltaTime);  // Apply gravity of 9.81 units (default) over deltaTime


    // Apply wind force to the object (e.g., puck) using the PhysicsUtils class (or any constant horizontal force)
    static applyWind(object, windForce, deltaTime) {
        this.assignVelocityX(object, this.getVelocityX(object) + windForce * deltaTime);
    } // PhysicsUtils.applyWind(puck, 2.5, deltaTime);  // Apply a wind force of 2.5 units over deltaTime


    // Apply friction to the object (e.g., puck) using the PhysicsUtils class (to simulate surface resistance)
    static applyFriction(object, frictionCoefficient = 0.1) {
        this.assignVelocityX(object, this.getVelocityX(object) * (1 - frictionCoefficient));
        this.assignVelocityY(object, this.getVelocityY(object) * (1 - frictionCoefficient));
    }// PhysicsUtils.applyFriction(puck, 0.05);  // Apply friction with a coefficient of 0.05

    // Apply drag (resistance) to the object (e.g., spaceship) using the PhysicsUtils class (air or water resistance)
    static applyDrag(object, dragCoefficient = 0.05) {
        this.assignVelocityX(object, this.getVelocityX(object) * (1 - dragCoefficient));
        this.assignVelocityY(object, this.getVelocityY(object) * (1 - dragCoefficient));
    } // PhysicsUtils.applyDrag(spaceship, 0.1);  // Apply drag with a coefficient of 0.1

    // Apply bounce (elasticity) to the object (e.g., ball) using the PhysicsUtils class
    static applyBounce(object, elasticity = 0.9) {
        this.assignVelocityY(object, this.getVelocityY(object) * -elasticity);
    } // PhysicsUtils.applyBounce(ball, 0.8);  // Apply bounce with an elasticity of 0.8

    // Apply acceleration to the object (e.g., spaceship) using the PhysicsUtils class
    static applyAcceleration(object, acceleration, deltaTime) {
        this.assignVelocityX(object, this.getVelocityX(object) + acceleration.x * deltaTime);
        this.assignVelocityY(object, this.getVelocityY(object) + acceleration.y * deltaTime);
    } // PhysicsUtils.applyAcceleration(spaceship, acceleration, deltaTime);

    // Apply momentum to the object using the PhysicsUtils class - Apply Momentum (p = mv)
    static applyMomentum(object, mass) {
        object.momentumX = this.getVelocityX(object) * mass;
        object.momentumY = this.getVelocityY(object) * mass;
    } // PhysicsUtils.applyMomentum(object, mass);

    // Apply the impulse to the object using the PhysicsUtils class (a sudden change in velocity)
    static applyImpulse(object, impulse) {
        this.assignVelocityX(object, this.getVelocityX(object) + impulse.x);
        this.assignVelocityY(object, this.getVelocityY(object) + impulse.y);
    }// PhysicsUtils.applyImpulse(object, impulse);

    // Apply projectile motion to the object (considering/combined gravity and wind)
    static applyProjectileMotion(object, deltaTime) {
        this.applyGravity(object, 9.81, deltaTime);
        this.applyWind(object, 0, deltaTime); // No wind by default
        object.x += this.getVelocityX(object) * deltaTime;
        object.y += this.getVelocityY(object) * deltaTime;
    }// PhysicsUtils.applyProjectileMotion(projectile, deltaTime);

    // Apply spring force to the object (Hooke’s Law)
    static applySpringForce(object, springConstant, displacement) {
        let force = -springConstant * displacement;
        this.assignVelocityX(object, this.getVelocityX(object) + force);
    } // PhysicsUtils.applySpringForce(object, springConstant, displacement);

    // Apply kinematics to update position based on velocity (Position Update based on acceleration)
    static applyKinematics(object, deltaTime) {
        object.x += this.getVelocityX(object) * deltaTime;
        object.y += this.getVelocityY(object) * deltaTime;
    }// PhysicsUtils.applyKinematics(object, deltaTime);

    static getFutureCenterPoint(object, deltaTime = 1) {
        return {
            x: object.x + (object.width / 2) + (this.getVelocityX(object) * deltaTime),
            y: object.y + (object.height / 2) + (this.getVelocityY(object) * deltaTime)
        };
    }

    static getFutureTopLeftPoint(object, deltaTime = 1) {
        return {
            x: object.x + (this.getVelocityX(object) * deltaTime),
            y: object.y + (this.getVelocityY(object) * deltaTime)
        };
    }

    static getFutureTopRightPoint(object, deltaTime = 1) {
        return {
            x: object.x + object.width + (this.getVelocityX(object) * deltaTime),
            y: object.y + (this.getVelocityY(object) * deltaTime)
        };
    }

    static getFutureBottomLeftPoint(object, deltaTime = 1) {
        return {
            x: object.x + (this.getVelocityX(object) * deltaTime),
            y: object.y + object.height + (this.getVelocityY(object) * deltaTime)
        };
    }

    static getFutureBottomRightPoint(object, deltaTime = 1) {
        return {
            x: object.x + object.width + (this.getVelocityX(object) * deltaTime),
            y: object.y + object.height + (this.getVelocityY(object) * deltaTime)
        };
    }

    static getDirectionFromVelocity(velocityX = 0, velocityY = 0) {
        return {
            x: velocityX > 0 ? 'right' : velocityX < 0 ? 'left' : 'none',
            y: velocityY > 0 ? 'down' : velocityY < 0 ? 'up' : 'none'
        };
    }

    static setVelocity(object, velocityX, velocityY) {
        this.assignVelocityX(object, velocityX);
        this.assignVelocityY(object, velocityY);
    }

    static stop(object) {
        this.setVelocity(object, 0, 0);
    }

}
