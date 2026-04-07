/*
Toolbox Aid
David Quesenberry
03/21/2026
InputMap.js
*/
export default class InputMap {
    constructor(bindings = {}) {
        this.bindings = new Map();
        this.setBindings(bindings);
    }

    setBindings(bindings = {}) {
        this.bindings.clear();

        for (const [action, physicalInputs] of Object.entries(bindings)) {
            this.bindings.set(action, new Set(physicalInputs ?? []));
        }
    }

    setAction(action, physicalInputs = []) {
        this.bindings.set(action, new Set(physicalInputs));
    }

    hasAction(action) {
        return this.bindings.has(action);
    }

    getInputs(action) {
        return [...(this.bindings.get(action) ?? [])];
    }

    isActionDown(action, isInputDown) {
        const inputs = this.bindings.get(action);
        if (!inputs || typeof isInputDown !== 'function') {
            return false;
        }

        for (const input of inputs) {
            if (isInputDown(input)) {
                return true;
            }
        }

        return false;
    }

    isActionPressed(action, isInputPressed) {
        const inputs = this.bindings.get(action);
        if (!inputs || typeof isInputPressed !== 'function') {
            return false;
        }

        for (const input of inputs) {
            if (isInputPressed(input)) {
                return true;
            }
        }

        return false;
    }

    getSnapshot(isInputDown, isInputPressed) {
        const snapshot = {};

        for (const action of this.bindings.keys()) {
            snapshot[action] = {
                down: this.isActionDown(action, isInputDown),
                pressed: this.isActionPressed(action, isInputPressed),
                inputs: this.getInputs(action),
            };
        }

        return snapshot;
    }
}
