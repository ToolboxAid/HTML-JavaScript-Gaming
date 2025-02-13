class SystemUtils {
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
        if (element && element.destroy) {
            try {
                element.destroy(); // Clean up the element as intended
                return true; // Ensure this is `true`
            } catch (error) {
                console.error("Error during destroy:", error);
                return false; // Return false only on error
            }
        }
        return false; // Return false if no destroy method exists
    }
    
    static cleanupArray(array) {
        let success = true;
    
        if (!Array.isArray(array)) {
            console.warn(`Not an array:`, array);
            return false; // Ensure the return is false if it's not an array
        }
    
        try {
            for (let i = array.length - 1; i >= 0; i--) {
                const element = array[i];
                
                // If element has a destroy method, call it
                if (SystemUtils.destroy(element) !== true) {
                    console.warn(`Failed to destroy element at index ${i}`);
                    success = false; // Flag failure if the destroy failed
                }
    
                array[i] = null; // Set the element to null after attempting to destroy it
            }
    
            array.length = 0; // Ensure the array is emptied
        } catch (error) {
            console.error("Error in cleanupArray:", error);
            success = false;
        }
    
        return success; // Return whether the cleanup was successful
    }
    
    static cleanupMap(map) {
        let success = true;
        if (!(map instanceof Map)) {
            console.warn(`not an instance of Map: ${map}`);
            return success; // Return true since the map wasn't valid
        }
    
        try {
            for (const [key, element] of map) {
                // Check if destroy exists on the element
                if (element && typeof element.destroy === 'function') {
                    const result = SystemUtils.destroy(element);
                    if (!result) {
                        console.warn(`Failed to destroy MAP element with key: ${key}`);
                        success = false;
                    }
                } else {
                    console.warn(`Element at key ${key} doesn't have a 'destroy' method.`);
                    success = false;
                }
    
                // After attempting to destroy, delete the element from the map
                map.delete(key);
            }
        } catch (error) {
            console.error("Error during map cleanup:", error);
            success = false;
        }
    
        return success;
    }
    

}

export default SystemUtils;
