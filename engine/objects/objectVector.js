// ToolboxAid.com
// David Quesenberry
// 11/19/2024
// objectVector.js

import ObjectKillable from './objectKillable.js';
import CanvasUtils from '../canvas.js';
import CollisionUtils from '../physics/collisionUtils.js';
import VectorShapeUtils from '../physics/vectorShapeUtils.js';
import ObjectValidation from '../utils/objectValidation.js';
import ObjectCleanup from '../utils/objectCleanup.js';
import ObjectDebug from '../utils/objectDebug.js';
import VectorRenderer from '../renderers/vectorRenderer.js';

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
        return VectorShapeUtils.calculateInitialBounds(vectorMap);
    }

    calculateObjectBounds(vectorMap) {
        if (!vectorMap || vectorMap.length === 0) {
            throw new Error('vectorMap is required to calculate object bounds.');
        }

        const transformedShape = VectorShapeUtils.calculateTransformedShape(
            vectorMap,
            this.x,
            this.y,
            this.rotationAngle
        );

        this.boundX = transformedShape.bounds.x;
        this.boundY = transformedShape.bounds.y;
        this.boundWidth = transformedShape.bounds.width;
        this.boundHeight = transformedShape.bounds.height;
        this.rotatedPoints = transformedShape.rotatedPoints;
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
        try {
            VectorRenderer.draw(this, lineWidth, offsetX, offsetY);
        } catch (error) {
            console.error('Error occurred while drawing:', error.message);
            console.log('Object state:', this);
        }
    }

    collisionDetection(object, debug = false) {
        if (debug) {
            console.log(object);
        }

        return CollisionUtils.vectorIntersectsVector(this, object);
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
