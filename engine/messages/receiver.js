// ToolboxAid.com
// David Quesenberry
// 02/10/2025
// receiver.js

import EventBus from './eventBus.js';

class Receiver {
    constructor(sender = EventBus.getInstance(), eventName) {
        if (!sender || typeof sender.addEventListener !== 'function' || typeof sender.removeEventListener !== 'function') {
            throw new Error('sender must provide addEventListener and removeEventListener methods.');
        }

        if (typeof eventName !== 'string' || eventName.trim() === '') {
            throw new Error('eventName must be a non-empty string.');
        }

        this.sender = sender;
        this.eventName = eventName;
        this.isListening = false;

        // Store the bound function to ensure proper removal
        this.boundHandleEvent = this.handleEvent.bind(this);

        // Listen for the custom event
        this.sender.addEventListener(this.eventName, this.boundHandleEvent);
        this.isListening = true;
    }

    // Event handler
    handleEvent(data) {
        //console.log("Event received with data:", data);
    }

    // Clean up the event listener when done
    cleanup() {
        if (!this.isListening) {
            return;
        }

        this.sender.removeEventListener(this.eventName, this.boundHandleEvent);
        this.isListening = false;
    }

    destroy() {
        this.cleanup();
        this.sender = null;
        this.eventName = null;
        this.boundHandleEvent = null;
    }
}

export default Receiver;
