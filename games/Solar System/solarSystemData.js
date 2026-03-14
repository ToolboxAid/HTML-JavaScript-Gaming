// ToolboxAid.com
// David Quesenberry
// solarSystemData.js
// 03/13/2026

import { solarSystemConfig } from './global.js';

function randomAngle() {
    return Math.random() * Math.PI * 2;
}

export const solarSystemBodies = [
    {
        name: "Sun",
        radius: solarSystemConfig.simulation.sunRadius,
        distance: 0.01,
        color: "yellow",
        angle: 0.01,
        speed: 0.01
    },
    {
        name: "Mercury",
        radius: 3,
        distance: 50,
        color: "gray",
        angle: randomAngle(),
        speed: 0.16,
        moons: [
            { radius: 0.5, distance: 5, angle: randomAngle(), speed: 1.0 }
        ]
    },
    {
        name: "Venus",
        radius: 5,
        distance: 75,
        color: "orange",
        angle: randomAngle(),
        speed: 0.12,
        moons: [
            { radius: 1, distance: 10, angle: randomAngle(), speed: 0.75 }
        ]
    },
    {
        name: "Earth",
        radius: 6,
        distance: 115,
        color: "blue",
        angle: randomAngle(),
        speed: 0.08,
        moons: [
            { radius: 1.5, distance: 12, angle: randomAngle(), speed: 1.0 }
        ]
    },
    {
        name: "Mars",
        radius: 5,
        distance: 150,
        color: "red",
        angle: randomAngle(),
        speed: 0.064,
        moons: [
            { radius: 0.8, distance: 10, angle: randomAngle(), speed: 0.5 },
            { radius: 0.5, distance: 3, angle: randomAngle(), speed: 0.8 }
        ]
    },
    {
        name: "Jupiter",
        radius: 15,
        distance: 200,
        color: "orange",
        angle: randomAngle(),
        speed: 0.04,
        moons: [
            { radius: 2.5, distance: 28, angle: randomAngle(), speed: 0.3 },
            { radius: 2, distance: 23, angle: randomAngle(), speed: 0.4 },
            { radius: 1.5, distance: 18, angle: randomAngle(), speed: 0.6 }
        ]
    },
    {
        name: "Saturn",
        radius: 12,
        distance: 260,
        color: "gold",
        angle: randomAngle(),
        speed: 0.024,
        moons: [
            { radius: 2, distance: 20, angle: randomAngle(), speed: 0.2 },
            { radius: 1.5, distance: 17, angle: randomAngle(), speed: 0.3 },
            { radius: 1, distance: 15, angle: randomAngle(), speed: 0.4 }
        ],
        ring: { ringRadius: 21, color: "rgba(220, 220, 220, 0.5)" }
    },
    {
        name: "Uranus",
        radius: 8,
        distance: 310,
        color: "lightblue",
        angle: randomAngle(),
        speed: 0.016,
        moons: [
            { radius: 1.2, distance: 18, angle: randomAngle(), speed: 0.2 },
            { radius: 0.8, distance: 14, angle: randomAngle(), speed: 0.3 }
        ],
        ring: { ringRadius: 14, color: "rgba(150, 170, 190, 0.5)" }
    },
    {
        name: "Neptune",
        radius: 8,
        distance: 370,
        color: "blue",
        angle: randomAngle(),
        speed: 0.008,
        moons: [
            { radius: 1, distance: 22, angle: randomAngle(), speed: 0.2 },
            { radius: 0.7, distance: 18, angle: randomAngle(), speed: 0.4 }
        ],
        ring: { ringRadius: 14, color: "rgba(100, 120, 140, 0.5)" }
    }
];

