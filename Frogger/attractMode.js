import { canvasConfig } from './global.js';
import Level from './level.js';
import VehicleManager from './vehicleManager.js';
import CanvasUtils from '../scripts/canvas.js';

class AttractMode {
    static DEBUG = new URLSearchParams(window.location.search).has('attract');

    constructor() {
        // Initialize game components
        this.level = new Level();
        this.vehicleManager = new VehicleManager();

        // Attract mode state
        this.isActive = true;
        this.demoTimer = 0;
        this.maxDemoTime = 30 * 60; // 30 seconds at 60fps

        // Initialize vehicles for demo
        this.initializeVehicles();

        if (AttractMode.DEBUG) {
            console.log('Attract mode initialized');
        }
    }

    initializeVehicles() {
        const spacing = 63; // sprite is 56 px height
        const offsetYwater = 579;
        const offsetYroad = 571;
        const offsetYaligator = offsetYwater-18;
        const offsetYbeaver = offsetYwater-24;
        const offsetYsnake = offsetYwater-5;
        const offsetYbonus = offsetYwater-5;

        // Water hazard
        // Row 10: Logs moving right
        this.vehicleManager.addVehicle('logMed', 0, offsetYwater + (spacing * -6), 1);
        this.vehicleManager.addVehicle('aligator', -300, offsetYaligator + (spacing * -6), 1);
        this.vehicleManager.addVehicle('beaver', 250, offsetYbeaver + (spacing * -6), 1);

        // Row 9: Logs moving left
        this.vehicleManager.addVehicle('turtle', 0, offsetYwater + (spacing * -5), -1);
        this.vehicleManager.addVehicle('beaver', 250, offsetYbeaver + (spacing * -5), -1);

        // Row 8: Logs moving right
        this.vehicleManager.addVehicle('logLrg', 0, offsetYwater + (spacing * -4), 1);
        this.vehicleManager.addVehicle('beaver', 250, offsetYbeaver + (spacing * -4), 1);
        this.vehicleManager.addVehicle('snake', 500, offsetYsnake + (spacing * -4), 1);

        // Row 7: Logs moving right
        this.vehicleManager.addVehicle('logSm', 0, offsetYwater + (spacing * -3), 1);
        this.vehicleManager.addVehicle('beaver', 400, offsetYbeaver + (spacing * -3), 1);
        this.vehicleManager.addVehicle('bonus', 600, offsetYbonus + (spacing * -3), 1);

        // Row 6: Logs moving left
        this.vehicleManager.addVehicle('turtleSink', 0, offsetYwater + (spacing * -2), -1);
        this.vehicleManager.addVehicle('beaver', 200, offsetYbeaver + (spacing * -2), -1);

        // safety zone
        this.vehicleManager.addVehicle('snake', 500, offsetYsnake + (spacing * -1), -1);

        // vihicles
        // Row 5: Trucks moving left
        this.vehicleManager.addVehicle('truck', 0, offsetYroad + (spacing * 0), -1);
        this.vehicleManager.addVehicle('truck', 200, offsetYroad + (spacing * 0), -1);

        // Row 4: White cars moving right
        this.vehicleManager.addVehicle('car3', 700, offsetYroad + (spacing * 1), 1);
        this.vehicleManager.addVehicle('car3', 600, offsetYroad + (spacing * 1), 1);


        // Row 3: Pink cars moving left
        this.vehicleManager.addVehicle('car2', 200, offsetYroad + (spacing * 2), -1);
        this.vehicleManager.addVehicle('car2', 500, offsetYroad + (spacing * 2), -1);

        // Row 2: Bulldozers moving Right
        this.vehicleManager.addVehicle('bulldozer', 200, offsetYroad + (spacing * 3), 1);
        this.vehicleManager.addVehicle('bulldozer', 400, offsetYroad + (spacing * 3), 1);

        // Row 1: Cars moving left
        this.vehicleManager.addVehicle('car1', 100, offsetYroad + (spacing * 4), -1);
        this.vehicleManager.addVehicle('car1', 300, offsetYroad + (spacing * 4), -1);


        if (AttractMode.DEBUG) {
            console.log(`Vehicles: ${this.vehicleManager.activeVehicles.length}`);
            for (const vehicle of this.vehicleManager.activeVehicles) {
                console.log(`Vehicle: ${vehicle.vehicleType}, Position: (${vehicle.x}, ${vehicle.y}), Direction: ${vehicle.direction}`);
            }
        }
    }

    update() {
        //if (!this.isActive) return;
        this.level.update();

        // Update demo timer
        this.demoTimer++;
        if (this.demoTimer >= this.maxDemoTime) {
            this.isActive = false;
        }


        // Update all vehicles
        for (const vehicle of this.vehicleManager.activeVehicles) {
            // Move vehicle
            vehicle.x += vehicle.speed * vehicle.direction;

            // Wrap around screen
            if (vehicle.direction > 0 && vehicle.x > CanvasUtils.getConfigWidth() + vehicle.width) {
                vehicle.x = -vehicle.width;
            } else if (vehicle.direction < 0 && vehicle.x < -vehicle.width * 2) {
                vehicle.x = CanvasUtils.getConfigWidth() + vehicle.width;
            }
        }

    }

    draw() {
        // Draw level
        this.level.draw();

        // Draw vehicles
        for (const vehicle of this.vehicleManager.activeVehicles) {
            vehicle.draw();
        }

    }

    isComplete() {
        return !this.isActive;
    }
}

export default AttractMode;