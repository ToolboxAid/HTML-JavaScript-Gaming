// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// systemUtilsTest.js

import SystemUtils from './systemUtils.js';

export function testSystemUtils(assert) {
    // Test toCamelCase
    assert(SystemUtils.toCamelCase("hello world") === "helloWorld", "toCamelCase failed");
    assert(SystemUtils.toCamelCase("  multiple   spaces  here  ") === "multipleSpacesHere", "toCamelCase failed with multiple spaces");
    assert(SystemUtils.toCamelCase("special@characters!test") === "specialCharactersTest", "toCamelCase failed with special characters");
    assert(SystemUtils.toCamelCase("MixedCASE", "STRING") === "mixedcaseString", "toCamelCase failed with mixed case input");

    assert(SystemUtils.toCamelCase("special@char#test") === "specialCharTest", "toCamelCase failed for special@char#test");
    assert(SystemUtils.toCamelCase("keep_underscore", "and-dash") === "keepUnderscoreAndDash", "toCamelCase failed for keep_underscore and-dash");
    assert(SystemUtils.toCamelCase("remove!!", "extra**special$$chars") === "removeExtraSpecialChars", "toCamelCase failed for remove!! extra**special$$chars");
    assert(SystemUtils.toCamelCase("hello! world?") === "helloWorld", "toCamelCase failed for hello! world?");

    // Test getObjectType
    assert(SystemUtils.getObjectType(null) === "Null", "getObjectType failed for null");
    assert(SystemUtils.getObjectType(undefined) === "Null", "getObjectType failed for undefined");
    assert(SystemUtils.getObjectType({}) === "Object", "getObjectType failed for object");
    assert(SystemUtils.getObjectType([]) === "Array", "getObjectType failed for array");
    assert(SystemUtils.getObjectType(new Map()) === "Map", "getObjectType failed for Map");

    // Test validateConfig
    const schema = { name: "string", age: "number", active: "boolean" };
    assert(SystemUtils.validateConfig("UserConfig", { name: "John", age: 30, active: true }, schema), "validateConfig failed for correct config");
    assert(!SystemUtils.validateConfig("UserConfig", { name: "John", age: "30", active: true }, schema), "validateConfig failed to detect wrong type");
    assert(!SystemUtils.validateConfig("UserConfig", { name: "John", active: true }, schema), "validateConfig failed to detect missing field");

    // Test destroy
    const objWithDestroy = {
        destroy: () => {
            console.log("Destroying object..."); // Ensure this shows up
        }
    };

    assert(SystemUtils.destroy(objWithDestroy) === true, "destroy failed for object with destroy method");

    let arr1 = [{ destroy: () => console.log("Destroyed 1") }, { destroy: () => console.log("Destroyed 2") }];
    assert(SystemUtils.cleanupArray(arr1), "cleanupArray failed for valid array");
    assert(arr1.length === 0, "cleanupArray did not empty array");

    // Test cleanupArray
    let arr = [{ destroy: () => { } }, { destroy: () => { } }];
    assert(SystemUtils.cleanupArray(arr), "cleanupArray failed for valid array");
    assert(arr.length === 0, "cleanupArray did not empty array");

    // Test cleanupMap
    let map = new Map();
    map.set("key1", { destroy: () => { } });
    map.set("key2", { destroy: () => { } });
    assert(SystemUtils.cleanupMap(map), "cleanupMap failed for valid Map");
    assert(map.size === 0, "cleanupMap did not empty Map");
}
