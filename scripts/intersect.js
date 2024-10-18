// ToolboxAid.com
// David Quesenberry
// intersect.js
// 10/16/2024

import CanvasUtils from '../scripts/canvas.js';

class Intersect {
    static checkIntersection(ctx, dynamicObject, staticObject) {
        // Future position of the dynamic object
        const futureSquareX = dynamicObject.x + dynamicObject.velocityX;
        const futureSquareY = dynamicObject.y + dynamicObject.velocityY;

        // Rectangle boundaries
        const rectLeft = staticObject.x;
        const rectRight = staticObject.x + staticObject.width;
        const rectTop = staticObject.y;
        const rectBottom = staticObject.y + staticObject.height;

        // Draw current, future, and static objects
        Intersect.drawObjects(ctx, dynamicObject, futureSquareX, futureSquareY, staticObject);

        // Initialize entry and exit points
        const entryExitPoints = {
            left: { entry: null, exit: null },
            right: { entry: null, exit: null },
            top: { entry: null, exit: null },
            bottom: { entry: null, exit: null },
        };

        // Check intersections
        Intersect.checkEdges(dynamicObject, futureSquareX, futureSquareY, rectLeft, rectRight, rectTop, rectBottom, entryExitPoints);

        // Log entry and exit points
        Intersect.logEntryExit(ctx, entryExitPoints);

        // Calculate angles if both entry and exit exist
        Intersect.calculateAngles(entryExitPoints);
    }

    static drawObjects(ctx, dynamicObject, futureX, futureY, staticObject) {
        // Draw the current dynamic object (blue)
        ctx.fillStyle = "blue";
        ctx.fillRect(dynamicObject.x, dynamicObject.y, dynamicObject.width, dynamicObject.height);
        
        // Draw the future dynamic object (green)
        ctx.fillStyle = "green";
        ctx.fillRect(futureX, futureY, dynamicObject.width, dynamicObject.height);
        
        // Draw the static object (red)
        ctx.fillStyle = "red";
        ctx.fillRect(staticObject.x, staticObject.y, staticObject.width, staticObject.height);
        
        // Draw line connecting current and future position
        ctx.strokeStyle = 'purple';
        CanvasUtils.drawLine(ctx, dynamicObject.x + dynamicObject.width / 2, dynamicObject.y + dynamicObject.height / 2, 
                           futureX + dynamicObject.width / 2, futureY + dynamicObject.height / 2, 1);
    }

    static checkEdges(dynamicObject, futureX, futureY, rectLeft, rectRight, rectTop, rectBottom, points) {
        // Use a single function to check for both entry and exit for each edge
        const checkEdge = (edge) => {
            let intersectY, intersectX;
            const slope = (dynamicObject.velocityY / dynamicObject.velocityX);
            
            if (edge === "left" || edge === "right") {
                intersectY = dynamicObject.y + slope * (edge === "left" ? rectLeft - dynamicObject.x : rectRight - dynamicObject.x);
                if (intersectY >= rectTop && intersectY <= rectBottom) {
                    if (dynamicObject.x + dynamicObject.width <= (edge === "left" ? rectLeft : rectRight) && 
                        futureX + dynamicObject.width > (edge === "left" ? rectLeft : rectRight)) {
                        points[edge].entry = { x: edge === "left" ? rectLeft : rectRight, y: intersectY };
                    }
                    if (dynamicObject.x >= (edge === "left" ? rectLeft : rectRight) && 
                        futureX < (edge === "left" ? rectLeft : rectRight)) {
                        points[edge].exit = { x: edge === "left" ? rectLeft : rectRight, y: intersectY };
                    }
                }
            } else {
                intersectX = dynamicObject.x + slope * (edge === "top" ? rectTop - dynamicObject.y : rectBottom - dynamicObject.y);
                if (intersectX >= rectLeft && intersectX <= rectRight) {
                    if (dynamicObject.y + dynamicObject.height <= (edge === "top" ? rectTop : rectBottom) && 
                        futureY + dynamicObject.height > (edge === "top" ? rectTop : rectBottom)) {
                        points[edge].entry = { x: intersectX, y: edge === "top" ? rectTop : rectBottom };
                    }
                    if (dynamicObject.y >= (edge === "top" ? rectTop : rectBottom) && 
                        futureY < (edge === "top" ? rectTop : rectBottom)) {
                        points[edge].exit = { x: intersectX, y: edge === "top" ? rectTop : rectBottom };
                    }
                }
            }
        };

        // Check all edges
        checkEdge("left");
        checkEdge("right");
        checkEdge("top");
        checkEdge("bottom");
    }

