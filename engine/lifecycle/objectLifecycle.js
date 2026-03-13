import ObjectValidation from '../utils/objectValidation.js';

class ObjectLifecycle {
    constructor(validStatuses = [], initialStatus) {
        ObjectValidation.array(validStatuses, 'validStatuses');
        if (validStatuses.length === 0) {
            throw new Error('validStatuses must be a non-empty array.');
        }

        this.validStatuses = [...validStatuses];
        this.status = null;
        this.currentFrameIndex = 0;
        this.delayCounter = 0;
        this.isDestroyed = false;

        this.setStatus(initialStatus);
    }

    ensureActive() {
        if (this.isDestroyed) {
            throw new Error('ObjectLifecycle has been destroyed.');
        }
    }

    validateStatus(status) {
        this.ensureActive();
        ObjectValidation.oneOf(status, 'status', this.validStatuses);
    }

    setStatus(status, { resetCounters = true } = {}) {
        this.ensureActive();
        ObjectValidation.boolean(resetCounters, 'resetCounters');
        this.validateStatus(status);

        if (this.status === status) {
            return false;
        }

        this.status = status;

        if (resetCounters) {
            this.resetCounters();
        }

        return true;
    }

    resetCounters() {
        this.ensureActive();
        this.currentFrameIndex = 0;
        this.delayCounter = 0;
    }

    destroy() {
        if (this.isDestroyed) {
            return false;
        }

        this.validStatuses = null;
        this.status = null;
        this.currentFrameIndex = null;
        this.delayCounter = null;
        this.isDestroyed = true;
        return true;
    }
}

export default ObjectLifecycle;
