// ToolboxAid.com
// David Quesenberry
// 02/10/2025
// sender.js

class Sender {
    constructor() {
        // Store event listeners
        this.listeners = new Map();
    }

    // Method to trigger an event
    triggerEvent(eventName, data) {
        // Get all listeners for the event
        const eventListeners = this.listeners.get(eventName) || [];

        // Call each listener with the event data
        eventListeners.forEach(listener => listener(data));
    }

    // Method to allow other classes to listen for events
    addEventListener(eventName, listener) {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, []);
        }
        this.listeners.get(eventName).push(listener);
    }

    // Method to allow other classes to remove event listeners
    removeEventListener(eventName, listener) {
        const eventListeners = this.listeners.get(eventName) || [];
        const index = eventListeners.indexOf(listener);
        if (index !== -1) {
            eventListeners.splice(index, 1);
        }
    }
}

export default Sender;