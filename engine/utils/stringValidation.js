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
}

export default StringValidation;
