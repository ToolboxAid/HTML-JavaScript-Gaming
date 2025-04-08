class LevelData {
    static DEBUG = new URLSearchParams(window.location.search).has('levelData');

    static Lanes = Object.freeze({
        HOME: 0,

        Water1: -1,
        Water2: 1,
        Water3: 2,
        Water4: 3,
        Water5: 4,

        SAFETY2: 1,
        SAFETY1: 7,

        ROAD1: 6,
        ROAD2: 5,
        ROAD3: 4,
        ROAD4: 3,
        ROAD5: 2,

        STARTING: 8,
    });

    static Levels = {
        LEVEL1: [
            {
                rowId: LevelData.Lanes.ROAD1,
                objectType: 'Car0',
                count: 3,
                spawnDelay: 250,
                velocityX: -200,
                resetDelay: 10000,
                startX: 1024,
                spacing: 30
            },
            {
                rowId: LevelData.Lanes.ROAD3,
                objectType: 'Truck',
                count: 2,
                spawnDelay: 3000,
                velocityX: 250,
                resetDelay: 7000,
                startX: 0,
                spacing: 400
            },
            {
                rowId: LevelData.Lanes.ROAD5,
                objectType: 'Dozer',
                count: 3,
                spawnDelay: 2500,
                velocityX: -180,
                resetDelay: 8000,
                startX: 200,
                spacing: 250
            }
        ],

        LEVEL2: [
            {
                rowId: LevelData.Lanes.ROAD2,
                objectType: 'Car1',
                count: 3,
                spawnDelay: 1800,
                velocityX: -220,
                resetDelay: 5500,
                startX: 150,
                spacing: 280
            },
            {
                rowId: LevelData.Lanes.ROAD4,
                objectType: 'LogMED',
                count: 2,
                spawnDelay: 3500,
                velocityX: 200,
                resetDelay: 7000,
                startX: 100,
                spacing: 450
            },
            {
                rowId: LevelData.Lanes.ROAD5,
                objectType: 'TurtleSink',
                count: 4,
                spawnDelay: 2200,
                velocityX: -160,
                resetDelay: 9000,
                startX: 50,
                spacing: 200
            }
        ],

        LEVEL3: [
            {
                rowId: LevelData.Lanes.ROAD1,
                objectType: 'Car2',
                count: 4,
                spawnDelay: 1500,
                velocityX: -280,
                resetDelay: 5000,
                startX: 100,
                spacing: 220
            },
            {
                rowId: LevelData.Lanes.ROAD3,
                objectType: 'LogLRG',
                count: 2,
                spawnDelay: 4000,
                velocityX: 180,
                resetDelay: 8000,
                startX: 0,
                spacing: 500
            },
            {
                rowId: LevelData.Lanes.ROAD5,
                objectType: 'Aligator',
                count: 3,
                spawnDelay: 3000,
                velocityX: -200,
                resetDelay: 9000,
                startX: 200,
                spacing: 300
            }
        ]
    };

    static getLevelConfig(level) {
        if (this.DEBUG) {
            console.log(`Loading level ${level} configuration`);
        }

        const config = this.Levels[`LEVEL${level}`];
        if (!config) {
            console.error(`Invalid level number: ${level}`);
            return null;
        }

        return this.validateConfig(config) ? config : null;
    }

    static validateConfig(config) {
        if (!Array.isArray(config)) {
            console.error('Configuration must be an array');
            return false;
        }

        const required = ['rowId', 'objectType', 'count', 'spawnDelay', 
                         'velocityX', 'resetDelay', 'startX', 'spacing'];
        
        return config.every(row => {
            const hasAllProps = required.every(prop => row[prop] !== undefined);
            const validRow = row.rowId >= 0 && row.rowId <= 8;
            
            if (!hasAllProps || !validRow) {
                console.error('Invalid row configuration:', row);
                return false;
            }
            return true;
        });
    }
}

export default LevelData;