/*
Toolbox Aid
David Quesenberry
03/21/2026
Bounds.js
*/
export default class Bounds {
    constructor({ width = 0, height = 0 } = {}) {
        this.width = width;
        this.height = height;
    }

    clampCenter(position, area) {
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;
        const minX = area.x + halfWidth;
        const maxX = area.x + area.width - halfWidth;
        const minY = area.y + halfHeight;
        const maxY = area.y + area.height - halfHeight;

        position.x = Math.max(minX, Math.min(maxX, position.x));
        position.y = Math.max(minY, Math.min(maxY, position.y));
        return position;
    }
}
