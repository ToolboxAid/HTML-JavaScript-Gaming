export class ToolStateSerializer {
  constructor(toolId) {
    this.toolId = toolId;
  }

  createToolState({ sourceValue }) {
    return {
      toolId: this.toolId,
      payload: {
        sourceValue
      }
    };
  }
}

