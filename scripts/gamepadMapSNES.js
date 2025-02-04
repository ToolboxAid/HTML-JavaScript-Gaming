class GamepadMapSNES {
    static debug = true;

    // SNES USB Controller Layout
    static Buttons = {
        B: 0,      // Bottom button
        A: 1,      // Right button
        Y: 2,      // Left button
        X: 3,      // Top button
        L: 4,      // Left shoulder
        R: 5,      // Right shoulder
        Select: 6, 
        Start: 7,
        // Extra buttons some SNES clones have
        Extra1: 8,
        Extra2: 9
    };

    // D-Pad uses axes
    static Axes = {
        X: 0,  // -1 left, +1 right
        Y: 1   // -1 up, +1 down
    };

    static getDPad(gamepad) {
        if (!gamepad) return null;
        return {
            up: gamepad.axes[this.Axes.Y] < -0.5,
            down: gamepad.axes[this.Axes.Y] > 0.5,
            left: gamepad.axes[this.Axes.X] < -0.5,
            right: gamepad.axes[this.Axes.X] > 0.5
        };
    }

    static logGamepad(gamepad) {
        if (!this.debug || !gamepad) return;
        console.group(`SNES Gamepad ${gamepad.index}`);
        console.log('ID:', gamepad.id);
        console.log('Buttons:', gamepad.buttons.length);
        console.log('Axes:', gamepad.axes.length);
        console.groupEnd();
    }
}

export default GamepadMapSNES;
        
    // static Buttons = {
    //     // Face buttons (may vary by browser/gamepad)
    //     A: 0,          // Xbox A, PS X/Cross
    //     B: 1,          // Xbox B, PS Circle
    //     X: 2,          // Xbox X, PS Square
    //     Y: 3,          // Xbox Y, PS Triangle
        
    //     // Shoulder buttons
    //     LB: 4,         // Left Bumper
    //     RB: 5,         // Right Bumper
    //     LT: 6,         // Left Trigger
    //     RT: 7,         // Right Trigger
        
    //     // Center buttons
    //     Select: 8,     // Select/Back/Share
    //     Start: 9,      // Start/Options
    //     L3: 10,        // Left Stick Press
    //     R3: 11,        // Right Stick Press
        
    //     // D-Pad
    //     DPadUp: 12,
    //     DPadDown: 13,
    //     DPadLeft: 14,
    //     DPadRight: 15
    // };

    // static Axes = {
    //     LeftStickX: 0,
    //     LeftStickY: 1,
    //     RightStickX: 2,
    //     RightStickY: 3
    // };
// }

// export default GamepadMap;