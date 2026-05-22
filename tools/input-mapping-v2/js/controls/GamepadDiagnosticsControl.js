export class GamepadDiagnosticsControl {
  constructor(container) {
    this.container = container;
  }

  render(diagnostics) {
    const summary = document.createElement("dl");
    summary.className = "input-mapping-v2__diagnostics-summary";
    summary.append(
      this.createTerm("Browser API available", diagnostics.apiAvailable ? "yes" : "no"),
      this.createTerm("navigator.getGamepads() count", String(diagnostics.rawCount)),
      this.createTerm("Window focus", diagnostics.windowFocused ? "yes" : "no"),
      this.createTerm("Last poll timestamp", diagnostics.lastPollTimestamp || "not polled")
    );

    const sourceGrid = document.createElement("div");
    sourceGrid.className = "input-mapping-v2__diagnostics-grid";
    sourceGrid.append(...diagnostics.sources.map((source) => this.createSourceCard(source)));

    this.container.replaceChildren(summary, sourceGrid);
  }

  createTerm(term, description) {
    const fragment = document.createDocumentFragment();
    const termElement = document.createElement("dt");
    termElement.textContent = term;
    const descriptionElement = document.createElement("dd");
    descriptionElement.textContent = description;
    fragment.append(termElement, descriptionElement);
    return fragment;
  }

  createSourceCard(source) {
    const card = document.createElement("article");
    card.className = "input-mapping-v2__diagnostics-card";

    const title = document.createElement("strong");
    title.textContent = source.name;

    const path = document.createElement("code");
    path.textContent = source.path;

    const count = document.createElement("p");
    count.textContent = `Count: ${source.count}`;

    const list = document.createElement("div");
    list.className = "input-mapping-v2__diagnostics-devices";
    if (!source.gamepads.length) {
      const empty = document.createElement("p");
      empty.textContent = "No gamepads reported.";
      list.append(empty);
    } else {
      list.append(...source.gamepads.map((gamepad) => this.createGamepadDetails(gamepad)));
    }

    card.append(title, path, count, list);
    return card;
  }

  createGamepadDetails(gamepad) {
    const details = document.createElement("dl");
    details.className = "input-mapping-v2__diagnostics-device";
    details.append(
      this.createTerm("index", String(gamepad.index)),
      this.createTerm("id/name", gamepad.id || "(empty)"),
      this.createTerm("connected", gamepad.connected ? "true" : "false"),
      this.createTerm("button count", String(gamepad.buttonCount)),
      this.createTerm("axis count", String(gamepad.axisCount))
    );
    return details;
  }
}
