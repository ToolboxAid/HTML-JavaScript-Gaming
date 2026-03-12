// ToolboxAid.com
// David Quesenberry
// 03/12/2026
// scoreSystem.js

class AsteroidsScoreSystem {
    constructor() {
        this.pendingScore = 0;
    }

    add(points) {
        if (!Number.isFinite(points) || points <= 0) {
            return;
        }

        this.pendingScore += points;
    }

    consume() {
        const score = this.pendingScore;
        this.pendingScore = 0;
        return score;
    }

    reset() {
        this.pendingScore = 0;
    }
}

export default AsteroidsScoreSystem;
