// ToolboxAid.com
// David Quesenberry
// 03/16/2026
// stringValidation.js

class StringValidation {
    constructor() {
        throw new Error('StringValidation is a utility class with only static methods. Do not instantiate.');
    }

    static nonEmptyString(value, name = 'value') {
        if (typeof value !== 'string' || value.trim() === '') {
            throw new Error(`${name} must be a non-empty string.`);
        }
    }

    static oneOfString(value, name = 'value', validValues = []) {
        this.nonEmptyString(value, name);

        if (!Array.isArray(validValues) || validValues.length === 0) {
            throw new Error('validValues must be a non-empty array.');
        }

        if (!validValues.every((entry) => typeof entry === 'string')) {
            throw new Error('validValues must contain only strings.');
        }

        if (!validValues.includes(value)) {
            throw new Error(`${name} must be one of: ${validValues.join(', ')}.`);
        }
    }
}

export default StringValidation;
