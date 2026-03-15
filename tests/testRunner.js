// ToolboxAid.com
// David Quesenberry
// 03/15/2026
// testRunner.js

import { runTests } from '../engine/runTest.js';
import { engineTestEntries } from './engine/testManifest.js';

async function runSampleEngineTests() {
    for (const entry of engineTestEntries) {
        const testModule = await import(`./engine/${entry.modulePath.slice(2)}`);
        runTests(entry.name, testModule[entry.exportName]);
    }
}

runSampleEngineTests().catch((error) => {
    console.error('Sample engine test runner failed:', error);
});
