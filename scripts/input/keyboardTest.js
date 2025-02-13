import KeyboardInput from "./keyboard.js";

export function testKeyboardInput(assert) {
    // Create an instance of KeyboardInput
    const keyboard = new KeyboardInput();

    // Mocking Keyboard Events
    function triggerKeyDown(key) {
        window.dispatchEvent(new KeyboardEvent("keydown", { code: key }));
    }

    function triggerKeyUp(key) {
        window.dispatchEvent(new KeyboardEvent("keyup", { code: key }));
    }

    // Test: Initial state should have no keys pressed, down, or released
    assert(keyboard.getkeysPressed().length === 0, "Initial keysPressed should be empty");
    assert(keyboard.getKeysDown().length === 0, "Initial keysDown should be empty");
    assert(keyboard.getKeysReleased().length === 0, "Initial keysReleased should be empty");

    // Test: Pressing a key should register as pressed and down
    triggerKeyDown("KeyA");
    keyboard.update();
    assert(keyboard.isKeyPressed("KeyA"), "KeyA should be registered as pressed");
    assert(keyboard.isKeyDown("KeyA"), "KeyA should be in keysDown");
    assert(!keyboard.isKeyReleased("KeyA"), "KeyA should not be in keysReleased");

    // Test: Holding the key should not count as a new press
    keyboard.update();
    assert(!keyboard.isKeyPressed("KeyA"), "KeyA should not be in keysPressed after update");
    assert(keyboard.isKeyDown("KeyA"), "KeyA should still be in keysDown");

    // Test: Releasing a key should register as released
    triggerKeyUp("KeyA");
    keyboard.update();
    assert(!keyboard.isKeyDown("KeyA"), "KeyA should not be in keysDown after release");
    assert(keyboard.isKeyReleased("KeyA"), "KeyA should be in keysReleased");

    // Test: Keys released should reset after update
    keyboard.update();
    assert(!keyboard.isKeyReleased("KeyA"), "KeyA should not be in keysReleased after second update");

    // Test: Multiple keys pressed
    triggerKeyDown("KeyB");
    triggerKeyDown("KeyC");
    keyboard.update();
    assert(keyboard.isKeyPressed("KeyB"), "KeyB should be registered as pressed");
    assert(keyboard.isKeyPressed("KeyC"), "KeyC should be registered as pressed");
    assert(keyboard.isKeyDown("KeyB"), "KeyB should be in keysDown");
    assert(keyboard.isKeyDown("KeyC"), "KeyC should be in keysDown");

    // Test: Releasing multiple keys
    triggerKeyUp("KeyB");
    triggerKeyUp("KeyC");
    keyboard.update();
    assert(!keyboard.isKeyDown("KeyB"), "KeyB should not be in keysDown after release");
    assert(!keyboard.isKeyDown("KeyC"), "KeyC should not be in keysDown after release");
    assert(keyboard.isKeyReleased("KeyB"), "KeyB should be in keysReleased");
    assert(keyboard.isKeyReleased("KeyC"), "KeyC should be in keysReleased");
}
