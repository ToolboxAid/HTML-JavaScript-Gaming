import Level from './level.js';
import VehicleManager from './vehicleManager.js';
import CanvasUtils from '../scripts/canvas.js';
import SystemUtils from '../scripts/utils/systemUtils.js';

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
        // Row 1: Cars moving left
        this.vehicleManager.addVehicle('car1', 100, 585, -1);
        this.vehicleManager.addVehicle('car1', 300, 585, -1);

        this.vehicleManager.addVehicle('car2', 200, 650, 1);
        this.vehicleManager.addVehicle('car2', 500, 650, 1);

        this.vehicleManager.addVehicle('car3', 700, 700, -1);
        this.vehicleManager.addVehicle('car3', 600, 700, -1);

        // // Row 2: Trucks moving right
        // this.vehicleManager.addVehicle('truck', 0, 750, 1);
        // this.vehicleManager.addVehicle('truck', 200, 750, 1);

        // // Row 3: Bulldozers moving left
        // this.vehicleManager.addVehicle('bulldozer', 200, 800, -1);
        // this.vehicleManager.addVehicle('bulldozer', 400, 800, -1);

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
            if (vehicle.direction > 0 && vehicle.x > 800) {
                vehicle.x = -vehicle.width;
            } else if (vehicle.direction < 0 && vehicle.x < -vehicle.width) {
                vehicle.x = 800;
            }
        }

    }

    draw() {
        const ctx = CanvasUtils.ctx;
        // Draw level
        this.level.draw(ctx);

        // Draw attract mode text
        ctx.fillStyle = '#FFF';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        // ctx.fillText('PRESS START', 400, 300);
        // ctx.fillText('1 PLAYER ONLY', 400, 340);


        // Draw vehicles

        let cnt = 0;
        for (const vehicle of this.vehicleManager.activeVehicles) {
            vehicle.draw(ctx);


        }

    }

    isComplete() {
        return !this.isActive;
    }
}

export default AttractMode;