// ToolboxAid.com
// David Quesenberry
// 03/08/2026
// objectValidation.js

import NumberUtils from '../math/numberUtils.js';

class ObjectValidation {
    constructor() {
        throw new Error('ObjectValidation is a utility class with only static methods. Do not instantiate.');
    }

    static boolean(value, name = 'value') {
        if (typeof value !== 'boolean') {
            throw new Error(`${name} must be a boolean.`);
        }
    }

    static array(value, name = 'value') {
        if (!Array.isArray(value)) {
            throw new Error(`${name} must be an array.`);
        }
    }

    static pointArray(value, name = 'value') {
        this.array(value, name);

        const isValid = value.every(point =>
            Array.isArray(point) &&
            point.length === 2 &&
            NumberUtils.areFiniteNumbers(point)
        );

        if (!isValid) {
            throw new Error(`${name} must be an array of [x, y] numeric pairs.`);
        }
    }

    static oneOf(value, name = 'value', validValues = []) {
        this.array(validValues, 'validValues');

        if (validValues.length === 0) {
            throw new Error(`validValues must be a non-empty array.`);
        }

        if (!validValues.includes(value)) {
            throw new Error(`${name} must be one of: ${validValues.join(', ')}`);
        }
    }

    static instanceOf(value, name = 'value', expectedType) {
        if (typeof expectedType !== 'function') {
            throw new Error(`expectedType must be a class or constructor.`);
        }

        if (!(value instanceof expectedType)) {
            throw new Error(`${name} must be an instance of ${expectedType.name}.`);
        }
    }
}

export default ObjectValidation;
