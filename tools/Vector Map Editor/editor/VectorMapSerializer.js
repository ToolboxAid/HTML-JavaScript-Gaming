/*
Toolbox Aid
David Quesenberry
03/25/2026
VectorMapSerializer.js
*/
import { downloadTextFile, readFileText } from "../../../src/engine/persistence/index.js";
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
    downloadTextFile(data, fileName);
  }

  async readFile(file) {
    if (!file) {
      return null;
    }
    const text = await readFileText(file);
    return this.parseJSON(text);
  }
}
