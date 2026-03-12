// ToolboxAid.com
// David Quesenberry
// 03/12/2026
// asteroidsAppContext.js

import AsteroidsHighScoreStore from './asteroidsHighScoreStore.js';
import AsteroidsAttractScreen from './asteroidsAttractScreen.js';
import AsteroidsHud from './asteroidsHud.js';
import AsteroidsScreens from './asteroidsScreens.js';
import AsteroidsSessionController from './asteroidsSessionController.js';

class AsteroidsAppContext {
    constructor(audioPlayer) {
        this.sessionController = new AsteroidsSessionController(audioPlayer);
        this.highScoreStore = new AsteroidsHighScoreStore();
        this.highScore = this.highScoreStore.load();
        this.hudFlashState = AsteroidsHud.createFlashState();
        this.gameOverState = AsteroidsScreens.createGameOverState();
        this.attractScreen = null;
    }

    createAttractScreen() {
        this.attractScreen = new AsteroidsAttractScreen();
        return this.attractScreen;
    }
}

export default AsteroidsAppContext;
