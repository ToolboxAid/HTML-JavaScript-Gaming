// ToolboxAid.com
// David Quesenberry
// 10/16/2024
// keyboard.js
class KeyboardInput {
    constructor() {
        this.keysPressed = new Set();  // Keys pressed this frame
        this.keysDown = new Set();         // Keys currently pressed
        this.keysReleased = new Set();     // Keys released this frame

        // Temporary storage to avoid race conditions
        this.tempKeysDown = new Set();     // Keys temporarily stored during keydown events
        this.tempKeysUp = new Set();        // Keys temporarily stored during keyup events

        // Bind event listeners for keydown and keyup events
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
    }

    handleKeyDown(event) {
        const key = event.code;
        // Add to tempKeysDown only if it's not already in keysDown
        if (!this.keysDown.has(key)) {
            this.tempKeysDown.add(key);
        }
    }

    handleKeyUp(event) {
        const key = event.code;
        // Add to tempKeysUp only if it's currently in keysDown
        if (this.keysDown.has(key)) {
            this.tempKeysUp.add(key);
        }
    }

    update() {
        // Clear previous frame states
        this.keysPressed.clear();
        this.keysReleased.clear();

        // Process new keydown events
        this.tempKeysDown.forEach(key => {
            this.keysPressed.add(key);
            this.keysDown.add(key);
        });
        this.tempKeysDown.clear(); // Clear after processing

        // Process keyup events
        this.tempKeysUp.forEach(key => {
            this.keysReleased.add(key);
            this.keysDown.delete(key);
        });
        this.tempKeysUp.clear(); // Clear after processing
    }

    // Utility methods
    getkeysPressed() {
        return Array.from(this.keysPressed);
    }

    getKeysDown() {
        return Array.from(this.keysDown);
    }

    getKeysReleased() {
        return Array.from(this.keysReleased);
    }

    isKeyJustPressed(key) {
        return this.keysPressed.has(key);
    }

    isKeyDown(key) {
        return this.keysDown.has(key);
    }

    isKeyReleased(key) {
        return this.keysReleased.has(key);
    }
}

export default KeyboardInput;
