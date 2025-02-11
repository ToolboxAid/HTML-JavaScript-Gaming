// ToolboxAid.com
// David Quesenberry
// 02/10/2025
// testReceiver.js

import EventBus from './eventBus.js';
import { Receiver } from './receiver.js';
import { GAMEPAD_EVENT } from './gamepadManager.js';

// Get the shared EventBus instance
const sender = EventBus.getInstance();
const receiver = new Receiver(sender, GAMEPAD_EVENT);

// Log when events are received
receiver.handleEvent = (data) => {
    const [action, index, id] = data;
    console.log(`Received event: ${action} - Index: ${index}, ID: ${id}`);
};

// Optionally, clean up after a delay to stop listening
setTimeout(() => {
    receiver.cleanup();
    console.log('Receiver stopped listening for events.');
}, 30000); // Stop listening after 30 seconds