    static logEntryExit(ctx, points) {
        for (const edge in points) {
            if (points[edge].entry) {
                ctx.fillStyle = 'yellow';
                ctx.fillRect(points[edge].entry.x - 5, points[edge].entry.y - 5, 10, 10); // Draw entry point
                console.log(`${edge.charAt(0).toUpperCase() + edge.slice(1)} Entry Point: (${points[edge].entry.x}, ${points[edge].entry.y})`);
            }
            if (points[edge].exit) {
                ctx.fillStyle = 'orange';
                ctx.fillRect(points[edge].exit.x - 5, points[edge].exit.y - 5, 10, 10); // Draw exit point
                console.log(`${edge.charAt(0).toUpperCase() + edge.slice(1)} Exit Point: (${points[edge].exit.x}, ${points[edge].exit.y})`);
            }
        }
    }

    static calculateAngles(points) {
        for (const edge in points) {
            if (points[edge].entry && points[edge].exit) {
                const angleX = Math.atan2(points[edge].exit.y - points[edge].entry.y, points[edge].exit.x - points[edge].entry.x) * (180 / Math.PI);
                console.log(`Angle from ${edge.charAt(0).toUpperCase() + edge.slice(1)} Entry to ${edge.charAt(0).toUpperCase() + edge.slice(1)} Exit: ${angleX.toFixed(2)}°`);
            }
        }
    }
}

// Export the Intersect class
export default Intersect;


// import Intersect from '../scripts/intersect.js'; 

    
// 	// Test entry and exit points
//     if (false) {
//     // // Test entry and exit points (Example Logic)
//     // // You can keep this section for testing intersection logic
//     // // Instantiate a static rectangle object
//     // let rectangleObject = new ObjectStatic(100, 100, 160, 100);
//     // let squareObject = null;
//     // let result = null;

//         // Instantiate a static rectangle object
//         let rectangleObject = new ObjectStatic(100, 100, 160, 100);

//         let squareObject = null;
//         let result = null;
//         //  ObjectDynamic ( x, y, width, height, velocityX, velocityY )

//         /* ------------------------------------
//         Enter Left: Exit Top, Right, Bottom
//         ------------------------------------ */
//         if (false) {

//             // Exit TOP  (--- not working on exit ---)
//             squareObject = new ObjectDynamic(30, 150, 10, 10, 300, -100);
//             result = checkIntersection(ctx, squareObject, rectangleObject);

//             // Exit RIGHT
//             squareObject = new ObjectDynamic(30, 150, 10, 10, 300, 0);
//             result = checkIntersection(ctx, squareObject, rectangleObject);

//             // Exit Bottom
//             squareObject = new ObjectDynamic(30, 150, 10, 10, 300, 100);
//             result = checkIntersection(ctx, squareObject, rectangleObject);
//         }
//         /* ------------------------------------
//         Enter TOP: Exit Left, Right, Bottom
//         ------------------------------------    */
//         if (true) {

//             // Exit Right
//             squareObject = new ObjectDynamic(180, 30, 10, 10, 125, 200);
//             result = checkIntersection(ctx, squareObject, rectangleObject);

//             // Exit Bottom
//             squareObject = new ObjectDynamic(180, 30, 10, 10, 0, 200);
//             result = checkIntersection(ctx, squareObject, rectangleObject);

//             // Exit Left   (--- not working on exit ---)
//             squareObject = new ObjectDynamic(180, 30, 10, 10, -125, 200);
//             result = checkIntersection(ctx, squareObject, rectangleObject);
//         }

//         /* ------------------------------------
//         Enter Right: Exit Left, Top, Bottom
//         ------------------------------------*/
//         if (false) {
//             // Exit TOP   (--- not working on exit ---)
//             squareObject = new ObjectDynamic(280, 150, 10, 10, -125, -125);
//             result = checkIntersection(ctx, squareObject, rectangleObject);

//             // Exit Left   (--- not working on exit ---)
//             squareObject = new ObjectDynamic(280, 150, 10, 10, -225, 0);
//             result = checkIntersection(ctx, squareObject, rectangleObject);

//             // Exit Bottom
//             squareObject = new ObjectDynamic(280, 150, 10, 10, -125, 125);
//             result = checkIntersection(ctx, squareObject, rectangleObject);
//         }

//         /* ------------------------------------
//         Enter Right: Exit Left, Top, Bottom
//         ------------------------------------*/
//         if (true) {
//             // Exit Left   (--- not working on exit ---)
//             squareObject = new ObjectDynamic(170, 220, 10, 10, -125, -100);
//             result = checkIntersection(ctx, squareObject, rectangleObject);

//             // Exit Top   (--- not working on exit ---)
//             squareObject = new ObjectDynamic(170, 220, 10, 10, 0, -185);
//             result = checkIntersection(ctx, squareObject, rectangleObject);

//             // Exit Right
//             squareObject = new ObjectDynamic(170, 220, 10, 10, 125, -100);
//             result = checkIntersection(ctx, squareObject, rectangleObject);
//         }
//     }
    
