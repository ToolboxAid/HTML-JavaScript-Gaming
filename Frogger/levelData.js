class LevelData {
    static DEBUG = new URLSearchParams(window.location.search).has('levelData');

    static Lanes = Object.freeze({
        HOME: -7,

        Water1: -6,
        Water2: -5,
        Water3: -4,
        Water4: -3,
        Water5: -2,

        SAFETY1: -1,

        ROAD1: 4,
        ROAD2: 3,
        ROAD3: 2,
        ROAD4: 1,
        ROAD5: 0,

        START: 5,
    });

    static Levels = {
        LEVEL1: [
            {
                rowId: LevelData.Lanes.Water1,
                objectType: 'LogMED',
                count: 3,
                spawnDelay: 0,
                velocityX: 70,
                resetDelay: 15500,
                startX: -250,
                spacing: 896/2.5,
                flip: false
            },



            
            {
                rowId: LevelData.Lanes.ROAD1,
                objectType: 'Car0',
                count: 4,
                spawnDelay: 0,
                velocityX: -50,
                resetDelay: 25500,
                startX: 896,
                spacing: 896/3.25,
                flip: false
            },
            {
                rowId: LevelData.Lanes.ROAD2,
                objectType: 'Dozer',
                count: 2,
                spawnDelay: 0,
                velocityX: 50,
                resetDelay: 25500,
                startX: -50,
                spacing: 896/3.25,
                flip: false                
            },
            {
                rowId: LevelData.Lanes.ROAD3,
                objectType: 'Car1',
                count: 3,
                spawnDelay: 0,
                velocityX: -70,
                resetDelay: 14500,
                startX: 896,
                spacing: 896/3.25,
                flip: false
            }, 
            {
                rowId: LevelData.Lanes.ROAD4,
                objectType: 'Car2',
                count: 1,
                spawnDelay: 0,
                velocityX: 70,
                resetDelay: 12500,
                startX: -50,
                spacing: 896/3.25,
                flip: false
            },                        
            {
                rowId: LevelData.Lanes.ROAD5,
                objectType: 'Truck',
                count: 2,
                spawnDelay: 0,
                velocityX: -150,
                resetDelay: 8000,
                startX: 1024,
                spacing: 896/2.25,
                flip: false
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
                         'velocityX', 'resetDelay', 'startX',
                         'spacing', 'flip'];
        
        return config.every(row => {
            // Check all required properties exist
            const hasAllProps = required.every(prop => row[prop] !== undefined);
    
            // Check row is within valid lane range
            const validRow = row.rowId >= LevelData.Lanes.HOME 
                            && row.rowId <= LevelData.Lanes.START;
            
            if (!hasAllProps || !validRow) {
                if (LevelData.DEBUG) {
                    console.log('Validation details:', {
                        rowId: row.rowId,
                        hasAllProperties: hasAllProps,
                        isValidRow: validRow,
                        validRange: {
                            min: LevelData.Lanes.HOME,
                            max: LevelData.Lanes.START
                        }
                    });
                }
                
                if (!validRow) {
                    console.error(`Invalid row ID: ${row.rowId}. Must be between ${LevelData.Lanes.HOME} and ${LevelData.Lanes.START}`);
                }
                if (!hasAllProps) {
                    console.error(`Missing required properties in configuration:`, {
                        row: row.rowId,
                        missing: required.filter(prop => row[prop] === undefined)
                    });
                }
                return false;
            }
            return true;
        });
    }
}

export default LevelData;