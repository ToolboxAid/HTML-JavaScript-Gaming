import DebugFlag from '../../engine/utils/debugFlag.js';
import DebugFlag from '';
class LevelData {
    static DEBUG = DebugFlag.has('');

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
                setOf: 1,
                setSpacing:60,
                spawnDelay: 0,
                velocityX: 80,
                resetDelay: 13500,
                startX: -350,
                spacing: 896/2.5,
                flip: false
            },

            {
                rowId: LevelData.Lanes.Water2,
                objectType: 'Turtle',
                count: 4,
                setOf: 2,
                setSpacing: 60,
                spawnDelay: 0,
                velocityX: -180,
                resetDelay: 5900,
                startX: 896+10,
                spacing: 200,
                flip: false
            },

            {
                rowId: LevelData.Lanes.Water2,
                objectType: 'TurtleSink',
                count: 1,
                setOf: 2,
                setSpacing: 60,
                spawnDelay: 0,
                velocityX: -180,
                resetDelay: 5900,
                startX: 896+896-50,
                spacing: 0,
                flip: false
            },

            {
                rowId: LevelData.Lanes.Water3,
                objectType: 'LogLRG',
                count: 3,
                setOf: 1,
                setSpacing:60,
                spawnDelay: 0,
                velocityX: 250,
                resetDelay: 7000,
                startX: -400,
                spacing: 595,
                flip: false
            },
            {
                rowId: LevelData.Lanes.Water4,
                objectType: 'LogSM',
                count: 3,
                setOf: 1,
                setSpacing:60,
                spawnDelay: 0,
                velocityX: 50,
                resetDelay: 21500,
                startX: -250,
                spacing: 896/2.5,
                flip: false
            },
            {
                rowId: LevelData.Lanes.Water5,
                objectType: 'Turtle',
                count: 3,
                setOf: 3,
                setSpacing:60,
                spawnDelay: 0,
                velocityX: -100,
                resetDelay: 10250,
                startX: 896,
                spacing: 250,
                flip: false
            },
            {
                rowId: LevelData.Lanes.Water5,
                objectType: 'TurtleSink',
                count: 1,
                setOf: 3,
                setSpacing:60,
                spawnDelay: 0,
                velocityX: -100,
                resetDelay: 10250,
                startX: 896+760,
                spacing: 0,
                flip: false
            },            
            {
                rowId: LevelData.Lanes.ROAD1,
                objectType: 'Car0',
                count: 4,
                setOf: 1,
                setSpacing:60,
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
                setOf: 1,
                setSpacing:60,
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
                setOf: 1,
                setSpacing:60,
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
                setOf: 1,
                setSpacing:60,
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
                setOf: 1,
                setSpacing:60,
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
                rowId: LevelData.Lanes.Water1,
                objectType: 'LogMED',
                count: 2,
                setOf: 1,
                setSpacing:60,
                spawnDelay: 0,
                velocityX: 80,
                resetDelay: 13500,
                startX: -350,
                spacing: 896/2.5,
                flip: false
            },
            {
                rowId: LevelData.Lanes.Water1,
                objectType: 'Aligator',
                count: 1,
                setOf: 1,
                setSpacing:60,
                spawnDelay: 0,
                velocityX: 80,
                resetDelay: 13500,
                startX: -350*3,
                spacing: 0,
                flip: false
            },

            {
                rowId: LevelData.Lanes.Water2,
                objectType: 'Turtle',
                count: 4,
                setOf: 2,
                setSpacing: 60,
                spawnDelay: 0,
                velocityX: -180,
                resetDelay: 5900,
                startX: 896+10,
                spacing: 200,
                flip: false
            },

            {
                rowId: LevelData.Lanes.Water2,
                objectType: 'TurtleSink',
                count: 1,
                setOf: 2,
                setSpacing: 60,
                spawnDelay: 0,
                velocityX: -180,
                resetDelay: 5900,
                startX: 896+896-50,
                spacing: 0,
                flip: false
            },

            {
                rowId: LevelData.Lanes.Water3,
                objectType: 'LogLRG',
                count: 1,
                setOf: 1,
                setSpacing:60,
                spawnDelay: 0,
                velocityX: 250,
                resetDelay: 7000,
                startX: -400,
                spacing: 595,
                flip: false
            },
            {
                rowId: LevelData.Lanes.Water4,
                objectType: 'LogSM',
                count: 3,
                setOf: 1,
                setSpacing:60,
                spawnDelay: 0,
                velocityX: 50,
                resetDelay: 21500,
                startX: -250,
                spacing: 896/2.5,
                flip: false
            },
            {
                rowId: LevelData.Lanes.Water5,
                objectType: 'Turtle',
                count: 2,
                setOf: 3,
                setSpacing:60,
                spawnDelay: 0,
                velocityX: -100,
                resetDelay: 10250,
                startX: 896,
                spacing: 350,
                flip: false
            },
            {
                rowId: LevelData.Lanes.Water5,
                objectType: 'TurtleSink',
                count: 1,
                setOf: 3,
                setSpacing:60,
                spawnDelay: 0,
                velocityX: -100,
                resetDelay: 10250,
                startX: 896+660,
                spacing: 0,
                flip: false
            },                        
            //=============================
            {
                rowId: LevelData.Lanes.ROAD5,
                objectType: 'Truck',
                count: 3,
                setOf: 1,
                setSpacing:60,
                spawnDelay: 0,
                velocityX: -150,
                resetDelay: 8000,
                startX: 1024,
                spacing: 896/2.25,
                flip: false
            }, 
            {
                rowId: LevelData.Lanes.ROAD4,
                objectType: 'Car2',
                count: 1,
                setOf: 1,
                setSpacing:60,
                spawnDelay: 0,
                velocityX: 70,
                resetDelay: 12500,
                startX: -50,
                spacing: 896/3.25,
                flip: false
            },
            {
                rowId: LevelData.Lanes.ROAD3,
                objectType: 'Car1',
                count: 3,
                setOf: 1,
                setSpacing:60,
                spawnDelay: 0,
                velocityX: -70,
                resetDelay: 14500,
                startX: 896,
                spacing: 896/3.25,
                flip: false
            },            

            {
                rowId: LevelData.Lanes.ROAD2,
                objectType: 'Dozer',
                count: 2,
                setOf: 1,
                setSpacing:60,
                spawnDelay: 0,
                velocityX: 50,
                resetDelay: 25500,
                startX: -50,
                spacing: 896/3.25,
                flip: false                
            },
            {
                rowId: LevelData.Lanes.ROAD1,
                objectType: 'Car0',
                count: 4,
                setOf: 1,
                setSpacing:60,
                spawnDelay: 0,
                velocityX: -50,
                resetDelay: 25500,
                startX: 896,
                spacing: 896/3.25,
                flip: false
            },            
        ],

        LEVEL3: [
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
    
        const required = ['rowId', 'objectType', 
                        'count', 
                        'setOf', 
                        'setSpacing',
                         'spawnDelay', 
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
