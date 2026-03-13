// ToolboxAid.com
// David Quesenberry
// 02/10/2025
// sender.js

class Sender {
    constructor() {
        // Store event listeners
        this.listeners = new Map();
    }

    static validateEventName(eventName) {
        if (typeof eventName !== 'string' || eventName.trim() === '') {
            throw new Error('eventName must be a non-empty string.');
        }
    }

    static validateListener(listener) {
        if (typeof listener !== 'function') {
            throw new Error('listener must be a function.');
        }
    }

    // Method to trigger an event
    triggerEvent(eventName, data) {
        Sender.validateEventName(eventName);

        // Get all listeners for the event
        const eventListeners = this.listeners.get(eventName) || [];
        const listenersSnapshot = [...eventListeners];

        // Call each listener with the event data
        listenersSnapshot.forEach((listener) => {
            try {
                listener(data);
            } catch (error) {
                console.error(`Sender listener failed for event '${eventName}':`, error);
            }
        });
    }

    // Method to allow other classes to listen for events
    addEventListener(eventName, listener) {
        Sender.validateEventName(eventName);
        Sender.validateListener(listener);

        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, []);
        }

        this.listeners.get(eventName).push(listener);
    }

    // Method to allow other classes to remove event listeners
    removeEventListener(eventName, listener) {
        Sender.validateEventName(eventName);
        Sender.validateListener(listener);

        const eventListeners = this.listeners.get(eventName) || [];
        const index = eventListeners.indexOf(listener);
        if (index !== -1) {
            eventListeners.splice(index, 1);
        }

        if (eventListeners.length === 0) {
            this.listeners.delete(eventName);
        }
    }

    getListenerCount(eventName) {
        Sender.validateEventName(eventName);
        return this.listeners.get(eventName)?.length ?? 0;
    }

    clearEvent(eventName) {
        Sender.validateEventName(eventName);
        this.listeners.delete(eventName);
    }

    clearAllEvents() {
        this.listeners.clear();
    }
}

export default Sender;
