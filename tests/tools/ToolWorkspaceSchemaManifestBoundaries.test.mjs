import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  createDefaultCameraPathPayload,
  validateCameraPathPayload
} from "../../tools/schemas/tools/cameraPathPayload.schema.js";
import {
  createDefaultMapPayload,
  validateMapPayload
} from "../../tools/schemas/tools/mapPayload.schema.js";
import {
  createDefaultAssetPayload,
  validateAssetPayload
} from "../../tools/schemas/tools/assetPayload.schema.js";
import {
  validateWorkspaceManifestSchema,
  WORKSPACE_MANIFEST_SCHEMA,
  WORKSPACE_MANIFEST_VERSION,
  WORKSPACE_DOCUMENT_KIND
} from "../../tools/schemas/workspaceManifest.schema.js";

export async function run() {
  const cameraValidation = validateCameraPathPayload(createDefaultCameraPathPayload(), {
    requireSchema: true,
    requireWaypoints: true
  });
  assert.equal(cameraValidation.valid, true, cameraValidation.issues.join(" "));

  const mapValidation = validateMapPayload(createDefaultMapPayload(), {
    requireSchema: true,
    requirePoints: true
  });
  assert.equal(mapValidation.valid, true, mapValidation.issues.join(" "));

  const assetValidation = validateAssetPayload(createDefaultAssetPayload(), {
    requireSchema: true,
    requireVertices: true
  });
  assert.equal(assetValidation.valid, true, assetValidation.issues.join(" "));

  const workspaceManifest = {
    documentKind: WORKSPACE_DOCUMENT_KIND,
    schema: WORKSPACE_MANIFEST_SCHEMA,
    version: WORKSPACE_MANIFEST_VERSION,
    id: "workspace-test",
    name: "Workspace Test",
    tools: {
      "3d-asset-viewer": {
        schema: "tools.3d-asset-viewer.asset/1",
        assetId: "asset-test",
        vertices: [{ x: 0, y: 0, z: 0 }]
      }
    },
    sharedLibrary: {
      assets: [
        {
          id: "asset-test",
          type: "vector",
          displayName: "Asset Test",
          sourcePath: "/games/Test/assets/vectors/asset-test.vector.json",
          sourceToolId: "3d-asset-viewer"
        }
      ],
      palettes: []
    },
    exportArtifacts: [
      {
        kind: "png",
        path: "/games/Test/exports/asset-preview.png",
        sourceToolId: "3d-asset-viewer"
      }
    ]
  };
  const workspaceValidation = validateWorkspaceManifestSchema(workspaceManifest);
  assert.equal(workspaceValidation.valid, true, workspaceValidation.issues.join(" "));

  const invalidWorkspaceValidation = validateWorkspaceManifestSchema({
    ...workspaceManifest,
    externalAssets: ["/games/Test/assets/outside-manifest.asset.json"],
    exportArtifacts: [{ kind: "jpg", path: "/games/Test/exports/asset-preview.jpg" }]
  });
  assert.equal(invalidWorkspaceValidation.valid, false);
  assert.equal(
    invalidWorkspaceValidation.issues.some((issue) => issue.includes("workspace.manifest")),
    true
  );
  assert.equal(
    invalidWorkspaceValidation.issues.some((issue) => issue.includes(".png")),
    true
  );

  const paletteBrowserSource = readFileSync(new URL("../../tools/Palette Browser/main.js", import.meta.url), "utf8");
  assert.match(paletteBrowserSource, /function duplicateSelectedPalette\(/);
  assert.match(paletteBrowserSource, /createCustomPalette\(nextName, palette\.entries\)/);
  assert.match(paletteBrowserSource, /Duplicate a built-in palette before editing swatches\./);
  assert.match(paletteBrowserSource, /Shared palette is locked to .*Edit swatches instead\./);
  assert.match(paletteBrowserSource, /if \(isReadOnlyPalette\(palette\)\) \{\s*return;\s*\}/s);

  const spriteEditorSource = readFileSync(new URL("../../tools/Sprite Editor/modules/spriteEditorApp.js", import.meta.url), "utf8");
  assert.match(spriteEditorSource, /image\/png/);
  assert.match(spriteEditorSource, /sprite-frame-.*\.png/);
  assert.match(spriteEditorSource, /sprite-sheet-.*\.png/);
}
