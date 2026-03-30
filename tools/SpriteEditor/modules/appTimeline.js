function installSpriteEditorTimelineMethods(SpriteEditorApp) {
  Object.assign(SpriteEditorApp.prototype, {
    computeTimelineLayout() {
      const panel = this.controlSurface.layout.bottomPanel;
      const previewX = panel.x + 18;
      const previewY = panel.y + 8;
      const x = Math.max(panel.x + 18, panel.x + panel.width - 420);
      const y = panel.y + 14;
      const w = Math.min(402, panel.width - 36);
      const h = 108;
      const transportX = previewX + 96;
      const transportY = previewY + 48;
      const transportW = 40;
      const transportH = 18;
      const transportGap = 4;
      const fpsY = transportY + transportH + 6;
      const transport = [
        { id: "play_pause", x: transportX, y: transportY, w: transportW, h: transportH },
        { id: "stop", x: transportX + transportW + transportGap, y: transportY, w: transportW, h: transportH },
        { id: "loop", x: transportX + (transportW + transportGap) * 2, y: transportY, w: transportW, h: transportH },
        { id: "fps_down", x: transportX, y: fpsY, w: 20, h: transportH },
        { id: "fps_up", x: transportX + 24, y: fpsY, w: 20, h: transportH }
      ];
      const innerX = x + 10;
      const innerY = y + 30;
      const innerW = Math.max(80, w - 20);
      const innerH = h - 36;
      const count = Math.max(1, this.document.frames.length);
      let slotGap = 6;
      const maxSlotW = 60;
      let slotW = Math.floor((innerW - (count - 1) * slotGap) / count);
      if (slotW > maxSlotW) {
        slotW = maxSlotW;
      }
      // Keep timeline slots inside bounds for large frame counts.
      if (slotW < 10) {
        slotGap = 0;
        slotW = Math.max(1, Math.floor(innerW / count));
      } else {
        slotW = Math.max(1, slotW);
      }
      const slotH = innerH;
      const totalW = count * slotW + (count - 1) * slotGap;
      const startX = innerX + Math.max(0, Math.floor((innerW - totalW) * 0.5));
      const slots = [];
      for (let i = 0; i < count; i += 1) {
        slots.push({ index: i, x: startX + i * (slotW + slotGap), y: innerY, w: slotW, h: slotH });
      }
      return { x, y, w, h, slots, transport };
    },

    getTimelineIndexAt(point) {
      if (!this.timelineStripRect || !point) return null;
      const slots = this.timelineStripRect.slots;
      for (let i = 0; i < slots.length; i += 1) {
        const slot = slots[i];
        if (point.x >= slot.x && point.y >= slot.y && point.x <= slot.x + slot.w && point.y <= slot.y + slot.h) return slot.index;
      }
      return null;
    },

    getTimelineControlAt(point) {
      if (!this.timelineStripRect || !point) return null;
      const controls = this.timelineStripRect.transport || [];
      for (let i = 0; i < controls.length; i += 1) {
        const control = controls[i];
        if (point.x >= control.x && point.y >= control.y && point.x <= control.x + control.w && point.y <= control.y + control.h) return control.id;
      }
      return null;
    },

    getFrameRangeSelection() {
      if (!this.frameRangeSelection) {
        return { start: this.document.activeFrameIndex, end: this.document.activeFrameIndex, explicit: false };
      }
      const max = this.document.frames.length - 1;
      const start = Math.max(0, Math.min(this.frameRangeSelection.start, this.frameRangeSelection.end, max));
      const end = Math.max(0, Math.min(Math.max(this.frameRangeSelection.start, this.frameRangeSelection.end), max));
      return { start, end, explicit: true };
    },

    isFrameInSelectedRange(index) {
      const range = this.getFrameRangeSelection();
      return index >= range.start && index <= range.end;
    },

    setFrameRangeSelection(start, end, anchor = start) {
      const max = this.document.frames.length - 1;
      const rangeStart = Math.max(0, Math.min(start, end, max));
      const rangeEnd = Math.max(0, Math.min(Math.max(start, end), max));
      this.frameRangeSelection = { start: rangeStart, end: rangeEnd, anchor };
    },

    clearFrameRangeSelection(showMessage = false) {
      this.frameRangeSelection = null;
      if (showMessage) this.showMessage("Frame range cleared.");
    },

    getPlaybackRange() {
      const max = Math.max(0, this.document.frames.length - 1);
      const start = Math.max(0, Math.min(this.playbackRange.startFrame, this.playbackRange.endFrame, max));
      const end = Math.max(0, Math.min(Math.max(this.playbackRange.startFrame, this.playbackRange.endFrame), max));
      return { enabled: !!this.playbackRange.enabled, startFrame: start, endFrame: end };
    },

    setPlaybackRange(startFrame, endFrame, enabled = true) {
      const max = Math.max(0, this.document.frames.length - 1);
      const start = Math.max(0, Math.min(startFrame, endFrame, max));
      const end = Math.max(0, Math.min(Math.max(startFrame, endFrame), max));
      this.playbackRange = { enabled: !!enabled, startFrame: start, endFrame: end };
    },

    clearPlaybackRange(showMessage = false) {
      this.playbackRange.enabled = false;
      this.playbackRange.startFrame = 0;
      this.playbackRange.endFrame = Math.max(0, this.document.frames.length - 1);
      if (showMessage) this.showMessage("Playback range cleared.");
    },

    getPlaybackOrderOverride() {
      const source = this.document.playbackOrderOverride && typeof this.document.playbackOrderOverride === "object"
        ? this.document.playbackOrderOverride
        : { enabled: false, order: [] };
      const order = Array.isArray(source.order)
        ? source.order
          .map((idx) => Number(idx))
          .filter((idx) => Number.isInteger(idx) && idx >= 0 && idx < this.document.frames.length)
        : [];
      return { enabled: !!source.enabled && order.length > 0, order };
    },

    setPlaybackOrderOverride(order, enabled = true) {
      const next = Array.isArray(order)
        ? order.map((idx) => Number(idx)).filter((idx) => Number.isInteger(idx) && idx >= 0 && idx < this.document.frames.length)
        : [];
      this.document.playbackOrderOverride = { enabled: !!enabled && next.length > 0, order: next };
      return this.document.playbackOrderOverride.enabled;
    },

    clearPlaybackOrderOverride(showMessage = false) {
      this.document.playbackOrderOverride = { enabled: false, order: [] };
      if (showMessage) this.showMessage("Playback order: Linear.");
      return true;
    },

    getEffectivePlaybackSequence(baseIndices = null) {
      const indices = Array.isArray(baseIndices) && baseIndices.length
        ? baseIndices.slice()
        : (this.getPlaybackRange().enabled
          ? Array.from({ length: this.getPlaybackRange().endFrame - this.getPlaybackRange().startFrame + 1 }, (_v, i) => this.getPlaybackRange().startFrame + i)
          : this.document.frames.map((_f, i) => i));
      const override = this.getPlaybackOrderOverride();
      if (!override.enabled) return indices;
      const allow = new Set(indices);
      const sequence = override.order.filter((idx) => allow.has(idx));
      return sequence.length ? sequence : indices;
    },

    openPlaybackOrderEditor() {
      const current = this.getPlaybackOrderOverride();
      const hint = current.enabled && current.order.length
        ? current.order.map((idx) => idx + 1).join(",")
        : "";
      const raw = globalThis.prompt
        ? globalThis.prompt("Playback order (1-based). Comma list or [array]. Leave blank for linear.", hint)
        : hint;
      if (raw === null) return false;
      const text = String(raw || "").trim();
      if (!text) {
        this.clearPlaybackOrderOverride(true);
        this.renderAll();
        return true;
      }
      let values = null;
      if (text.startsWith("[")) {
        try {
          const parsedJson = JSON.parse(text);
          if (Array.isArray(parsedJson)) values = parsedJson;
        } catch (_err) {
          values = null;
        }
      }
      if (!Array.isArray(values)) {
        values = text.replace(/[\[\]]/g, "").split(/[\s,]+/).filter(Boolean);
      }
      const parsed = values.map((part) => Number(part) - 1);
      const ok = this.setPlaybackOrderOverride(parsed, true);
      this.showMessage(ok ? "Playback order: Custom." : "Playback order invalid.");
      this.renderAll();
      return ok;
    },

    isFrameInPlaybackRange(index) {
      const range = this.getPlaybackRange();
      if (!range.enabled) return false;
      return index >= range.startFrame && index <= range.endFrame;
    },

    setPlaybackRangeFromSelection() {
      const range = this.getFrameRangeSelection();
      if (!range.explicit || range.start === range.end) {
        this.showMessage("Select at least two frames first.");
        return false;
      }
      this.setPlaybackRange(range.start, range.end, true);
      this.showMessageAndRender(`Playback range: ${range.start + 1}-${range.end + 1}`);
      return true;
    },

    jumpToPlaybackRangeEdge(toEnd) {
      const range = this.getPlaybackRange();
      if (!range.enabled) {
        this.showMessage("Playback range not set.");
        return false;
      }
      this.selectFrame(toEnd ? range.endFrame : range.startFrame);
      this.showMessage(toEnd ? "Jumped to range end." : "Jumped to range start.");
      return true;
    },

    sanitizeFrameRangeSelection() {
      if (!this.frameRangeSelection) return;
      const max = this.document.frames.length - 1;
      if (max < 0) {
        this.frameRangeSelection = null;
        return;
      }
      const start = Math.max(0, Math.min(this.frameRangeSelection.start, max));
      const end = Math.max(0, Math.min(this.frameRangeSelection.end, max));
      this.frameRangeSelection = {
        start: Math.min(start, end),
        end: Math.max(start, end),
        anchor: Math.max(0, Math.min(this.frameRangeSelection.anchor, max))
      };
    },

    sanitizePlaybackRange() {
      const max = Math.max(0, this.document.frames.length - 1);
      this.playbackRange.startFrame = Math.max(0, Math.min(this.playbackRange.startFrame, max));
      this.playbackRange.endFrame = Math.max(0, Math.min(this.playbackRange.endFrame, max));
      if (this.playbackRange.endFrame < this.playbackRange.startFrame) {
        const next = this.playbackRange.startFrame;
        this.playbackRange.startFrame = this.playbackRange.endFrame;
        this.playbackRange.endFrame = next;
      }
      if (this.document.frames.length <= 1) this.playbackRange.enabled = false;
      if (this.timelineHoverIndex !== null && (this.timelineHoverIndex < 0 || this.timelineHoverIndex > max)) {
        this.timelineHoverIndex = null;
      }
    },

    togglePlayback(force) {
      if (typeof force === "boolean") this.playback.isPlaying = force;
      else this.playback.isPlaying = !this.playback.isPlaying;
      if (this.playback.isPlaying) {
        const sequence = this.getEffectivePlaybackSequence();
        if (sequence.length) {
          const activePos = sequence.indexOf(this.document.activeFrameIndex);
          const startIndex = activePos >= 0 ? activePos : 0;
          this.playback.sequenceCursor = startIndex;
          this.playback.previewFrameIndex = sequence[startIndex];
          this.document.activeFrameIndex = this.playback.previewFrameIndex;
        }
        this.playback.lastTick = performance.now();
      }
      this.showMessageAndRender(this.playback.isPlaying ? "Playback started." : "Playback paused.");
    },

    stopPlayback() {
      this.playback.isPlaying = false;
      const sequence = this.getEffectivePlaybackSequence();
      const nextIndex = sequence.length ? sequence[0] : 0;
      this.playback.sequenceCursor = 0;
      this.playback.previewFrameIndex = nextIndex;
      this.selectFrame(nextIndex);
      this.showMessage("Playback stopped.");
    },

    togglePlaybackLoop() {
      this.playback.loop = !this.playback.loop;
      this.showMessageAndRender(this.playback.loop ? "Loop on." : "Loop off.");
    },

    adjustPlaybackFps(delta) {
      this.playback.fps = Math.max(1, Math.min(30, this.playback.fps + delta));
      this.showMessageAndRender(`FPS: ${this.playback.fps}`);
    }
  });
}

export { installSpriteEditorTimelineMethods };
