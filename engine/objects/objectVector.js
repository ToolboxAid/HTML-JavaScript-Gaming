// ToolboxAid.com
// David Quesenberry
// 11/19/2024
// objectVector.js

import ObjectKillable from './objectKillable.js';
import BoundaryUtils from '../physics/boundaryUtils.js';
import CollisionUtils from '../physics/collisionUtils.js';
import VectorShapeUtils from '../physics/vectorShapeUtils.js';
import NumberUtils from '../math/numberUtils.js';
import ObjectValidation from '../utils/objectValidation.js';
import StringValidation from '../utils/stringValidation.js';
import ObjectCleanup from '../utils/objectCleanup.js';
import DebugLog from '../utils/debugLog.js';
import DebugFlag from '../utils/debugFlag.js';
import ObjectDestroyUtils from './objectDestroyUtils.js';
import VectorRenderer from '../renderers/vectorRenderer.js';

class ObjectVector extends ObjectKillable {
    static DEBUG = DebugFlag.has('objectVector');

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

        DebugLog.log(ObjectVector.DEBUG, null, 'Created ObjectVector', {
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
        NumberUtils.finiteNumber(angle, 'angle');
        this.rotationAngle = angle;
        this.calculateObjectBounds(this.vectorMap);
    }

    setColor(color) {
        StringValidation.nonEmptyString(color, 'color');
        this.color = color;
    }

    setDrawBounds(enabled = true) {
        this.drawBounds = Boolean(enabled);
    }

    checkWrapAround() {
        const wrapped = BoundaryUtils.applyWrapAround(this, this.margin);

        if (!wrapped) {
            return;
        }

        this.calculateObjectBounds(this.vectorMap);
    }

    update(deltaTime = 1, incFrame = false) {
        super.update(deltaTime, incFrame);

        if (this.isDestroyed || !this.vectorMap) {
            return;
        }

        this.calculateObjectBounds(this.vectorMap);
    }

    draw(lineWidth = 1.25, offsetX = 0, offsetY = 0) {
        try {
            VectorRenderer.draw(this, lineWidth, offsetX, offsetY);
        } catch (error) {
            DebugLog.error('ObjectVector', 'Error occurred while drawing:', error.message);
            DebugLog.log(ObjectVector.DEBUG, 'ObjectVector', 'Object state:', this);
        }
    }

    collisionDetection(object, debug = false) {
        if (debug) {
            DebugLog.log(true, 'ObjectVector', object);
        }

        return CollisionUtils.vectorIntersectsVector(this, object);
    }

    destroy() {
        if (ObjectDestroyUtils.shouldSkipDestroy(this, ObjectVector.DEBUG, 'ObjectVector')) {
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

