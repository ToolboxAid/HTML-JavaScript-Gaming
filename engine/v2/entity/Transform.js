export default class Transform {
    constructor({ x = 0, y = 0 } = {}) {
        this.position = { x, y };
        this.previousPosition = { x, y };
    }

    snapshot() {
        this.previousPosition.x = this.position.x;
        this.previousPosition.y = this.position.y;
    }

    setPosition(x, y) {
        this.position.x = x;
        this.position.y = y;
    }
}
