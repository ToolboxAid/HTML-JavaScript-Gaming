import LevelData from './levelData.js';

class LevelManager {
    static DEBUG = new URLSearchParams(window.location.search).has('levelManager');

    constructor(attractMode) {
        this.attractMode = attractMode;
        this.currentLevel = 1;
        this.spawnTimers = new Map();
        this.objectCounts = new Map();
        this.lastSpawnTime = new Map();
        this.levelConfig = null;
    }

    initializeLevel(levelNumber) {
        this.currentLevel = levelNumber;
        this.levelConfig = LevelData.getLevelConfig(levelNumber);

        if (!this.levelConfig) {
            console.error(`Failed to initialize level ${levelNumber}`);
            return false;
        }

        // Reset tracking maps
        this.spawnTimers.clear();
        this.objectCounts.clear();
        this.lastSpawnTime.clear();

        // Initialize each row
        this.levelConfig.forEach(rowConfig => {
            const key = `${rowConfig.rowId}_${rowConfig.objectType}`;
            this.spawnTimers.set(key, Date.now());
            this.objectCounts.set(key, 0);
            this.lastSpawnTime.set(key, 0);

            // Create first object immediately
            this.spawnObject(rowConfig);
        });

        if (LevelManager.DEBUG) {
            console.log(`Level ${levelNumber} initialized with ${this.levelConfig.length} rows`);
        }

        return true;
    }

    spawnObject(config) {
        const key = `${config.rowId}_${config.objectType}`;
        const currentCount = this.objectCounts.get(key);

        if (currentCount >= config.count) {
            return null;
        }

        let x = 0;
        if (config.velocityX > 0) {
            x = config.startX - (currentCount * config.spacing);
        } else {
            x = config.startX + (currentCount * config.spacing);
        }

        const flip = config.flip;//config.velocityX > 0;
        const createMethod = `create${config.objectType}`;
        if (typeof this.attractMode[createMethod] === 'function') {
            const gameObject = this.attractMode[createMethod](
                x,
                config.rowId,
                config.velocityX,
                flip
            );

            if (gameObject) {
                this.objectCounts.set(key, currentCount + 1);
                this.lastSpawnTime.set(key, Date.now());

                if (LevelManager.DEBUG) {
                    console.log(`Spawned ${config.objectType}`, {
                        row: config.rowId,
                        count: currentCount + 1,
                        position: { x, y: gameObject.y },
                        velocity: config.velocityX
                    });
                }
            }
            return gameObject;
        }
        return null;
    }

    update() {
        if (!this.levelConfig) return;

        const now = Date.now();

        this.levelConfig.forEach(rowConfig => {
            const key = `${rowConfig.rowId}_${rowConfig.objectType}`;
            const lastSpawn = this.lastSpawnTime.get(key);
            const timer = this.spawnTimers.get(key);

            // Check spawn timer
            if (now - lastSpawn >= rowConfig.spawnDelay) {
                this.spawnObject(rowConfig);
            }

            // Check reset timer
            if (now - timer >= rowConfig.resetDelay) {
                this.spawnTimers.set(key, now);
                this.objectCounts.set(key, 0);

                if (LevelManager.DEBUG) {
                    console.log(`Reset pattern for ${rowConfig.objectType}`, {
                        row: rowConfig.rowId,
                        time: now
                    });
                }
            }
        });
    }
}

export default LevelManager;