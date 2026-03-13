globalThis.window = {
    location: {
        search: ''
    }
};

const { runTests } = await import('../engine/runTest.js');
const { engineTestEntries } = await import('../tests/engine/testManifest.js');

const tests = await Promise.all(
    engineTestEntries.map(async (entry) => {
        const module = await import(`../tests/engine/${entry.modulePath.slice(2)}`);
        return [entry.name, module[entry.exportName]];
    })
);

let passedCount = 0;

for (const [moduleName, testFunction] of tests) {
    if (runTests(moduleName, testFunction)) {
        passedCount += 1;
    }
}

const failedCount = tests.length - passedCount;
console.log(`\nTest summary: ${passedCount}/${tests.length} passed.`);

if (failedCount > 0) {
    process.exitCode = 1;
}
