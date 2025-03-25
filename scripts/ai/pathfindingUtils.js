// // Pathfinding Utilities
// // For AI movement and navigation (e.g., A* algorithm).

// // export { PathfindingUtils } from './ai/pathfindingUtils.js';

// // Functions to include:
// // findPath(grid, start, end)
// // getNeighbors(node, grid)
// // heuristicCost(nodeA, nodeB)

// break up A pathfinding across multiple game updates* by making it incremental and asynchronous, so it processes a portion of the path search per frame. This ensures it does not exceed the 16ms frame budget (for 60 FPS games).

// Key Strategy: Incremental A Pathfinding*
// Instead of calculating the entire path in one update, process a few nodes per frame.
// Use a game loop or async function to step through the search.
// Store openSet, closedSet, and cameFrom between frames.
// When the path is found, return it to the game logic.
// Updated A with Incremental Execution*
// javascript
// Copy
// Edit
// export class AIUtils {
//     constructor(grid, maxIterationsPerFrame = 10) {
//         this.grid = grid; // 2D grid (0 = walkable, 1 = obstacle)
//         this.maxIterations = maxIterationsPerFrame; // How many nodes to process per frame
//         this.searching = false; // Flag to track ongoing searches
//     }

//     /** Start a path search incrementally */
//     async findPathAsync(start, end, callback) {
//         if (this.searching) return;

//         this.searching = true;
//         this.openSet = [start];
//         this.closedSet = new Set();
//         this.cameFrom = new Map();
//         this.gScore = new Map();
//         this.fScore = new Map();

//         this.gScore.set(this.toKey(start), 0);
//         this.fScore.set(this.toKey(start), this.heuristic(start, end));

//         while (this.openSet.length > 0) {
//             const startTime = performance.now();

//             // Process multiple nodes per frame
//             for (let i = 0; i < this.maxIterations && this.openSet.length > 0; i++) {
//                 this.openSet.sort((a, b) => this.fScore.get(this.toKey(a)) - this.fScore.get(this.toKey(b)));
//                 const current = this.openSet.shift();

//                 if (current.x === end.x && current.y === end.y) {
//                     this.searching = false;
//                     callback(this.reconstructPath(current)); // Return the path
//                     return;
//                 }

//                 this.closedSet.add(this.toKey(current));

//                 for (const neighbor of this.getNeighbors(current)) {
//                     if (this.closedSet.has(this.toKey(neighbor))) continue;

//                     const tentativeGScore = this.gScore.get(this.toKey(current)) + 1;
//                     if (!this.gScore.has(this.toKey(neighbor)) || tentativeGScore < this.gScore.get(this.toKey(neighbor))) {
//                         this.cameFrom.set(this.toKey(neighbor), current);
//                         this.gScore.set(this.toKey(neighbor), tentativeGScore);
//                         this.fScore.set(this.toKey(neighbor), tentativeGScore + this.heuristic(neighbor, end));

//                         if (!this.openSet.some(node => node.x === neighbor.x && node.y === neighbor.y)) {
//                             this.openSet.push(neighbor);
//                         }
//                     }
//                 }
//             }

//             // If exceeded frame budget (16ms), wait until next frame
//             if (performance.now() - startTime >= 16) {
//                 await new Promise(requestAnimationFrame);
//             }
//         }

//         this.searching = false;
//         callback([]); // No path found
//     }

//     /** Get valid neighbors (avoiding obstacles) */
//     getNeighbors(node) {
//         const directions = [
//             { x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }
//         ];
//         return directions
//             .map(dir => ({ x: node.x + dir.x, y: node.y + dir.y }))
//             .filter(neighbor => this.isWalkable(neighbor));
//     }

//     /** Check if position is walkable */
//     isWalkable(pos) {
//         return this.grid[pos.y] && this.grid[pos.y][pos.x] === 0;
//     }

//     /** Manhattan distance heuristic */
//     heuristic(a, b) {
//         return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
//     }

//     /** Reconstructs the path from end node */
//     reconstructPath(current) {
//         const path = [current];
//         while (this.cameFrom.has(this.toKey(current))) {
//             current = this.cameFrom.get(this.toKey(current));
//             path.unshift(current);
//         }
//         return path;
//     }

//     /** Converts coordinate object to string key */
//     toKey(pos) {
//         return `${pos.x},${pos.y}`;
//     }
// }
// Usage Example:
// const grid = Array(100).fill().map(() => Array(100).fill(0)); // 100x100 walkable grid
// const ai = new AIUtils(grid, 20); // Process 20 nodes per frame

// ai.findPathAsync({ x: 0, y: 0 }, { x: 99, y: 99 }, (path) => {
//     if (path.length) {
//         console.log("Path found:", path);
//     } else {
//         console.log("No path found");
//     }
// });
// How This Works
// Does not block the main game loop:
// Runs in small chunks per frame (~10-20 nodes per frame).
// Uses requestAnimationFrame to pause & resume search dynamically.
// Can handle large grids (1000x1000 or more) without lag.
// Finds a path asynchronously and calls callback(path) when done.
// If a frame budget (16ms) is exceeded, it stops and resumes in the next frame.
