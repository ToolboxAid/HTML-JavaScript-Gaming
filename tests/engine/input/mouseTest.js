import MouseInput, { LEFT, MIDDLE, RIGHT } from "../../../engine/input/mouse.js";

export function testMouseInput(assert) {
    const originalHTMLElement = globalThis.HTMLElement;

    class MockHTMLElement {}
    class MockCanvas extends MockHTMLElement {
        constructor() {
            super();
            this.width = 1024;
            this.height = 768;
            this.listeners = new Map();
            this.rect = { left: 0, top: 0, width: 1024, height: 768 };
        }

        getBoundingClientRect() {
            return this.rect;
        }

        addEventListener(eventName, listener) {
            if (!this.listeners.has(eventName)) {
                this.listeners.set(eventName, new Set());
            }
            this.listeners.get(eventName).add(listener);
        }

        removeEventListener(eventName, listener) {
            this.listeners.get(eventName)?.delete(listener);
        }

        dispatchEvent(event) {
            this.listeners.get(event.type)?.forEach((listener) => listener(event));
        }
    }

    globalThis.HTMLElement = MockHTMLElement;

    try {
        const canvas = new MockCanvas();
        const mouse = new MouseInput(canvas);
        const rect = canvas.getBoundingClientRect();

        const triggerMouseDown = (button) => canvas.dispatchEvent({ type: "mousedown", button });
        const triggerMouseUp = (button) => canvas.dispatchEvent({ type: "mouseup", button });
        const triggerMouseMove = (x, y) => canvas.dispatchEvent({ type: "mousemove", clientX: x, clientY: y });
        const triggerWheel = (deltaY) => canvas.dispatchEvent({ type: "wheel", deltaY });

        function assertState(pressed, down, released, message) {
            assert(mouse.getButtonsPressed().length === pressed, `${message}: buttonsPressed should have ${pressed} items`);
            assert(mouse.getButtonsDown().length === down, `${message}: buttonsDown should have ${down} items`);
            assert(mouse.getButtonsReleased().length === released, `${message}: buttonsReleased should have ${released} items`);
        }

        assertState(0, 0, 0, "Initial state");

        triggerMouseDown(LEFT);
        mouse.update();
        assert(mouse.wasButtonIndexPressed(LEFT), "LEFT button should be registered as pressed");
        assert(mouse.isButtonIndexDown(LEFT), "LEFT button should be in buttonsDown");
        assert(!mouse.wasButtonIndexReleased(LEFT), "LEFT button should not be in buttonsReleased");

        mouse.update();
        assert(!mouse.wasButtonIndexPressed(LEFT), "LEFT button should not be in buttonsPressed after update");
        assert(mouse.isButtonIndexDown(LEFT), "LEFT button should still be in buttonsDown");

        triggerMouseUp(LEFT);
        mouse.update();
        assert(!mouse.isButtonIndexDown(LEFT), "LEFT button should not be in buttonsDown after release");
        assert(mouse.wasButtonIndexReleased(LEFT), "LEFT button should be in buttonsReleased");

        mouse.update();
        assert(!mouse.wasButtonIndexReleased(LEFT), "LEFT button should not be in buttonsReleased after second update");

        triggerMouseDown(MIDDLE);
        triggerMouseDown(RIGHT);
        mouse.update();
        assert(mouse.wasButtonIndexPressed(MIDDLE), "MIDDLE button should be registered as pressed");
        assert(mouse.wasButtonIndexPressed(RIGHT), "RIGHT button should be registered as pressed");
        assert(mouse.isButtonIndexDown(MIDDLE), "MIDDLE button should be in buttonsDown");
        assert(mouse.isButtonIndexDown(RIGHT), "RIGHT button should be in buttonsDown");

        triggerMouseUp(MIDDLE);
        triggerMouseUp(RIGHT);
        mouse.update();
        assert(!mouse.isButtonIndexDown(MIDDLE), "MIDDLE button should not be in buttonsDown after release");
        assert(!mouse.isButtonIndexDown(RIGHT), "RIGHT button should not be in buttonsDown after release");
        assert(mouse.wasButtonIndexReleased(MIDDLE), "MIDDLE button should be in buttonsReleased");
        assert(mouse.wasButtonIndexReleased(RIGHT), "RIGHT button should be in buttonsReleased");

        triggerMouseDown(LEFT);
        triggerMouseUp(LEFT);
        mouse.update();
        assert(!mouse.isButtonIndexDown(LEFT), "LEFT button should not stay down when clicked and released before update");
        assert(mouse.wasButtonIndexPressed(LEFT), "LEFT button should still register as pressed for the frame");
        assert(mouse.wasButtonIndexReleased(LEFT), "LEFT button should register as released for the frame");

        const left = 200;
        const top = 100;
        triggerMouseMove(left, top);
        assert(mouse.getPosition().x === (left - rect.left) && mouse.getPosition().y === (top - rect.top), "Mouse position should be updated correctly");

        triggerMouseMove(250, 150);
        assert(mouse.getMouseDelta().x === 50 && mouse.getMouseDelta().y === 50, "Mouse delta should be calculated correctly");

        triggerWheel(-100);
        assert(mouse.wheel === -100, "Mouse wheel movement should be registered correctly");

        mouse.destroy();
        triggerMouseDown(LEFT);
        mouse.update();
        assert(!mouse.isButtonIndexDown(LEFT), "destroy should stop mouse listeners");
    } finally {
        globalThis.HTMLElement = originalHTMLElement;
    }
}
