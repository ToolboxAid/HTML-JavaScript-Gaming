// ToolboxAid.com
// David Quesenberry
// game.js
// 10/16/2024

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

var context;

function moveSolarSystem() {

    const centerX = gameAreaWidth / 2;
    const centerY = gameAreaHeight / 2;

    celestialBodies.forEach(body => {
        body.angle += body.speed;
        const x = centerX + body.distance * Math.cos(body.angle);
        const y = centerY + body.distance * Math.sin(body.angle);

        drawOrbitPath(centerX, centerY, body.distance, "rgba(200, 200, 200, 0.35)");

        if (body.ring) {
            drawRing(x, y, body.ring.outerRadius, body.ring.innerRadius, body.ring.color);
        }
        
        drawCircle(x, y, body.radius, body.color);

        if (body.moons) {
            body.moons.forEach(moon => {
                moon.angle += moon.speed;
                const moonX = x + moon.distance * Math.cos(moon.angle);
                const moonY = y + moon.distance * Math.sin(moon.angle);
                drawCircle(moonX, moonY, moon.radius, getRandomGrayColor());
            });
        }				
    });
}

function drawCircle(x, y, radius, color) {
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fillStyle = color;
    context.fill();
    context.closePath();
}

function getRandomGrayColor() {
    const shade = Math.floor(Math.random() * 128) + 128;
    return `rgb(${shade}, ${shade}, ${shade})`;
}

function drawRing(x, y, outerRadius, innerRadius, color) {
    context.beginPath();
    context.arc(x, y, outerRadius, 0, Math.PI * 2);
    context.arc(x, y, innerRadius, 0, Math.PI * 2, true); // Counterclockwise to create a hole
    context.closePath(); // Close the path
    context.fillStyle = color;
    context.fill();
}

function drawOrbitPath(x, y, radius, color) {
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.strokeStyle = color;
    context.lineWidth = 1; // Adjust the line width as needed
    context.setLineDash([5, 5]); // Set the line dash pattern (optional)
    context.stroke();
}


//==========================================================================

// Game loop function
function gameLoop(ctx) {
    context = ctx;

    // Update and Draw solar system.
    moveSolarSystem();
}
