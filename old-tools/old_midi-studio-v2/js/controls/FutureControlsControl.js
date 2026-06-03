import { setUnwiredControlState } from "./UnwiredControlState.js";

const FUTURE_CONTROL_DETAIL = "Planned MIDI Studio V2 control; not implemented yet.";

export class FutureControlsControl {
  constructor({ controls = [] } = {}) {
    this.controls = controls;
  }

  mount() {
    this.controls.forEach((control) => {
      setUnwiredControlState(control, {
        active: true,
        detail: control.dataset.midiStudioFutureDetail || FUTURE_CONTROL_DETAIL,
        status: "Not implemented"
      });
    });
  }
}
