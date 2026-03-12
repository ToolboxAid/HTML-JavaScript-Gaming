// ToolboxAid.com
// David Quesenberry
// 02/10/2025
// testSender.js

import EventBus from './eventBus.js';
import { GAMEPAD_EVENT } from '../gamepadEnums.js';

// Get the shared EventBus instance
const sender = EventBus.getInstance();

// Trigger the custom event with three arguments
const args = ['connected', 0, 'Test Controller'];
sender.triggerEvent(GAMEPAD_EVENT, args);

console.log('Event triggered with args:', args);