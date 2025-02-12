

class SystemUtils {
    /** Misc */
    static toCamelCase(...args) {
        return args
            .join(' ') // Concatenate all arguments with a space in between
            .toLowerCase() // Convert to lowercase
            .replace(/[^a-z0-9\s]/g, '') // Remove special characters
            .trim() // Remove leading and trailing spaces
            .split(/\s+/) // Split into words
            .map((word, index) =>
                index === 0
                    ? word // First word remains lowercase
                    : word.charAt(0).toUpperCase() + word.slice(1) // Capitalize subsequent words
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

        console.log(`Validating '${name}' Config: `, '\n', config, schema);
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
                `${f.field}: ${f.error === 'missing' ?
                    'Missing field' :
                    `Expected ${f.expected}, got ${f.actual} (${f.value})`}`
            ));
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

    /** Memory cleanup (anytime keyword 'new' is used */
    static destroy(item) {
        if (!item) return null;
        try {
            if (typeof item?.destroy === 'function') {
                item.destroy();
            }
            return null;
        } catch (error) {
            console.error("Destroy failed:", error);
            return item;
        }
    }

    static cleanupArray(array) {
        if (!Array.isArray(array)) return false;
        let success = true;

        try {
            for (let i = array.length - 1; i >= 0; i--) {
                if (!SystemUtils.destroy(array[i])) {
                    success = false;
                }
                array[i] = null;
            }
            array.length = 0;
        } catch (error) {
            console.error("Cleanup Array:", error);
            success = false;
        }

        return success;
    }

    static cleanupMap(map) {
        if (!(map instanceof Map)) return false;
        let success = true;

        try {
            for (const [key, item] of map) {
                if (!SystemUtils.destroy(item)) {
                    success = false;
                }
                map.delete(key);
            }
        } catch (error) {
            console.error("Cleanup Map:", error);
            success = false;
        }

        return success;
    }

}

export default SystemUtils;