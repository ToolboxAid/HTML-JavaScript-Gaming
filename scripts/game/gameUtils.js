// ToolboxAid.com
// David Quesenberry
// 02/12/2025
// gameUtils.js

class GameUtils{
    /**  Player information
    */
    static selectNumberOfPlayers(ctx, canvasConfig, playerSelect, keyboardInput, gameControllers) {
        ctx.fillStyle = canvasConfig.backgroundColor + 'AA'; // Semi-transparent
        ctx.fillRect(0, 0, canvasConfig.width, canvasConfig.height); // Overlay the canvas

        const maxPlayers = playerSelect.maxPlayers || 4;
        const lives = playerSelect.lives || 3;
        const fillText = playerSelect.fillText || "Select Player Mode";
        const x = playerSelect.optionBaseX || 100;
        const y = playerSelect.optionBaseY || 100;
        const spacing = playerSelect.optionSpacing || 50;

        // ---------------------
        // Keyboard Input
        ctx.fillStyle = playerSelect.fillStyle || "white";
        ctx.font = playerSelect.font || "30px Arial";
        ctx.fillText(fillText, x, y);

        for (let i = 1; i <= maxPlayers; i++) {
            ctx.fillText(`Keyboard \`${i}\` for ${i} Player${i > 1 ? "s" : ""}`,
                (canvasConfig.width / 2) - 200, y + i * spacing);
        }
        // Loop through potential player counts
        for (let i = 1; i <= maxPlayers; i++) {
            if (keyboardInput.getkeysPressed().includes(`Digit${i}`) ||
                keyboardInput.getkeysPressed().includes(`Numpad${i}`)) {
                return { playerCount: i, playerLives: Array.from({ length: maxPlayers }, (_, index) => (index < i ? lives : 0)), gameState: "initGame" };
            }
        }

        // ---------------------
        if (gameControllers){ // GameController Input
        ctx.fillText('GameController Select Player(s)', x, y + 150);
        ctx.fillText('`Left Bumper` 1 player', (canvasConfig.width / 2) - 200, y + 200);
        ctx.fillText('`Right Bumper` 2 players', (canvasConfig.width / 2) - 200, y + 250);
        }
        
        if (gameControllers) {
            console.warn('GameController currently supports 2 players');
            if (gameControllers.isButtonIndexDown(0, 4)) {
                const i = 1;
                return {
                    playerCount: i, playerLives: Array.from({ length: maxPlayers },
                        (_, index) => (index < i ? lives : 0)), gameState: "initGame"
                };
            }
            if (gameControllers.isButtonIndexDown(0, 5)) {
                const i = 2;
                return {
                    playerCount: i, playerLives: Array.from({ length: maxPlayers },
                        (_, index) => (index < i ? lives : 0)), gameState: "initGame"
                };
            }
        }
    }

    static swapPlayer(playerLives, currentPlayer, playerCount, setGameState) {
        // Decrease the current player's life
        playerLives[currentPlayer] -= 1;
        console.log(`Player ${currentPlayer + 1} lost a life!`);
    
        // Check if the current player is out of lives
        if (playerLives[currentPlayer] <= 0) {
            console.log(`Player ${currentPlayer + 1} is out of lives.`);
    
            // Check if all players are out of lives
            const allOut = playerLives.every(lives => lives <= 0);
            if (allOut) {
                console.log("All players are out of lives. Game Over!");
                setGameState("gameOver"); // Trigger game over state
                return { updatedPlayer: undefined, updatedLives: playerLives }; // Return undefined for player
            }
        }
    
        // Find the next player with lives left
        let nextPlayer = currentPlayer;
        do {
            nextPlayer = (nextPlayer + 1) % playerCount; // Cycle to the next player
        } while (playerLives[nextPlayer] <= 0 && nextPlayer !== currentPlayer); // Ensure not stuck in infinite loop
    
        // Set the next player as the current player
        console.log(`Swapping to Player ${nextPlayer + 1}.`);
        return { updatedPlayer: nextPlayer, updatedLives: playerLives };
    }    

}

export default GameUtils;