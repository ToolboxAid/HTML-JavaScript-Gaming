import ObjectValidation from '../utils/objectValidation.js';

class ObjectLifecycle {
    constructor(validStatuses = [], initialStatus) {
        this.validStatuses = [...validStatuses];
        this.status = null;
        this.currentFrameIndex = 0;
        this.delayCounter = 0;

        this.setStatus(initialStatus);
    }

    validateStatus(status) {
        ObjectValidation.oneOf(status, 'status', this.validStatuses);
    }

    setStatus(status, { resetCounters = true } = {}) {
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
        this.currentFrameIndex = 0;
        this.delayCounter = 0;
    }

    destroy() {
        this.validStatuses = null;
        this.status = null;
        this.currentFrameIndex = null;
        this.delayCounter = null;
    }
}

export default ObjectLifecycle;
