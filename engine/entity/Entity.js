import Transform from './Transform.js';
import Velocity from './Velocity.js';
import Bounds from './Bounds.js';

export default class Entity {
    constructor({ transform = null, velocity = null, bounds = null } = {}) {
        this.transform = transform ?? new Transform();
        this.velocity = velocity ?? new Velocity();
        this.bounds = bounds ?? new Bounds();
    }

    snapshot() {
        this.transform.snapshot();
    }

    integrate(dtSeconds) {
        this.transform.position.x += this.velocity.x * dtSeconds;
        this.transform.position.y += this.velocity.y * dtSeconds;
    }
}
