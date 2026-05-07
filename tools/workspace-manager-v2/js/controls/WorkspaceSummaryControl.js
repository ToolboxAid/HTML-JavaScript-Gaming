export class WorkspaceSummaryControl {
  constructor({
    assetRegistrySummary,
    contextOutput,
    launchContextSummary,
    paletteSummary
  }) {
    this.assetRegistrySummary = assetRegistrySummary;
    this.contextOutput = contextOutput;
    this.launchContextSummary = launchContextSummary;
    this.paletteSummary = paletteSummary;
  }

  clear() {
    this.paletteSummary.textContent = "No active palette selected.";
    this.assetRegistrySummary.textContent = "No asset registry context created.";
    this.launchContextSummary.textContent = "Asset Manager V2 launch is waiting for a game and palette.";
    this.contextOutput.textContent = "{}";
  }

  render({ context, game, paletteSwatches }) {
    const swatchCount = paletteSwatches.length;
    this.paletteSummary.textContent = `${game.paletteName} has ${swatchCount} active colors.`;
    this.assetRegistrySummary.textContent = "Schema-ready Asset Manager V2 registry context contains 0 managed assets.";
    this.launchContextSummary.textContent = `Session launch context is ready for ${game.id}.`;
    this.contextOutput.textContent = JSON.stringify(context, null, 2);
  }
}
