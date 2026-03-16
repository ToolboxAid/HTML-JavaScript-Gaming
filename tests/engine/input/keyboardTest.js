import KeyboardInput from "../../../engine/input/keyboard.js";

function installWindowEventHarness() {
    const listeners = new Map();
    const originalAddEventListener = window.addEventListener;
    const originalRemoveEventListener = window.removeEventListener;
    const originalDispatchEvent = window.dispatchEvent;

    window.addEventListener = (eventName, listener) => {
        if (!listeners.has(eventName)) {
            listeners.set(eventName, new Set());
        }
        listeners.get(eventName).add(listener);
    };

    window.removeEventListener = (eventName, listener) => {
        listeners.get(eventName)?.delete(listener);
    };

    window.dispatchEvent = (event) => {
        const eventListeners = listeners.get(event.type);
        if (!eventListeners) {
            return true;
        }

        eventListeners.forEach((listener) => listener(event));
        return true;
    };

    return () => {
        window.addEventListener = originalAddEventListener;
        window.removeEventListener = originalRemoveEventListener;
        window.dispatchEvent = originalDispatchEvent;
    };
}

export function testKeyboardInput(assert) {
    const restoreWindow = installWindowEventHarness();

    try {
        const keyboard = new KeyboardInput();

        const triggerKeyDown = (key) => window.dispatchEvent({ type: "keydown", code: key });
        const triggerKeyUp = (key) => window.dispatchEvent({ type: "keyup", code: key });

        assert(keyboard.getKeysPressed().length === 0, "Initial keysPressed should be empty");
        assert(keyboard.getKeysDown().length === 0, "Initial keysDown should be empty");
        assert(keyboard.getKeysReleased().length === 0, "Initial keysReleased should be empty");

        triggerKeyDown("KeyA");
        keyboard.update();
        assert(keyboard.isKeyPressed("KeyA"), "KeyA should be registered as pressed");
        assert(keyboard.isKeyDown("KeyA"), "KeyA should be in keysDown");
        assert(!keyboard.isKeyReleased("KeyA"), "KeyA should not be in keysReleased");

        keyboard.update();
        assert(!keyboard.isKeyPressed("KeyA"), "KeyA should not be in keysPressed after update");
        assert(keyboard.isKeyDown("KeyA"), "KeyA should still be in keysDown");

        triggerKeyUp("KeyA");
        keyboard.update();
        assert(!keyboard.isKeyDown("KeyA"), "KeyA should not be in keysDown after release");
        assert(keyboard.isKeyReleased("KeyA"), "KeyA should be in keysReleased");

        keyboard.update();
        assert(!keyboard.isKeyReleased("KeyA"), "KeyA should not be in keysReleased after second update");

        triggerKeyDown("KeyB");
        triggerKeyDown("KeyC");
        keyboard.update();
        assert(keyboard.isKeyPressed("KeyB"), "KeyB should be registered as pressed");
        assert(keyboard.isKeyPressed("KeyC"), "KeyC should be registered as pressed");
        assert(keyboard.isKeyDown("KeyB"), "KeyB should be in keysDown");
        assert(keyboard.isKeyDown("KeyC"), "KeyC should be in keysDown");

        triggerKeyUp("KeyB");
        triggerKeyUp("KeyC");
        keyboard.update();
        assert(!keyboard.isKeyDown("KeyB"), "KeyB should not be in keysDown after release");
        assert(!keyboard.isKeyDown("KeyC"), "KeyC should not be in keysDown after release");
        assert(keyboard.isKeyReleased("KeyB"), "KeyB should be in keysReleased");
        assert(keyboard.isKeyReleased("KeyC"), "KeyC should be in keysReleased");

        triggerKeyDown("KeyX");
        triggerKeyUp("KeyX");
        keyboard.update();
        assert(!keyboard.isKeyDown("KeyX"), "KeyX should not stay down when pressed and released before update");
        assert(keyboard.isKeyPressed("KeyX"), "KeyX should still register as pressed for the frame");
        assert(keyboard.isKeyReleased("KeyX"), "KeyX should register as released for the frame");

        keyboard.destroy();
        triggerKeyDown("KeyZ");
        keyboard.update();
        assert(!keyboard.isKeyDown("KeyZ"), "destroy should stop keyboard listeners");
    } finally {
        restoreWindow();
    }
}
