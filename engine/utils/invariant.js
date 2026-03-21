/*
Toolbox Aid
David Quesenberry
03/21/2026
invariant.js
*/
export function invariant(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}
