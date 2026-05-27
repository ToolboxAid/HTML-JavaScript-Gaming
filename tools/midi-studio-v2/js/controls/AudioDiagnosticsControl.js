export class AudioDiagnosticsControl {
  constructor({ details }) {
    this.details = details;
  }

  render(rows = []) {
    this.details.replaceChildren();
    rows.forEach(([label, value]) => {
      const row = document.createElement("div");
      const term = document.createElement("dt");
      const description = document.createElement("dd");
      term.textContent = label;
      description.textContent = value === undefined || value === null || value === "" ? "not available" : String(value);
      row.append(term, description);
      this.details.append(row);
    });
  }
}
