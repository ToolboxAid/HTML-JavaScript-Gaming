// ToolboxAid.com
// David Quesenberry
// game.js
// 10/16/2024

import { canvasConfig } from './global.js'; // Import canvasConfig
import CanvasUtils from '../scripts/canvas.js'; // shows as unused, but it is required.
import Fullscreen from '../scripts/fullscreen.js'; // shows as unused, but it is required.

const sunRadius = 20;

const celestialBodies = [
    { name: "Sun", radius: sunRadius, distance: 0, color: "yellow", angle: 0, speed: 0 },

    { name: "Mercury", radius: 3, distance: 50, color: "gray", angle: Math.random() * Math.PI * 2, speed: 0.02,
      moons: [{ radius: 0.5, distance: 5, angle: Math.random() * Math.PI * 2, speed: 0.05 }] },

    { name: "Venus", radius: 5, distance: 75, color: "orange", angle: Math.random() * Math.PI * 2, speed: 0.015,
      moons: [{ radius: 1, distance: 10, angle: Math.random() * Math.PI * 2, speed: 0.03 }] },

    { name: "Earth", radius: 6, distance: 115, color: "blue", angle: Math.random() * Math.PI * 2, speed: 0.01,
      moons: [
        { radius: 1.5, distance: 12, angle: Math.random() * Math.PI * 2, speed: 0.02 }
      ] },

    { name: "Mars", radius: 5, distance: 150, color: "red", angle: Math.random() * Math.PI * 2, speed: 0.008,
      moons: [
        { radius: 0.8, distance: 10, angle: Math.random() * Math.PI * 2, speed: 0.025 },
        { radius: 0.5, distance: 3, angle: Math.random() * Math.PI * 2, speed: 0.04 }
      ] },

    { name: "Jupiter", radius: 15, distance: 200, color: "orange", angle: Math.random() * Math.PI * 2, speed: 0.005,
      moons: [
        { radius: 2.5, distance: 28, angle: Math.random() * Math.PI * 2, speed: 0.015 },
        { radius: 2, distance: 23, angle: Math.random() * Math.PI * 2, speed: 0.02 },
        { radius: 1.5, distance: 18, angle: Math.random() * Math.PI * 2, speed: 0.03 }
      ] },

    { name: "Saturn", radius: 12, distance: 260, color: "gold", angle: Math.random() * Math.PI * 2, speed: 0.003,
      ring: { outerRadius: 21, innerRadius: 14, color: "rgba(220, 220, 220, 0.5)" },
      moons: [
        { radius: 2, distance: 20, angle: Math.random() * Math.PI * 2, speed: 0.01 },
        { radius: 1.5, distance: 17, angle: Math.random() * Math.PI * 2, speed: 0.015 },
        { radius: 1, distance: 15, angle: Math.random() * Math.PI * 2, speed: 0.02 }
      ] },

    { name: "Uranus", radius: 8, distance: 310, color: "lightblue", angle: Math.random() * Math.PI * 2, speed: 0.002,
      ring: { outerRadius: 14, innerRadius: 10, color: "rgba(150, 170, 190, 0.5)" },
      moons: [
        { radius: 1.2, distance: 18, angle: Math.random() * Math.PI * 2, speed: 0.01 },
        { radius: 0.8, distance: 14, angle: Math.random() * Math.PI * 2, speed: 0.015 }
      ] },

    { name: "Neptune", radius: 8, distance: 370, color: "blue", angle: Math.random() * Math.PI * 2, speed: 0.001,
      ring: { outerRadius: 14, innerRadius: 10, color: "rgba(100, 120, 140, 0.5)" },
      moons: [
        { radius: 1, distance: 22, angle: Math.random() * Math.PI * 2, speed: 0.01 },
        { radius: 0.7, distance: 18, angle: Math.random() * Math.PI * 2, speed: 0.02 }
      ] }

];

function moveSolarSystem(ctx) {

    const centerX = canvasConfig.width / 2;
    const centerY = canvasConfig.height / 2;

    celestialBodies.forEach(body => {
        body.angle += body.speed;
        const x = centerX + body.distance * Math.cos(body.angle);
        const y = centerY + body.distance * Math.sin(body.angle);

        drawOrbitPath(ctx, centerX, centerY, body.distance, "rgba(200, 200, 200, 0.35)");

        if (body.ring) {
            drawRing(ctx, x, y, body.ring.outerRadius, body.ring.innerRadius, body.ring.color);
        }
        
        drawCircle(ctx, x, y, body.radius, body.color);

        if (body.moons) {
            body.moons.forEach(moon => {
                moon.angle += moon.speed;
                const moonX = x + moon.distance * Math.cos(moon.angle);
                const moonY = y + moon.distance * Math.sin(moon.angle);
                drawCircle(ctx, moonX, moonY, moon.radius, getRandomGrayColor());
            });
        }				
    });
}

function drawCircle(ctx, x, y, radius, color) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}

function getRandomGrayColor() {
    const shade = Math.floor(Math.random() * 128) + 128;
    return `rgb(${shade}, ${shade}, ${shade})`;
}

function drawRing(ctx, x, y, outerRadius, innerRadius, color) {
    ctx.beginPath();
    ctx.arc(x, y, outerRadius, 0, Math.PI * 2);
    ctx.arc(x, y, innerRadius, 0, Math.PI * 2, true); // Counterclockwise to create a hole
    ctx.closePath(); // Close the path
    ctx.fillStyle = color;
    ctx.fill();
}

function drawOrbitPath(ctx, x, y, radius, color) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1; // Adjust the line width as needed
    ctx.setLineDash([5, 5]); // Set the line dash pattern (optional)
    ctx.stroke();
}


//==========================================================================

// Game loop function
export function gameLoop(ctx) {

    // Update and Draw solar system.
    moveSolarSystem(ctx);
}

// Canvas needs to know the current directory to game.js
const currentDir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
window.canvasPath = currentDir;
