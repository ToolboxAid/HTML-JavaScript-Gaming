import { run as runEntity } from './entity/Entity.test.mjs';

const tests = [
    ['Entity', runEntity],
];

let passed = 0;

for (const [name, test] of tests) {
    test();
    console.log(`PASS ${name}`);
    passed += 1;
}

console.log(`\n${passed}/${tests.length} tests passed.`);
