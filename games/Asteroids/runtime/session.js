// ToolboxAid.com
// David Quesenberry
// 03/12/2026
// session.js

import GameUtils from '../../../engine/game/gameUtils.js';
import Ship from '../ship.js';
import AsteroidsWorld from '../world/world.js';

class AsteroidsSession {
    constructor(audioPlayer, maxPlayers = 4) {
        this.audioPlayer = audioPlayer;
        this.maxPlayers = maxPlayers;
        this.ships = [];
        this.worlds = [];
        this.currentPlayer = 0;
        this.playerLives = [];
        this.scores = [];
    }

    initialize(playerCount, playerLives) {
        this.ships = [];
        this.worlds = [];

        for (let i = 0; i < this.maxPlayers; i++) {
            this.worlds[i] = new AsteroidsWorld(this.audioPlayer);
            this.ships[i] = new Ship(this.audioPlayer);
        }

        this.playerCount = playerCount;
        this.playerLives = [...playerLives];
        this.scores = Array.from({ length: this.maxPlayers }, () => 0);
        this.currentPlayer = 0;
    }

    getCurrentShip() {
        return this.ships[this.currentPlayer];
    }

    getLivesVectorMap() {
        const currentShip = this.getCurrentShip();
        return currentShip ? currentShip.constructor.VECTOR_MAPS.LIVES : [];
    }

    getCurrentWorld() {
        return this.worlds[this.currentPlayer];
    }

    addCurrentPlayerScore(points) {
        this.scores[this.currentPlayer] += points;
        return this.scores[this.currentPlayer];
    }

    getScore(player) {
        return this.scores[player] || 0;
    }

    getLives(player) {
        return this.playerLives[player] || 0;
    }

    isCurrentPlayer(player) {
        return player === this.currentPlayer;
    }

    forEachPlayer(callback) {
        for (let player = 0; player < this.playerCount; player++) {
            callback(player);
        }
    }

    handleCurrentPlayerDeath(setState) {
        const ship = this.getCurrentShip();

        if (!ship || !ship.isDead()) {
            return false;
        }

        ship.setIsAlive();

        const result = GameUtils.swapPlayer(
            this.playerLives,
            this.currentPlayer,
            this.playerCount
        );

        this.currentPlayer = result.updatedPlayer;
        this.playerLives = result.updatedLives;
        if (result.nextGameState) {
            setState(result.nextGameState);
        }
        this.getCurrentWorld().reset();
        this.getCurrentShip().reset();

        return true;
    }
}

export default AsteroidsSession;
