import Sender from '../../../engine/messages/sender.js';
import Receiver from '../../../engine/messages/receiver.js';
import EventBus from '../../../engine/messages/eventBus.js';

function testSenderBasicFlow(assert) {
    const sender = new Sender();
    const payload = { value: 42 };
    let callCount = 0;
    let received = null;

    const listener = (data) => {
        callCount += 1;
        received = data;
    };

    sender.addEventListener('test-event', listener);
    assert(sender.getListenerCount('test-event') === 1, 'Sender should track listener count');

    sender.triggerEvent('test-event', payload);
    assert(callCount === 1, 'Sender should call listeners on trigger');
    assert(received === payload, 'Sender should pass payload through triggerEvent');

    sender.removeEventListener('test-event', listener);
    assert(sender.getListenerCount('test-event') === 0, 'Sender should remove listener');

    sender.triggerEvent('test-event', payload);
    assert(callCount === 1, 'Sender should not call removed listener');
}

function testSenderListenerIsolation(assert) {
    const sender = new Sender();
    let safeListenerCalls = 0;
    const originalConsoleError = console.error;

    try {
        console.error = () => {};

        sender.addEventListener('isolation', () => {
            throw new Error('intentional listener failure');
        });
        sender.addEventListener('isolation', () => {
            safeListenerCalls += 1;
        });

        sender.triggerEvent('isolation', { ok: true });
        assert(safeListenerCalls === 1, 'Sender should continue dispatch after listener error');
    } finally {
        console.error = originalConsoleError;
    }
}

function testReceiverLifecycle(assert) {
    const sender = new Sender();
    class ProbeReceiver extends Receiver {
        constructor(eventSender, eventName) {
            super(eventSender, eventName);
            this.lastData = null;
        }

        handleEvent(data) {
            this.lastData = data;
        }
    }

    const receiver = new ProbeReceiver(sender, 'receiver-event');

    sender.triggerEvent('receiver-event', { id: 99 });
    assert(receiver.lastData?.id === 99, 'Receiver should receive events when subscribed');

    receiver.cleanup();
    receiver.lastData = null;
    sender.triggerEvent('receiver-event', { id: 100 });
    assert(receiver.lastData === null, 'Receiver cleanup should unsubscribe listener');

    receiver.cleanup();
    assert(receiver.isListening === false, 'Receiver cleanup should be idempotent');
}

function testEventBusSingleton(assert) {
    EventBus.resetInstance();

    const bus1 = EventBus.getInstance();
    const bus2 = EventBus.getInstance();
    assert(bus1 === bus2, 'EventBus should return singleton instance');

    EventBus.resetInstance();
    const bus3 = EventBus.getInstance();
    assert(bus3 !== bus1, 'EventBus reset should create new instance');
}

export function testMessagesCore(assert) {
    testSenderBasicFlow(assert);
    testSenderListenerIsolation(assert);
    testReceiverLifecycle(assert);
    testEventBusSingleton(assert);
}
