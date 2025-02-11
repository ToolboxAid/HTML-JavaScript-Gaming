// ToolboxAid.com
// David Quesenberry
// 02/10/2025
// gamepadDebugger.js

class GamepadDebugger {
    static logGameController(gameController) {
        console.group(`GameController [${gameController.index}]`);
        console.log('ID:', gameController.id);
        console.log('Buttons:', gameController.buttons.length);
        console.log('Axes:', gameController.axes.length);
        console.groupEnd();
    }

    static logPressedButtons(buttonsPressed, buttonNames) {
        buttonsPressed.forEach((buttonIndex) => {
            console.log(`Button Index: ${buttonIndex}, Name: ${buttonNames[buttonIndex]}`);
        });
    }
}

export default GamepadDebugger;
