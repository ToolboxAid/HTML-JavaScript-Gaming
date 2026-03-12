// ToolboxAid.com
// David Quesenberry
// 11/19/2024
// objectVector.js

import ObjectKillable from './objectKillable.js';
import CanvasUtils from '../canvas.js';
import AngleUtils from '../math/angleUtils.js';
import CollisionUtils from '../physics/collisionUtils.js';
import SystemUtils from '../utils/systemUtils.js';
import ObjectValidation from '../utils/objectValidation.js';
import ObjectCleanup from '../utils/objectCleanup.js';
import ObjectDebug from '../utils/objectDebug.js';

class ObjectVector extends ObjectKillable {
    static DEBUG = new URLSearchParams(window.location.search).has('objectVector');

    constructor(x = 0, y = 0, vectorMap, velocityX = 0, velocityY = 0) {
        ObjectValidation.pointArray(vectorMap, 'vectorMap');

        const bounds = ObjectVector.calculateInitialBounds(vectorMap);

        super(
            x,
            y,
            Math.max(1, bounds.width),
            Math.max(1, bounds.height),
            velocityX,
            velocityY
        );

        this.color = 'white';
        this.rotationAngle = 0;
        this.vectorMap = vectorMap.map(([vx, vy]) => [vx, vy]);

        this.drawBounds = false;

        this.boundX = 0;
        this.boundY = 0;
        this.boundWidth = 0;
        this.boundHeight = 0;

        this.rotatedPoints = [];

        this.calculateObjectBounds(this.vectorMap);

        this.width = Math.max(1, this.boundWidth);
        this.height = Math.max(1, this.boundHeight);

        this.margin = Math.max(this.width, this.height) * 0.1;
        this.explosionRadius = ((this.width + this.height) / 2) * 2;

        ObjectDebug.log(ObjectVector.DEBUG, 'Created ObjectVector', {
            x,
            y,
            bounds,
            width: this.width,
            height: this.height
        });
    }

    static calculateInitialBounds(vectorMap) {
        const xs = vectorMap.map(([x]) => x);
        const ys = vectorMap.map(([, y]) => y);

        return {
            width: Math.max(...xs) - Math.min(...xs),
            height: Math.max(...ys) - Math.min(...ys)
        };
    }

    calculateObjectBounds(vectorMap) {
        if (!vectorMap || vectorMap.length === 0) {
            throw new Error('vectorMap is required to calculate object bounds.');
        }

        const centerX = vectorMap.reduce((sum, [vx]) => sum + vx, 0) / vectorMap.length;
        const centerY = vectorMap.reduce((sum, [, vy]) => sum + vy, 0) / vectorMap.length;

        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;

        const rotatedPoints = vectorMap.map(([vx, vy]) => {
            const dx = vx - centerX;
            const dy = vy - centerY;

            const rotatedPoint = AngleUtils.applyRotationToPoint(dx, dy, this.rotationAngle);

            const finalX = rotatedPoint.rotatedX + this.x;
            const finalY = rotatedPoint.rotatedY + this.y;

            minX = Math.min(minX, finalX);
            maxX = Math.max(maxX, finalX);
            minY = Math.min(minY, finalY);
            maxY = Math.max(maxY, finalY);

            return [finalX, finalY];
        });

        this.boundX = Math.floor(minX);
        this.boundY = Math.floor(minY);
        this.boundWidth = Math.max(1, Math.ceil(maxX - minX));
        this.boundHeight = Math.max(1, Math.ceil(maxY - minY));
        this.rotatedPoints = rotatedPoints;
    }

    setRotationAngle(angle) {
        ObjectValidation.finiteNumber(angle, 'angle');
        this.rotationAngle = angle;
        this.calculateObjectBounds(this.vectorMap);
    }

    setColor(color) {
        ObjectValidation.nonEmptyString(color, 'color');
        this.color = color;
    }

    setDrawBounds(enabled = true) {
        this.drawBounds = Boolean(enabled);
    }

    checkWrapAround() {
        const boundaries = CollisionUtils.getCompletelyOffScreenSides(this, this.margin);

        if (!boundaries || boundaries.length === 0) {
            return;
        }

        const halfWidth = (this.boundWidth ?? this.width) / 2;
        const halfHeight = (this.boundHeight ?? this.height) / 2;

        if (boundaries.includes('left')) {
            this.x = CanvasUtils.getConfigWidth() + halfWidth;
        }

        if (boundaries.includes('right')) {
            this.x = -halfWidth;
        }

        if (boundaries.includes('top')) {
            this.y = CanvasUtils.getConfigHeight() + halfHeight;
        }

        if (boundaries.includes('bottom')) {
            this.y = -halfHeight;
        }

        this.calculateObjectBounds(this.vectorMap);
    }

    update(deltaTime = 1, incFrame = false) {
        super.update(deltaTime, incFrame);
        this.calculateObjectBounds(this.vectorMap);
    }

    draw(lineWidth = 1.25, offsetX = 0, offsetY = 0) {
        if (this.isDestroyed || !this.isAlive()) {
            return;
        }

        try {
            if (!this.rotatedPoints || this.rotatedPoints.length === 0) {
                console.error('Rotated points are not available.');
                return;
            }

            CanvasUtils.ctx.beginPath();
            CanvasUtils.ctx.strokeStyle = this.color;
            CanvasUtils.ctx.lineWidth = lineWidth;

            this.rotatedPoints.forEach(([rx, ry], index) => {
                if (index === 0) {
                    CanvasUtils.ctx.moveTo(rx + offsetX, ry + offsetY);
                } else {
                    CanvasUtils.ctx.lineTo(rx + offsetX, ry + offsetY);
                }
            });

            CanvasUtils.ctx.closePath();
            CanvasUtils.ctx.stroke();

            if (this.drawBounds) {
                CanvasUtils.drawCircle2(this.x + offsetX, this.y + offsetY, 2, 'white');
                CanvasUtils.drawBounds(
                    this.boundX + offsetX,
                    this.boundY + offsetY,
                    this.boundWidth,
                    this.boundHeight,
                    'white',
                    lineWidth
                );
            }
        } catch (error) {
            console.error('Error occurred while drawing:', error.message);
            console.log('Object state:', this);
        }
    }

    collisionDetection(object, debug = false) {
        if (!object || !Array.isArray(object.rotatedPoints) || !Array.isArray(this.rotatedPoints)) {
            return false;
        }

        if (debug) {
            console.log(object);
        }

        for (const [pointX, pointY] of object.rotatedPoints) {
            if (CollisionUtils.isPointInsidePolygon(pointX, pointY, this.rotatedPoints)) {
                return true;
            }
        }

        for (const [pointX, pointY] of this.rotatedPoints) {
            if (CollisionUtils.isPointInsidePolygon(pointX, pointY, object.rotatedPoints)) {
                return true;
            }
        }

        return false;
    }

    destroy() {
        if (this.isDestroyed) {
            return false;
        }

        ObjectCleanup.cleanupAndNullifyArray(this, 'vectorMap');
        ObjectCleanup.cleanupAndNullifyArray(this, 'rotatedPoints');

        this.destroyProperties([
            'color',
            'rotationAngle',
            'drawBounds',
            'boundX',
            'boundY',
            'boundWidth',
            'boundHeight',
            'margin',
            'explosionRadius'
        ]);

        return super.destroy();
    }
}

export default ObjectVector;