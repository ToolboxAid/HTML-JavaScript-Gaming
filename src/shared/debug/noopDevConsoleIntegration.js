export function createNoopDevConsoleIntegration() {
  const runtime = Object.freeze({
    showOverlay() {},
    hideOverlay() {},
    showConsole() {},
    hideConsole() {},
  });

  return Object.freeze({
    update() {},
    render() {},
    dispose() {},
    executeCommand() {
      return { status: 'disabled', output: [] };
    },
    getRuntime() {
      return runtime;
    },
    getState() {
      return {
        consoleVisible: false,
        overlayVisible: false,
      };
    },
  });
}
