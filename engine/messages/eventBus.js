// ToolboxAid.com
// David Quesenberry
// 02/10/2025
// .js

import Sender from '../../engine/messages/sender.js';

class EventBus {
    static instance = null;

    static getInstance() {
        if (!EventBus.instance) {
            EventBus.instance = new Sender();
        }
        return EventBus.instance;
    }

    static resetInstance() {
        EventBus.instance = null;
    }
}

export default EventBus;
