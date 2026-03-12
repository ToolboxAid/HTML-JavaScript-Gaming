// ToolboxAid.com
// David Quesenberry
// 02/12/2025
// runTests.js

export function runTests(moduleName, testFunction) {
    console.log(`Running tests for ${moduleName}...`);

    let logged = false;
    try {
        // Create a simple assert function
        const assert = (condition, message) => {
            if (!condition) {
                const error = new Error(message);
                console.error(`%c❌'${moduleName}' failed test '${message}' \n ${error.stack}`, 'color: red');
                logged = true;
                throw error; // skip "passed" log.
            }
        };

        // Run the test function with assert passed as an argument
        testFunction(assert);
        console.log(`%c✅${moduleName} passed! `, 'color: green');
    } catch (error) {
        // Catch non-test/assert thrown and output the error details
        if (!logged) {
            console.error(`%c❌'${moduleName}' exception: '${error.message}' \n ${error.stack}`, 'color: red');
        }
    }
}

/*
// Override console.log
console.log = function() {};  // Disable console.log

// Log does not work
console.log("This won't appear");  // Does nothing

// Warn and error still work
console.warn("This is a warning!");  // Will print to console
console.error("This is an error!");  // Will print to console

// Other logging levels
console.info(message1, message2, ...)
console.debug(message1, message2, ...)
console.trace(message1, message2, ...)

console.assert(1 === 1, "This won't be shown because the condition is true");
console.assert(1 === 2, "This will show because the condition is false");

console.count("counter");  // counter: 1
console.count("counter");  // counter: 2
console.countReset(label)

// Dumps an object.
console.dir(object)


// Caution: global scope
function disableConsoleLog() {
    const originalLog = console.log;
    console.log = function() {};  // Disable log inside this function

    // Some code where console.log is disabled
    console.log("This won't appear");

    // Restore the original log function
    console.log = originalLog;
}

disableConsoleLog();
console.log("This will work again!");  // Outputs: "This will work again!"

*/
