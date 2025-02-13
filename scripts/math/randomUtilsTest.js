// ToolboxAid.com
// David Quesenberry
// 02/12/2025
// randomUtilsTest.js

import RandomUtils from './randomUtils.js';

export function testRandomUtils(assert) {
    if (false) {
        // Test randomBoolean: It should return either true or false
        let trueCount = 0;
        let falseCount = 0;
        for (let i = 0; i < 1000; i++) {
            const result = RandomUtils.randomBoolean();
            assert(result === true || result === false, `randomBoolean failed on iteration ${i}`);
            if (result) trueCount++;
            else falseCount++;
        }
        console.log(`randomBoolean results: True: ${trueCount}, False: ${falseCount}`);
    }
    // Test randomRange: Integer values should be within the expected range
    for (let i = 0; i < 1000; i++) {
        const randomInt = RandomUtils.randomInt(1, 10);
        assert(randomInt >= 1 && randomInt <= 10, `randomInt failed on iteration ${i}`);
    }

    // Test randomRange: Floating point values should be within the expected range
    for (let i = 0; i < 1000; i++) {
        const randomFloat = RandomUtils.random(1, 10);
        assert(randomFloat >= 1 && randomFloat < 10, `random failed on iteration ${i}`);
    }

    // Test invalid inputs for randomRange
    try {
        RandomUtils.randomRange('a', 10);
        assert(false, "randomRange did not throw error for invalid min");
    } catch (error) {
        assert(error.message === 'Invalid input: min and max must be numbers, and min must be less than or equal to max.', 'randomRange invalid min test failed');
    }

    try {
        RandomUtils.randomRange(5, 2);
        assert(false, "randomRange did not throw error for min greater than max");
    } catch (error) {
        assert(error.message === 'Invalid input: min and max must be numbers, and min must be less than or equal to max.', 'randomRange min > max test failed');
    }

    try {
        RandomUtils.randomRange(1, 'b');
        assert(false, "randomRange did not throw error for invalid max");
    } catch (error) {
        assert(error.message === 'Invalid input: min and max must be numbers, and min must be less than or equal to max.', 'randomRange invalid max test failed');
    }

    // Test randomInt edge cases
    assert(RandomUtils.randomInt(0, 0) === 0, "randomInt edge case failed");
    assert(RandomUtils.randomInt(100, 100) === 100, "randomInt edge case failed");

    // Test random float with a small range
    const smallRange = RandomUtils.random(1, 1.001);
    assert(smallRange >= 1 && smallRange < 1.001, "random float small range failed");

    console.log("All RandomUtils tests passed!");
}

