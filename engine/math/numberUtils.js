// ToolboxAid.com
// David Quesenberry
// 03/16/2026
// numberUtils.js

class NumberUtils {
    static isFiniteNumber(value) {
        return Number.isFinite(value);
    }

    static isInteger(value) {
        return Number.isInteger(value);
    }

    static isNonNegativeInteger(value) {
        return Number.isInteger(value) && value >= 0;
    }

    static isPositiveInteger(value) {
        return Number.isInteger(value) && value > 0;
    }

    static finiteNumber(value, name = 'value') {
        if (!this.isFiniteNumber(value)) {
            throw new Error(`${name} must be a finite number.`);
        }
    }

    static integer(value, name = 'value') {
        if (!this.isInteger(value)) {
            throw new Error(`${name} must be an integer.`);
        }
    }

    static isNonNegativeFinite(value) {
        return Number.isFinite(value) && value >= 0;
    }

    static isPositiveFinite(value) {
        return Number.isFinite(value) && value > 0;
    }

    static positiveNumber(value, name = 'value') {
        this.finiteNumber(value, name);

        if (value <= 0) {
            throw new Error(`${name} must be a positive number.`);
        }
    }

    static nonNegativeInteger(value, name = 'value') {
        if (!this.isNonNegativeInteger(value)) {
            throw new Error(`${name} must be a non-negative integer.`);
        }
    }

    static positiveInteger(value, name = 'value') {
        if (!this.isPositiveInteger(value)) {
            throw new Error(`${name} must be a positive integer.`);
        }
    }

    static normalizeFinite(value, fallback = 0) {
        return this.isFiniteNumber(value) ? value : fallback;
    }

    static normalizeNonNegative(value, fallback = 0) {
        return this.isNonNegativeFinite(value) ? value : fallback;
    }

    static normalizePositive(value, fallback = 1) {
        return this.isPositiveFinite(value) ? value : fallback;
    }

    static clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }

    static areFiniteNumbers(values = []) {
        for (let index = 0; index < values.length; index++) {
            if (!this.isFiniteNumber(values[index])) {
                return false;
            }
        }

        return true;
    }
}

export default NumberUtils;
