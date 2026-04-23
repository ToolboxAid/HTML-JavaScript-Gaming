/*
Toolbox Aid
David Quesenberry
03/25/2026
VectorMapSerializer.js
*/
import { addToolModeMetadata } from "../../shared/documentModeGuards.js";

export class VectorMapSerializer {
  toPrettyJSON(documentModel) {
    return JSON.stringify(addToolModeMetadata(documentModel.toJSON(), { toolId: "vector-map-editor" }), null, 2);
  }

  parseJSON(jsonText) {
    return JSON.parse(jsonText);
  }

  download(documentModel) {
    const data = this.toPrettyJSON(documentModel);
    const fileName = `${documentModel.getData().name || "untitled"}.editor.json`;
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  async readFile(file) {
    if (!file) {
      return null;
    }
    const text = await file.text();
    return this.parseJSON(text);
  }
}
