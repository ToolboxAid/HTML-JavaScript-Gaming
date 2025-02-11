// ToolboxAid.com
// David Quesenberry
// 02/10/2025
// receiver.js

import EventBus from '../../scripts/messages/eventBus.js';

class Receiver {
    constructor(sender = EventBus.getInstance(), eventName) {
        this.sender = sender;
        this.eventName = eventName;

        // Store the bound function to ensure proper removal
        this.boundHandleEvent = this.handleEvent.bind(this);

        // Listen for the custom event
        this.sender.addEventListener(this.eventName, this.boundHandleEvent);
    }

    // Event handler
    handleEvent(data) {
        //console.log("Event received with data:", data);
    }

    // Clean up the event listener when done
    cleanup() {
        this.sender.removeEventListener(this.eventName, this.boundHandleEvent);
    }
}

export default Receiver;