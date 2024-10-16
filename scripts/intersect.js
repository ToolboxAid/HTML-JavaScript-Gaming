// ToolboxAid.com
// David Quesenberry
// intersect.js
// 10/16/2024

// Check for intersection
function checkIntersection(ctx, dynamicObject, staticObject) {
    // Future position of the dynamic object
    let futureSquareX = dynamicObject.x + dynamicObject.velocityX;
    let futureSquareY = dynamicObject.y + dynamicObject.velocityY;

    // Rectangle boundaries
    let rectLeft = staticObject.x;
    let rectRight = staticObject.x + staticObject.width;
    let rectTop = staticObject.y;
    let rectBottom = staticObject.y + staticObject.height;

    // Draw current, future, and static objects
    drawObjects(ctx, dynamicObject, futureSquareX, futureSquareY, staticObject);

    // Initialize entry and exit points
    let entryExitPoints = {
        left: { entry: null, exit: null },
        right: { entry: null, exit: null },
        top: { entry: null, exit: null },
        bottom: { entry: null, exit: null },
    };

    // Check intersections
    checkEdges(dynamicObject, futureSquareX, futureSquareY, rectLeft, rectRight, rectTop, rectBottom, entryExitPoints);

    // Log entry and exit points
    logEntryExit(ctx, entryExitPoints);

    // Calculate angles if both entry and exit exist
    calculateAngles(entryExitPoints);
}

function drawObjects(ctx, dynamicObject, futureX, futureY, staticObject) {
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
    drawLine(ctx, dynamicObject.x + dynamicObject.width / 2, dynamicObject.y + dynamicObject.height / 2, 
             futureX + dynamicObject.width / 2, futureY + dynamicObject.height / 2, 1);
}

function checkEdges(dynamicObject, futureX, futureY, rectLeft, rectRight, rectTop, rectBottom, points) {
    // Use a single function to check for both entry and exit for each edge
    function checkEdge(edge, direction) {
        let intersectY, intersectX;
        let slope = (dynamicObject.velocityY / dynamicObject.velocityX);
        
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
    }

    // Check all edges
    checkEdge("left");
    checkEdge("right");
    checkEdge("top");
    checkEdge("bottom");
}

