// ToolboxAid.com
// David Quesenberry
// 03/16/2026
// numberUtils.js

class NumberUtils {
    static isFiniteNumber(value) {
        return Number.isFinite(value);
    }

    static isNonNegativeFinite(value) {
        return Number.isFinite(value) && value >= 0;
    }

    static isPositiveFinite(value) {
        return Number.isFinite(value) && value > 0;
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
