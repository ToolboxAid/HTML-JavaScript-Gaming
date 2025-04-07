// ToolboxAid.com
// David Quesenberry
// 02/14/2025
// systemUtils.js

class SystemUtils {
    // Play your game normally: game.html
    // Enable debug mode: game.html?systemUtils
    static DEBUG = new URLSearchParams(window.location.search).has('systemUtils');

    /** Constructor for SystemUtils class.
    * @throws {Error} Always throws error as this is a utility class with only static methods.
    * @example
    * ❌ Don't do this:
    * const systemUtils = new SystemUtils(); // Throws Error
    * 
    * ✅ Do this:
    * SystemUtils.toCamelCase(...); // Use static methods directly
    */
    constructor() {
        throw new Error('SystemUtils is a utility class with only static methods. Do not instantiate.');
    }

    /** Misc */
    static toCamelCase(...args) {
        return args
            .join(' ') // Concatenate all arguments with a space in between
            .replace(/[^a-zA-Z0-9]+/g, ' ') // Convert special characters to spaces
            .trim() // Remove leading and trailing spaces
            .split(/\s+/) // Split into words
            .map((word, index) =>
                index === 0
                    ? word.toLowerCase() // Ensure first word is in lowercase
                    : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() // Capitalize subsequent words
            )
            .join(''); // Combine into camel case
    }

    static getObjectType(object) {
        if (!object || object === undefined) {
            return 'Null';
        }
        return object.constructor.name;
    }

    static validateConfig(name, config, schema) {
        if (!config) {
            console.group(`'${name}' Config Validation Failed`);
            console.error("Config is 'null' or 'undefined'");
            console.groupEnd();
            console.log("failed");
            return false;
        }

        if (!schema) {
            console.group(`'${name}' Config Validation Failed`);
            console.error("Schema is 'null' or 'undefined'");
            console.groupEnd();
            console.log("failed");
            return false;
        }

        if (this.DEBUG) {
            console.log(`Validating '${name}' Config: `, '\n', config, schema);
        }

        const failures = [];

        // Check all required fields
        for (const [field, expectedType] of Object.entries(schema)) {
            if (!(field in config)) {
                failures.push({
                    field,
                    error: 'missing',
                    expected: expectedType,
                    actual: 'undefined'
                });
                continue;
            }

            const actualType = typeof config[field];
            if (actualType !== expectedType) {
                failures.push({
                    field,
                    error: 'type',
                    expected: expectedType,
                    actual: actualType,
                    value: config[field]
                });
            }
        }

        if (failures.length > 0) {
            console.group(`'${name}' Config Validation Failed`);
            console.warn('Failed validations:', failures);
            console.table(failures);
            console.warn('Detailed errors:', failures.map(f =>
                `${f.field}: ${f.error === 'missing' ? 'Missing field' :
                    `Expected ${f.expected}, got ${f.actual} (${f.value})`}`));
            console.groupEnd();
            return false;
        }

        return true;
    }

    static numberToString(number, leadingCount = 5, leadingChar = '0') {
        // Convert number to string
        const numberStr = number.toString();
        if (numberStr.length > leadingCount) {
            leadingCount = numberStr.length;
        }
        const leadingLength = Math.max(0, leadingCount - numberStr.length); // Calculate number of leading characters needed
        const text = leadingChar.repeat(leadingLength) + numberStr; // Create text with leading characters

        return text;
        // // Ensure text length is exactly 5
        // const formattedText = text.padStart(leadingCount, leadingChar).slice(-leadingCount);
        // this.drawText(x, y, formattedText, pixelSize, color);

    }


    /** StackTrace Dump */
    static showStackTrace(text = '') {
        let trace = new Error(`'${text}':`);
        console.warn(trace);
        trace = null;
    }

    // TODO: All destroy() methods should use this to take advantage of error trapping
    /** Memory cleanup (anytime keyword 'new' is used) */
    static destroy(element) {
        // Check if element exists
        if (!element) {
            SystemUtils.showStackTrace(`Element is null or undefined`);
            return false;
        }

        // Check if destroy method exists
        if (typeof element.destroy !== "function") {
            SystemUtils.showStackTrace(`Element ${SystemUtils.getObjectType(element)} has no destroy method`);
            return false;
        }

        // Attempt to destroy
        try {
            if (!element.destroy()) {
                if (SystemUtils.DEBUG) {
                    SystemUtils.showStackTrace(`try - Failed to destroy "${SystemUtils.getObjectType(element)}" `);
                }
                return false;
            }

            return true;
        } catch (error) {
            SystemUtils.showStackTrace(`catch - Error destroying "${SystemUtils.getObjectType(element)}": `, error);
            return false;
        }
    }

    static cleanupArray(array) {
        if (!Array.isArray(array)) {
            console.warn(`Not an array:`, array);
            return false;
        }

        let success = true;

        try {
            for (let i = array.length - 1; i >= 0; i--) {
                const element = array[i];

                if (element !== null && typeof element.destroy === "function") {
                    if (!SystemUtils.destroy(element)) {
                        console.warn(`Failed to destroy element at index ${i}:`, element);
                        success = false;
                    }
                }

                array[i] = null; // Nullify to help garbage collection
            }

            array.length = 0;
        } catch (error) {
            console.error("Error in cleanupArray:", error);
            success = false;
        }

        return success;
    }

    static cleanupMap(map) {
        if (!(map instanceof Map)) {
            console.warn("Not a Map:", map);
            return false;
        }

        let success = true;
        try {
            for (const [key, value] of map.entries()) {
                if (typeof value.destroy === "function") {
                    if (!SystemUtils.destroy(value)) {
                        console.warn(`Failed to destroy MAP element with key: ${key}`);
                        success = false;
                    }
                }

                if (!map.delete(key)) {
                    console.warn(`Failed to delete MAP element with key: ${key}, value:`, value);
                }
            }
        } catch (error) {
            console.error("Error in cleanupMap:", error);
            success = false;
        }

        return success;
    }

}

export default SystemUtils;
