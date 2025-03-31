// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// vehicleManager.js

import Vehicle from './vehicle.js';
class VehicleManager {
    static DEBUG = new URLSearchParams(window.location.search).has('vehicles');

    constructor() {
        // List of active vehicles
        this.activeVehicles = [];

        // Vehicle types and their properties
        this.vehicleTypes = {
            car1: {
                sprite: './assets/images/vehicles_sprite_48w_42h_6f.png',
                spriteX: 0,
                spriteY: 0,
                width: 48,
                height: 42,
                speed: 2
            },
            bulldozer: {
                sprite: './assets/images/vehicles_sprite_48w_42h_6f.png',
                spriteX: 48,
                spriteY: 0,
                width: 48,
                height: 42,
                speed: 1
            },            

            truck: {
                sprite: './assets/images/vehicles_sprite_48w_42h_6f.png',
                spriteX: 48*2,
                spriteY: 0,
                width: 48*2,
                height: 42,
                speed: 1.5
            },
            car2: {
                sprite: './assets/images/vehicles_sprite_48w_42h_6f.png',
                spriteX: 48*4,
                spriteY: 0,
                width: 48,
                height: 42,
                speed: 2
            },                        
            car3: {
                sprite: './assets/images/vehicles_sprite_48w_42h_6f.png',
                spriteX: 48*5,
                spriteY: 0,
                width: 48,
                height: 42,
                speed: 2
            },

            logSm: {
                sprite: './assets/images/log_sprite_60w_30h_10f.png',
                spriteX: 0,
                spriteY: 0,
                width: 60*2,
                height: 30,
                speed: 2
            },
            logMed: {
                sprite: './assets/images/log_sprite_60w_30h_10f.png',
                spriteX: 60*2,
                spriteY: 0,
                width: 60*3,
                height: 30,
                speed: 2
            },
            logLrg: {
                sprite: './assets/images/log_sprite_60w_30h_10f.png',
                spriteX: 60*5,
                spriteY: 0,
                width: 60*5,
                height: 30,
                speed: 2
            }, 
            turtle: {
                sprite: './assets/images/turtle_sprite_45w_33h_5f.png',
                spriteX: 0,
                spriteY: 0,
                width: 45*3,
                height: 30,
                speed: 2
            }, 
            turtleSink: {
                sprite: './assets/images/turtle_sprite_45w_33h_5f.png',
                spriteX: 45*2,
                spriteY: 0,
                width: 45*3,
                height: 30,
                speed: 2
            },
            aligator: {
                offsetY: -10,
                sprite: './assets/images/aligator_sprite_48w_48h_4f.png',
                spriteX: 0,
                spriteY: 0,
                width: 48*3,
                height: 48,
                speed: 2
            },  
            beaver: {
                offsetY: -10,
                sprite: './assets/images/beaver_sprite_48w_48h_2f.png',
                spriteX: 0,
                spriteY: 0,
                width: 48,
                height: 48,
                speed: 2
            },                                                            
            snake: {
                offsetY: -15,
                sprite: './assets/images/snake_sprite_84w_33h_4f.png',
                spriteX: 0,
                spriteY: 0,
                width: 84,
                height: 33,
                speed: 2
            }, 
            bonus: {
                offsetY: 0,
                sprite: './assets/images/bonus_sprite_36w_42h_6f.png',
                spriteX: 36*2,
                spriteY: 0,
                width: 36,
                height: 42,
                speed: 2
            },                        
        };

        if (VehicleManager.DEBUG) {
            console.log('Vehicles manager initialized');
        }
    }

    // Add a new vehicle
    addVehicle(vehicleType, x, y, direction) {
        const vehicleConfig = this.vehicleTypes[vehicleType];
        if (!vehicleConfig) {
            console.error(`Invalid vehicle vehicleType: ${vehicleType}`);
            return null;
        }

        // Create a new vehicle instance
        const vehicle = new Vehicle(
            x, y,            
            vehicleConfig.sprite,
            vehicleConfig.spriteX, vehicleConfig.spriteY,
            vehicleConfig.width, vehicleConfig.height,
            1.5, // Pixel size
            'black',
            vehicleType,
            direction,
            vehicleConfig.speed
        );

        this.activeVehicles.push(vehicle);
        
        if (VehicleManager.DEBUG) {
            console.log(`Added ${vehicleType} vehicle at (${x},${y})`);
        }

        return vehicle;
    }

    // Remove a vehicle
    removeVehicle(vehicle) {
        const index = this.activeVehicles.indexOf(vehicle);
        if (index > -1) {
            this.activeVehicles.splice(index, 1);
            if (VehicleManagerVehicleManager.DEBUG) {
                console.log(`Removed vehicle at index ${index}`);
            }
        }
    }
}

export default VehicleManager;
