// ToolboxAid.com
// David Quesenberry
// 03/19/2026
// gameTurnFlowUtils.js
//
// PR-017 boundary note:
// - gameplay-facing turn-flow/state utility boundary
// - extracted from GameUtils as the next real gameplay-state split
// - owns tracked-player elimination checks, next-active-player selection,
//   and swap/game-over progression logic
// - intended for future direct usage while GameUtils remains a compatibility bridge

class GameTurnFlowUtils {
    static areTrackedPlayersOut(playerLives, playerCount) {
        return playerLives
            .slice(0, playerCount)
            .every(lives => lives <= 0);
    }

    static findNextActivePlayer(playerLives, currentPlayer, playerCount) {
        let nextPlayer = currentPlayer;

        do {
            nextPlayer = (nextPlayer + 1) % playerCount;
        } while (playerLives[nextPlayer] <= 0 && nextPlayer !== currentPlayer);

        return nextPlayer;
    }

    static swapPlayer(playerLives, currentPlayer, playerCount) {
        const updatedLives = [...playerLives];

        updatedLives[currentPlayer] -= 1;

        if (updatedLives[currentPlayer] <= 0) {
            if (this.areTrackedPlayersOut(updatedLives, playerCount)) {
                return {
                    updatedPlayer: 0,
                    updatedLives,
                    isGameOver: true
                };
            }
        }

        return {
            updatedPlayer: this.findNextActivePlayer(updatedLives, currentPlayer, playerCount),
            updatedLives,
            isGameOver: false
        };
    }

    constructor() {
        throw new Error('GameTurnFlowUtils is a utility class with only static methods. Do not instantiate.');
    }
}

export default GameTurnFlowUtils;
