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
                width: 48,
                height: 42,
                speed: 2
            },
            car2: {
                sprite: './assets/images/vehicles_sprite_48w_42h_6f.png',
                width: 48,
                height: 42,
                speed: 2
            },
            car3: {
                sprite: './assets/images/vehicles_sprite_48w_42h_6f.png',
                width: 48,
                height: 42,
                speed: 2
            },
            truck: {
                sprite: './assets/images/vehicles_sprite_48w_42h_6f.png',
                width: 48*2,
                height: 42,
                speed: 1.5
            },
            bulldozer: {
                sprite: './assets/images/vehicles_sprite_48w_42h_6f.png',
                width: 48,
                height: 42,
                speed: 1
            }
        };

        if (VehicleManager.DEBUG) {
            console.log('Vehicles manager initialized');
        }
    }

    // Add a new vehicle
    addVehicle(type, x, y, direction) {
        const vehicleConfig = this.vehicleTypes[type];
        if (!vehicleConfig) {
            console.error(`Invalid vehicle type: ${type}`);
            return null;
        }

        const vehicle = new Vehicle(
            x, 
            y, 
            vehicleConfig.sprite,
            type,
            direction,
            vehicleConfig.speed
        );

        this.activeVehicles.push(vehicle);
        
        if (VehicleManager.DEBUG) {
            console.log(`Added ${type} vehicle at (${x},${y})`);
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
