// ToolboxAid.com
// David Quesenberry
// asteroids
// 11/15/2024
// keyboard.js

class KeyboardInput {
    constructor() {
        this.keyJustPressed = new Set();  // Keys that were pressed this frame
        this.KeyDown = new Set();         // Keys that are currently pressed
        this.keyReleased = new Set();     // Keys that were released this frame

        // Temporary lists to avoid race conditions
        this.tempKeyDown = new Set();     // Keys temporarily stored during keydown events
        this.tempKeyUp = new Set();       // Keys temporarily stored during keyup events

        // Bind event listeners for keydown and keyup events
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
    }

    handleKeyDown(event) {
        const key = event.code;
        // Add the key to the temporary keyDown list if it's not already pressed
        if (!this.KeyDown.has(key)) {
            this.tempKeyDown.add(key); // Add to tempKeyDown for processing in update
        }
    }

    handleKeyUp(event) {
        const key = event.code;

        // Add the key to the temporary keyUp list for processing in update
        if (this.KeyDown.has(key)) {
            this.tempKeyUp.add(key); // Add to tempKeyUp for processing in update
        }
    }

    update() {
        // Clear keyJustPressed and keyReleased after each update frame
        this.keyJustPressed.clear();
        this.keyReleased.clear();

        // Process keyDown events: move from tempKeyDown to keyJustPressed and KeyDown
        this.tempKeyDown.forEach(key => {
            if (!this.KeyDown.has(key)) { // Only add to keyJustPressed if not already pressed
                this.keyJustPressed.add(key);
                this.KeyDown.add(key);
            }
        });
        this.tempKeyDown.clear(); // Clear temporary keyDown list after processing

        // Process keyUp events: move from tempKeyUp to keyReleased
        this.tempKeyUp.forEach(key => {
            this.keyReleased.add(key);
            this.KeyDown.delete(key); // Remove from KeyDown once released
        });
        this.tempKeyUp.clear(); // Clear temporary keyUp list after processing
    }

    getKeyJustPressed() {
        return Array.from(this.keyJustPressed); // Return an array of keys just pressed
    }

    getKeyDown() {
        return Array.from(this.KeyDown); // Return an array of keys currently pressed
    }

    getKeyReleased() {
        return Array.from(this.keyReleased); // Return an array of keys just released
    }

    isKeyDown(key) {
        return this.keyJustPressed.has(key);
    }
    
    isKeyDown(key) {
        return this.KeyDown.has(key);
    }

    isKeyRelease(key) {
        return this.keyReleased.has(key);
    }

}

// Export the KeyboardInput class
export default KeyboardInput;
