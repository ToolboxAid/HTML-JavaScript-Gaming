/*
Toolbox Aid
David Quesenberry
05/22/2026
PointerDragState.js
*/
const PRIMARY_BUTTON = 0;
const POINTER_DRAG_DESCRIPTORS = Object.freeze([
    createDescriptor('MousePrimaryButtonDown', 'Mouse Left Button Down', 'Left Button Down'),
    createDescriptor('MousePrimaryButtonUp', 'Mouse Left Button Up', 'Left Button Up'),
    createDescriptor('MousePrimaryDrag', 'Mouse Drag', 'Drag'),
    createDescriptor('MousePrimaryDragRelease', 'Mouse Drag Release', 'Drag Release'),
    createDescriptor('MousePrimaryDragRectangle', 'Mouse Drag Rectangle', 'Drag Rectangle'),
]);

export default class PointerDragState {
    constructor({ dragThreshold = 4 } = {}) {
        this.dragThreshold = dragThreshold;
        this.reset();
    }

    reset() {
        this.activePointerId = null;
        this.button = PRIMARY_BUTTON;
        this.isDown = false;
        this.isDragging = false;
        this.wasReleased = false;
        this.lastEventType = 'none';
        this.downPoint = null;
        this.currentPoint = null;
        this.upPoint = null;
        this.dragStart = null;
        this.dragCurrent = null;
        this.dragEnd = null;
        this.dragBounds = null;
    }

    pointerDown(event = {}) {
        const button = Number(event.button ?? PRIMARY_BUTTON);
        const point = pointFromEvent(event);
        this.activePointerId = pointerIdFromEvent(event);
        this.button = button;
        this.isDown = true;
        this.isDragging = false;
        this.wasReleased = false;
        this.lastEventType = 'down';
        this.downPoint = point;
        this.currentPoint = point;
        this.upPoint = null;
        this.dragStart = point;
        this.dragCurrent = point;
        this.dragEnd = null;
        this.dragBounds = boundsFromPoints(point, point);
    }

    pointerMove(event = {}) {
        if (!this.isDown || !this.matchesActivePointer(event) || !isButtonStillPressed(event, this.button)) {
            return;
        }

        const point = pointFromEvent(event);
        this.currentPoint = point;
        this.dragCurrent = point;
        this.dragBounds = boundsFromPoints(this.dragStart, point);
        if (!this.isDragging && distance(this.dragStart, point) >= this.dragThreshold) {
            this.isDragging = true;
        }
        this.lastEventType = this.isDragging ? 'drag' : 'move';
    }

    pointerUp(event = {}) {
        if (!this.isDown || !this.matchesActivePointer(event)) {
            return;
        }

        const point = pointFromEvent(event);
        this.currentPoint = point;
        this.upPoint = point;
        this.dragCurrent = point;
        this.dragEnd = point;
        this.dragBounds = boundsFromPoints(this.dragStart, point);
        if (!this.isDragging && distance(this.dragStart, point) >= this.dragThreshold) {
            this.isDragging = true;
        }
        this.wasReleased = this.isDragging;
        this.isDown = false;
        this.activePointerId = null;
        this.lastEventType = this.wasReleased ? 'drag-release' : 'up';
    }

    pointerCancel(event = {}) {
        if (!this.matchesActivePointer(event)) {
            return;
        }

        const point = pointFromEvent(event);
        this.currentPoint = point;
        this.dragCurrent = point;
        this.dragEnd = point;
        this.dragBounds = this.dragStart ? boundsFromPoints(this.dragStart, point) : null;
        this.isDown = false;
        this.isDragging = false;
        this.wasReleased = false;
        this.activePointerId = null;
        this.lastEventType = 'cancel';
    }

    getSnapshot() {
        return {
            button: this.button,
            isDown: this.isDown,
            isDragging: this.isDragging,
            wasReleased: this.wasReleased,
            lastEventType: this.lastEventType,
            downPoint: clonePoint(this.downPoint),
            currentPoint: clonePoint(this.currentPoint),
            upPoint: clonePoint(this.upPoint),
            dragStart: clonePoint(this.dragStart),
            dragCurrent: clonePoint(this.dragCurrent),
            dragEnd: clonePoint(this.dragEnd),
            dragBounds: cloneBounds(this.dragBounds),
        };
    }

    getDescriptors() {
        const snapshot = this.getSnapshot();
        return POINTER_DRAG_DESCRIPTORS.map((descriptor) => ({
            ...descriptor,
            active: this.isDescriptorActive(descriptor.binding),
            snapshot,
        }));
    }

    getDescriptor(binding) {
        return this.getDescriptors().find((descriptor) => descriptor.binding === binding) ?? null;
    }

    isDescriptorActive(binding) {
        if (binding === 'MousePrimaryButtonDown') {
            return this.isDown;
        }
        if (binding === 'MousePrimaryButtonUp') {
            return this.lastEventType === 'up' || this.lastEventType === 'drag-release';
        }
        if (binding === 'MousePrimaryDrag') {
            return this.isDragging && this.isDown;
        }
        if (binding === 'MousePrimaryDragRelease') {
            return this.wasReleased;
        }
        if (binding === 'MousePrimaryDragRectangle') {
            return this.wasReleased && Boolean(this.dragBounds);
        }
        return false;
    }

    matchesActivePointer(event = {}) {
        const eventPointerId = pointerIdFromEvent(event);
        return this.activePointerId === null || eventPointerId === null || eventPointerId === this.activePointerId;
    }
}

function createDescriptor(binding, label, detail) {
    return {
        source: 'mouse',
        binding,
        label,
        displayLabelLines: ['Mouse', detail],
        title: `Pointer Drag\n${label}`,
        engine: 'PointerDragState',
    };
}

function pointFromEvent(event) {
    return {
        x: finiteNumber(event.offsetX ?? event.clientX ?? event.pageX),
        y: finiteNumber(event.offsetY ?? event.clientY ?? event.pageY),
    };
}

function isButtonStillPressed(event, button) {
    if (event.buttons === undefined || event.buttons === null) {
        return true;
    }
    const buttons = Number(event.buttons);
    if (!Number.isFinite(buttons)) {
        return true;
    }
    return (buttons & buttonMask(button)) !== 0;
}

function buttonMask(button) {
    const normalizedButton = Number(button);
    if (normalizedButton === 1) {
        return 4;
    }
    if (normalizedButton === 2) {
        return 2;
    }
    if (normalizedButton > 2) {
        return 1 << normalizedButton;
    }
    return 1;
}

function pointerIdFromEvent(event) {
    const pointerId = Number(event.pointerId);
    return Number.isFinite(pointerId) ? pointerId : null;
}

function finiteNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
}

function distance(start, end) {
    if (!start || !end) {
        return 0;
    }
    return Math.hypot(end.x - start.x, end.y - start.y);
}

function boundsFromPoints(start, end) {
    if (!start || !end) {
        return null;
    }
    const left = Math.min(start.x, end.x);
    const top = Math.min(start.y, end.y);
    const right = Math.max(start.x, end.x);
    const bottom = Math.max(start.y, end.y);
    return {
        x: left,
        y: top,
        left,
        top,
        right,
        bottom,
        width: right - left,
        height: bottom - top,
    };
}

function clonePoint(point) {
    return point ? { x: point.x, y: point.y } : null;
}

function cloneBounds(bounds) {
    return bounds ? { ...bounds } : null;
}
