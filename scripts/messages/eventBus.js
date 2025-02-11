// ToolboxAid.com
// David Quesenberry
// 02/10/2025
// .js

import Sender from '../../scripts/messages/sender.js';

class EventBus {
    static instance = null;

    static getInstance() {
        if (!EventBus.instance) {
            EventBus.instance = new Sender();
        }
        return EventBus.instance;
    }
}

export default EventBus;