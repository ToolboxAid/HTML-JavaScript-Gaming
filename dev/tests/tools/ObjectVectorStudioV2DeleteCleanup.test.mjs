import assert from "node:assert/strict";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { ToolStarterApp } from "../../../toolbox/object-vector-studio-v2/js/ToolStarterApp.js";
import { ObjectVectorStudioV2SchemaService } from "../../../toolbox/object-vector-studio-v2/js/services/ObjectVectorStudioV2SchemaService.js";

function createJsonResponse(payload) {
  return {
    ok: true,
    status: 200,
    async json() {
      return payload;
    }
  };
}

function createLocalFetch() {
  return async (url) => {
    const targetPath = fileURLToPath(url);
    return createJsonResponse(JSON.parse(fs.readFileSync(targetPath, "utf8")));
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createPayload() {
  return {
    version: 1,
    toolId: "object-vector-studio-v2",
    name: "Delete Cleanup Object Set",
    objects: [
      {
        id: "object.test.keep",
        name: "Keep",
        tags: ["keep"],
        shapes: []
      },
      {
        id: "object.test.temp",
        name: "Temp",
        tags: ["temp"],
        shapes: []
      },
      {
        id: "object.test.child",
        name: "Child",
        baseObjectId: "object.test.temp",
        tags: ["child"],
        shapes: []
      }
    ]
  };
}

async function createSchemaService() {
  const service = new ObjectVectorStudioV2SchemaService({
    fetchRef: createLocalFetch(),
    schemaUrl: new URL("../../../www/src/shared/schemas/tools/object-vector-studio-v2.schema.json", import.meta.url)
  });
  await service.loadSchema();
  return service;
}

export async function run() {
  const service = await createSchemaService();
  const payload = createPayload();
  assert.deepEqual(service.validatePayload(payload).errors, []);
  assert.equal(Object.hasOwn(payload, "vectorMaps"), false);

  const legacyVectorPayload = createPayload();
  legacyVectorPayload.vectorMaps = {
    schema: "html-js-gaming.test-vector-map",
    version: 1,
    name: "Deprecated Shared Shapes",
    source: "object-vector-studio-v2",
    shapes: []
  };
  const legacyVectorValidation = service.validatePayload(legacyVectorPayload);
  assert.equal(legacyVectorValidation.ok, false);
  assert.equal(
    legacyVectorValidation.errors.some((message) => message.includes("root.vectorMaps is deprecated legacy vector-map data")),
    true,
  );
  assert.equal(
    legacyVectorValidation.errors.some((message) => message.includes("root.objects[].tags and root.objects[].shapes only")),
    true,
  );

  const deletePayload = clone(payload);
  deletePayload.objects = deletePayload.objects.filter((object) => object.id !== "object.test.temp");
  const app = Object.create(ToolStarterApp.prototype);
  app.removeDeletedObjectReferences(deletePayload, "object.test.temp");
  assert.equal(Object.hasOwn(deletePayload, "vectorMaps"), false);
  assert.equal(Object.hasOwn(deletePayload.objects.find((object) => object.id === "object.test.child"), "baseObjectId"), false);
  assert.deepEqual(service.validatePayload(deletePayload).errors, []);
}
