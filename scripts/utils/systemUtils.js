// ToolboxAid.com
// David Quesenberry
// 02/14/2025
// systemUtils.js

class SystemUtils {
    // Play your game normally: game.html
    // Enable debug mode: game.html?systemUtils
    static DEBUG = new URLSearchParams(window.location.search).has('systemUtils');

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

    /** StackTrace Dump */
    static showStackTrace(text = '') {
        let trace = new Error(`'${text}':`);
        console.log(trace);
        trace = null;
    }

    /** Memory cleanup (anytime keyword 'new' is used) */
    static destroy(element) {
        if (element && typeof element.destroy === "function") {
            try {
                element.destroy();
                return true; // Explicitly return true on success
            } catch (error) {
                console.error("Error during destroy:", error);
                return false; // Explicitly return false on failure
            }
        }
        return false; // Return false if no destroy method exists
    }

    static cleanupArray(array) {
        let success = true;

        if (!Array.isArray(array)) {
            console.warn(`Not an array:`, array);
            return false;
        }

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
