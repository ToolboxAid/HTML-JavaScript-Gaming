// ToolboxAid.com 
// David Quesenberry
// keyboard.js
// 10/19/2024

class KeyboardInput {
    constructor() {
        this.keyPressed = new Set();        // Keys that are currently pressed
        this.keyJustPressed = new Set();    // Keys that were pressed this frame
        this.keyReleased = new Set();       // Keys that were released this frame

        // Temporary lists to avoid race conditions
        this.tempKeyDown = new Set();       // Keys temporarily stored during keydown events
        this.tempKeyUp = new Set();         // Keys temporarily stored during keyup events

        // Bind event listeners for keydown and keyup events
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
    }

    handleKeyDown(event) {
        const key = event.code;
        // Add the key to the temporary keyDown list if it's not already pressed
        if (!this.keyPressed.has(key)) {
            this.tempKeyDown.add(key); // Add to tempKeyDown for processing in update
        }
    }

    handleKeyUp(event) {
        const key = event.code;

        // Add the key to the temporary keyUp list for processing in update
        if (this.keyPressed.has(key)) {
            this.tempKeyUp.add(key); // Add to tempKeyUp for processing in update
        }
    }

    update() {
        // Clear keyJustPressed and keyReleased after each update frame
        this.keyJustPressed.clear();
        this.keyReleased.clear();

        // Process keyDown events: move from tempKeyDown to keyJustPressed and keyPressed
        this.tempKeyDown.forEach(key => {
            if (!this.keyPressed.has(key)) { // Only add to keyJustPressed if not already pressed
                this.keyJustPressed.add(key);
                this.keyPressed.add(key);
            }
        });
        this.tempKeyDown.clear(); // Clear temporary keyDown list after processing

        // Process keyUp events: move from tempKeyUp to keyReleased
        this.tempKeyUp.forEach(key => {
            this.keyReleased.add(key);
            this.keyPressed.delete(key); // Remove from keyPressed once released
        });
        this.tempKeyUp.clear(); // Clear temporary keyUp list after processing
    }

    getKeyJustPressed() {
        return Array.from(this.keyJustPressed); // Return an array of keys just pressed
    }

    getKeyPressed() {
        return Array.from(this.keyPressed); // Return an array of keys currently pressed
    }

    getKeyReleased() {
        return Array.from(this.keyReleased); // Return an array of keys just released
    }
}

// Export the KeyboardInput class
export default KeyboardInput;
