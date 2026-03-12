import MouseInput, { LEFT, MIDDLE, RIGHT } from "./mouse.js";

export function testMouseInput(assert) {
    // Reference an existing canvas element (assuming it's already in the DOM)
    let createdCanvas = false;

    let canvas = document.getElementById('gameArea');
    //canvas = null;

    if (!canvas) {
        // If no canvas exists, create one for testing purposes
        console.warn("No canvas found. Creating a new canvas element for testing.");
        canvas = document.createElement("canvas");

        canvas.id = 'gameAreaTest'; // Assign an ID for consistency
        canvas.width = 1024;
        canvas.height = 768;

        // Insert the canvas at the top of the body
        document.body.insertBefore(canvas, document.body.firstChild);
        createdCanvas = true;
    }

    // Create an instance of MouseInput
    const mouse = new MouseInput(canvas);

    // Log canvas dimensions for debugging
    const rect = canvas.getBoundingClientRect();


    // Helper functions to mock mouse events
    function triggerMouseDown(button) {
        canvas.dispatchEvent(new MouseEvent("mousedown", { button }));
    }

    function triggerMouseUp(button) {
        canvas.dispatchEvent(new MouseEvent("mouseup", { button }));
    }

    function triggerMouseMove(x, y) {
        canvas.dispatchEvent(new MouseEvent("mousemove", { clientX: x, clientY: y }));
    }

    function triggerWheel(deltaY) {
        canvas.dispatchEvent(new WheelEvent("wheel", { deltaY }));
    }

    // Helper function for assertions
    function assertState(pressed, down, released, message) {
        assert(mouse.getButtonsPressed().length === pressed, `${message}: buttonsPressed should have ${pressed} items`);
        assert(mouse.getButtonsDown().length === down, `${message}: buttonsDown should have ${down} items`);
        assert(mouse.getButtonsReleased().length === released, `${message}: buttonsReleased should have ${released} items`);
    }

    // Test 1: Initial state should have no buttons pressed, down, or released
    assertState(0, 0, 0, "Initial state");

    // Test 2: Pressing a button should register as pressed and down
    triggerMouseDown(LEFT);
    mouse.update();
    assert(mouse.wasButtonIndexPressed(LEFT), "LEFT button should be registered as pressed");
    assert(mouse.isButtonIndexDown(LEFT), "LEFT button should be in buttonsDown");
    assert(!mouse.wasButtonIndexReleased(LEFT), "LEFT button should not be in buttonsReleased");

    // Test 3: Holding the button should not count as a new press
    mouse.update();
    assert(!mouse.wasButtonIndexPressed(LEFT), "LEFT button should not be in buttonsPressed after update");
    assert(mouse.isButtonIndexDown(LEFT), "LEFT button should still be in buttonsDown");

    // Test 4: Releasing a button should register as released
    triggerMouseUp(LEFT);
    mouse.update();
    assert(!mouse.isButtonIndexDown(LEFT), "LEFT button should not be in buttonsDown after release");
    assert(mouse.wasButtonIndexReleased(LEFT), "LEFT button should be in buttonsReleased");

    // Test 5: Buttons released should reset after update
    mouse.update();
    assert(!mouse.wasButtonIndexReleased(LEFT), "LEFT button should not be in buttonsReleased after second update");

    // Test 6: Multiple buttons pressed
    triggerMouseDown(MIDDLE);
    triggerMouseDown(RIGHT);
    mouse.update();
    assert(mouse.wasButtonIndexPressed(MIDDLE), "MIDDLE button should be registered as pressed");
    assert(mouse.wasButtonIndexPressed(RIGHT), "RIGHT button should be registered as pressed");
    assert(mouse.isButtonIndexDown(MIDDLE), "MIDDLE button should be in buttonsDown");
    assert(mouse.isButtonIndexDown(RIGHT), "RIGHT button should be in buttonsDown");

    // Test 7: Releasing multiple buttons
    triggerMouseUp(MIDDLE);
    triggerMouseUp(RIGHT);
    mouse.update();
    assert(!mouse.isButtonIndexDown(MIDDLE), "MIDDLE button should not be in buttonsDown after release");
    assert(!mouse.isButtonIndexDown(RIGHT), "RIGHT button should not be in buttonsDown after release");
    assert(mouse.wasButtonIndexReleased(MIDDLE), "MIDDLE button should be in buttonsReleased");
    assert(mouse.wasButtonIndexReleased(RIGHT), "RIGHT button should be in buttonsReleased");

    // // Test 8: Mouse movement tracking
    const left = 200;  // need to remove left offset.
    const top = 100;  // need to remove top offset.
    triggerMouseMove(left, top);
    assert(mouse.getPosition().x === (left - rect.x) && mouse.getPosition().y === (top - rect.y), "Mouse position should be updated correctly");

    // // Test 9: Mouse delta tracking
    triggerMouseMove(250, 150);
    assert(mouse.getMouseDelta().x === 50 && mouse.getMouseDelta().y === 50, "Mouse delta should be calculated correctly");

    // Test 10: Mouse wheel movement
    triggerWheel(-100);
    assert(mouse.wheel === -100, "Mouse wheel movement should be registered correctly");

    // Cleanup: Remove the canvas if it was created for testing
    if (createdCanvas) {
        console.log("Removing dynamically created 'gameAreaTest'.");
        document.body.removeChild(canvas);
    }
}