function logEntryExit(ctx, points) {
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

function calculateAngles(points) {
    for (const edge in points) {
        if (points[edge].entry && points[edge].exit) {
            let angleX = Math.atan2(points[edge].exit.y - points[edge].entry.y, points[edge].exit.x - points[edge].entry.x) * (180 / Math.PI);
            console.log(`Angle from ${edge.charAt(0).toUpperCase() + edge.slice(1)} Entry to ${edge.charAt(0).toUpperCase() + edge.slice(1)} Exit: ${angleX.toFixed(2)}°`);
        }
    }
}


// // ToolboxAid.com
// // David Quesenberry
// // intersect.js
// // 10/16/2024

// // Check for intersection
// // This test is for a dynamic object (moving) against a static object (not moving)
// function checkIntersection(ctx, dynamicObject, staticObject) {
//     // Calculate future position of the square
//     let futureSquareX = dynamicObject.x + dynamicObject.velocityX;
//     let futureSquareY = dynamicObject.y + dynamicObject.velocityY;

//     // Determine the rectangle's boundaries
//     let rectLeft = staticObject.x;
//     let rectRight = staticObject.x + staticObject.width;
//     let rectTop = staticObject.y;
//     let rectBottom = staticObject.y + staticObject.height;

//     // Draw the current square (blue)
//     ctx.fillStyle = "blue";
//     ctx.fillRect(dynamicObject.x,dynamicObject.y, dynamicObject.width, dynamicObject.height);

//     // Draw the future square (green)
//     ctx.fillStyle = "green";
//     ctx.fillRect(futureSquareX, futureSquareY, dynamicObject.width, dynamicObject.height);

//     // Draw the rectangle (red)
//     ctx.fillStyle = "red";
//     ctx.fillRect(staticObject.x, staticObject.y, staticObject.width, staticObject.height);

//     // Draw a line between the current square and future square
//     ctx.strokeStyle = 'purple'; // Change the line color to purple
//     drawLine(ctx, dynamicObject.x + dynamicObject.width / 2,dynamicObject.y + dynamicObject.height / 2, futureSquareX + dynamicObject.width / 2, futureSquareY + dynamicObject.height / 2, 1);

//     // Initialize entry and exit points for all edges
//     let leftEntry = null;
//     let leftExit = null;
//     let rightEntry = null;
//     let rightExit = null;
//     let topEntry = null;
//     let topExit = null;
//     let bottomEntry = null;
//     let bottomExit = null;

//     // Check against the four edges of the rectangle for entry and exit points
//     // Left edge
//     if (dynamicObject.x + dynamicObject.width <= rectLeft && futureSquareX + dynamicObject.width > rectLeft) {
//         let slope = (dynamicObject.velocityY / dynamicObject.velocityX);
//         let intersectY =dynamicObject.y + slope * (rectLeft - dynamicObject.x);
//         if (intersectY >= rectTop && intersectY <= rectBottom) {
//             leftEntry = { x: rectLeft, y: intersectY };
//         }
//     }
    
//     // Left exit
//     if (dynamicObject.x <= rectLeft && futureSquareX + dynamicObject.width > rectLeft) {
//         let slope = (dynamicObject.velocityY / dynamicObject.velocityX);
//         let intersectY =dynamicObject.y + slope * (rectLeft - dynamicObject.x);
//         if (intersectY >= rectTop && intersectY <= rectBottom) {
//             leftExit = { x: rectLeft, y: intersectY };
//         }
//     }

//     // Right edge
//     if (dynamicObject.x < rectRight && futureSquareX + dynamicObject.width >= rectRight) {
//         let slope = (dynamicObject.velocityY / dynamicObject.velocityX);
//         let intersectY =dynamicObject.y + slope * (rectRight - dynamicObject.x);
//         if (intersectY >= rectTop && intersectY <= rectBottom) {
//             rightEntry = { x: rectRight, y: intersectY };
//         }
//     }

//     // Right exit
//     if (dynamicObject.x + dynamicObject.width >= rectRight && futureSquareX < rectRight) {
//         let slope = (dynamicObject.velocityY / dynamicObject.velocityX);
//         let intersectY =dynamicObject.y + slope * (rectRight - dynamicObject.x);
//         if (intersectY >= rectTop && intersectY <= rectBottom) {
//             rightExit = { x: rectRight, y: intersectY };
//         }
//     }

//     // Top edge
//     if (dynamicObject.y + dynamicObject.height <= rectTop && futureSquareY + dynamicObject.height > rectTop) {
//         let slope = (dynamicObject.velocityX / dynamicObject.velocityY);
//         let intersectX = dynamicObject.x + slope * (rectTop -dynamicObject.y);
//         if (intersectX >= rectLeft && intersectX <= rectRight) {
//             topEntry = { x: intersectX, y: rectTop };
//         }
//     }

//     // Top exit
//     if (dynamicObject.y <= rectTop && futureSquareY + dynamicObject.height > rectTop) {
//         let slope = (dynamicObject.velocityX / dynamicObject.velocityY);
//         let intersectX = dynamicObject.x + slope * (rectTop -dynamicObject.y);
//         if (intersectX >= rectLeft && intersectX <= rectRight) {
//             topExit = { x: intersectX, y: rectTop };
//         }
//     }

//     // Bottom edge
//     if (dynamicObject.y < rectBottom && futureSquareY + dynamicObject.height >= rectBottom) {
//         let slope = (dynamicObject.velocityX / dynamicObject.velocityY);
//         let intersectX = dynamicObject.x + slope * (rectBottom -dynamicObject.y);
//         if (intersectX >= rectLeft && intersectX <= rectRight) {
//             bottomEntry = { x: intersectX, y: rectBottom };
//         }
//     }

//     // Bottom exit
//     if (dynamicObject.y + dynamicObject.height >= rectBottom && futureSquareY < rectBottom) {
//         let slope = (dynamicObject.velocityX / dynamicObject.velocityY);
//         let intersectX = dynamicObject.x + slope * (rectBottom -dynamicObject.y);
//         if (intersectX >= rectLeft && intersectX <= rectRight) {
//             bottomExit = { x: intersectX, y: rectBottom };
//         }
//     }

//     // Log the entry and exit points if they exist
//     if (leftEntry) {
//         ctx.fillStyle = 'yellow';
//         ctx.fillRect(leftEntry.x - 5, leftEntry.y - 5, 10, 10); // Draw left entry point
//         console.log(`Left Entry Point: (${leftEntry.x}, ${leftEntry.y})`);
//     }

//     if (leftExit) {
//         ctx.fillStyle = 'orange';
//         ctx.fillRect(leftExit.x - 5, leftExit.y - 5, 10, 10); // Draw left exit point
//         console.log(`Left Exit Point: (${leftExit.x}, ${leftExit.y})`);
//     }

//     if (rightEntry) {
//         ctx.fillStyle = 'yellow';
//         ctx.fillRect(rightEntry.x - 5, rightEntry.y - 5, 10, 10); // Draw right entry point
//         console.log(`Right Entry Point: (${rightEntry.x}, ${rightEntry.y})`);
//     }

//     if (rightExit) {
//         ctx.fillStyle = 'orange';
//         ctx.fillRect(rightExit.x - 5, rightExit.y - 5, 10, 10); // Draw right exit point
//         console.log(`Right Exit Point: (${rightExit.x}, ${rightExit.y})`);
//     }

//     if (topEntry) {
//         ctx.fillStyle = 'yellow';
//         ctx.fillRect(topEntry.x - 5, topEntry.y - 5, 10, 10); // Draw top entry point
//         console.log(`Top Entry Point: (${topEntry.x}, ${topEntry.y})`);
//     }

//     if (topExit) {
//         ctx.fillStyle = 'orange';
//         ctx.fillRect(topExit.x - 5, topExit.y - 5, 10, 10); // Draw top exit point
//         console.log(`Top Exit Point: (${topExit.x}, ${topExit.y})`);
//     }

//     if (bottomEntry) {
//         ctx.fillStyle = 'yellow';
//         ctx.fillRect(bottomEntry.x - 5, bottomEntry.y - 5, 10, 10); // Draw bottom entry point
//         console.log(`Bottom Entry Point: (${bottomEntry.x}, ${bottomEntry.y})`);
//     }

//     if (bottomExit) {
//         ctx.fillStyle = 'orange';
//         ctx.fillRect(bottomExit.x - 5, bottomExit.y - 5, 10, 10); // Draw bottom exit point
//         console.log(`Bottom Exit Point: (${bottomExit.x}, ${bottomExit.y})`);
//     }

//     // Calculate angles if entry and exit points exist
//     if (leftEntry && leftExit) {
//         let angleX = Math.atan2(leftExit.y - leftEntry.y, leftExit.x - leftEntry.x) * (180 / Math.PI); // Angle in degrees
//         console.log(`Angle from Left Entry to Left Exit: ${angleX.toFixed(2)}°`);
//     }
    
//     if (rightEntry && rightExit) {
//         let angleX = Math.atan2(rightExit.y - rightEntry.y, rightExit.x - rightEntry.x) * (180 / Math.PI);
//         console.log(`Angle from Right Entry to Right Exit: ${angleX.toFixed(2)}°`);
//     }

//     if (topEntry && topExit) {
//         let angleX = Math.atan2(topExit.y - topEntry.y, topExit.x - topEntry.x) * (180 / Math.PI);
//         console.log(`Angle from Top Entry to Top Exit: ${angleX.toFixed(2)}°`);
//     }

//     if (bottomEntry && bottomExit) {
//         let angleX = Math.atan2(bottomExit.y - bottomEntry.y, bottomExit.x - bottomEntry.x) * (180 / Math.PI);
//         console.log(`Angle from Bottom Entry to Bottom Exit: ${angleX.toFixed(2)}°`);
//     }
// }
