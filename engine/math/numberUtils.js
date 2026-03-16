// ToolboxAid.com
// David Quesenberry
// 03/16/2026
// numberUtils.js

class NumberUtils {
    static isFiniteNumber(value) {
        return Number.isFinite(value);
    }

    static finiteNumber(value, name = 'value') {
        if (!this.isFiniteNumber(value)) {
            throw new Error(`${name} must be a finite number.`);
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
