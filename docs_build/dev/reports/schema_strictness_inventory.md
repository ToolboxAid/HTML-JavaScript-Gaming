# Schema Strictness Inventory

Total findings: 83

## Counts By Reason
- broad jsonValue escape hatch: 47
- missing additionalProperties on object schema: 21
- open-ended dictionary with jsonValue: 14
- unknown fields explicitly allowed: 1

## Findings
| schemaPath | jsonPointer | currentAdditionalProperties | looseReason | action |
| --- | --- | --- | --- | --- |
| tools/schemas/game.manifest.schema.json | #/$defs/objectVectorStudioArcShape/allOf/1 | missing | missing additionalProperties on object schema | set additionalProperties false or typed dictionary |
| tools/schemas/game.manifest.schema.json | #/$defs/objectVectorStudioCircleShape/allOf/1 | missing | missing additionalProperties on object schema | set additionalProperties false or typed dictionary |
| tools/schemas/game.manifest.schema.json | #/$defs/objectVectorStudioEllipseShape/allOf/1 | missing | missing additionalProperties on object schema | set additionalProperties false or typed dictionary |
| tools/schemas/game.manifest.schema.json | #/$defs/objectVectorStudioLineShape/allOf/1 | missing | missing additionalProperties on object schema | set additionalProperties false or typed dictionary |
| tools/schemas/game.manifest.schema.json | #/$defs/objectVectorStudioPolygonShape/allOf/1 | missing | missing additionalProperties on object schema | set additionalProperties false or typed dictionary |
| tools/schemas/game.manifest.schema.json | #/$defs/objectVectorStudioPolylineShape/allOf/1 | missing | missing additionalProperties on object schema | set additionalProperties false or typed dictionary |
| tools/schemas/game.manifest.schema.json | #/$defs/objectVectorStudioRectangleShape/allOf/1 | missing | missing additionalProperties on object schema | set additionalProperties false or typed dictionary |
| tools/schemas/game.manifest.schema.json | #/$defs/objectVectorStudioShapeCommon/properties/geometry | true | unknown fields explicitly allowed | replace with false or typed dictionary schema |
| tools/schemas/game.manifest.schema.json | #/$defs/objectVectorStudioSquareShape/allOf/1 | missing | missing additionalProperties on object schema | set additionalProperties false or typed dictionary |
| tools/schemas/game.manifest.schema.json | #/$defs/objectVectorStudioTextShape/allOf/1 | missing | missing additionalProperties on object schema | set additionalProperties false or typed dictionary |
| tools/schemas/game.manifest.schema.json | #/$defs/objectVectorStudioTriangleShape/allOf/1 | missing | missing additionalProperties on object schema | set additionalProperties false or typed dictionary |
| tools/schemas/samples/sample.tool-payload.schema.json | #/$defs/jsonArray/items | n/a | broad jsonValue escape hatch | replace with typed payload schema where repo-owned |
| tools/schemas/samples/sample.tool-payload.schema.json | #/$defs/jsonObject/patternProperties/^.*$ | pattern:^.*$ | open-ended dictionary with jsonValue | narrow key pattern and value schema |
| tools/schemas/samples/sample.tool-payload.schema.json | #/$defs/jsonObject/patternProperties/^.*$ | n/a | broad jsonValue escape hatch | replace with typed payload schema where repo-owned |
| tools/schemas/samples/sample.tool-payload.schema.json | #/patternProperties/^(?!\$schema$|schema$|version$).+ | n/a | broad jsonValue escape hatch | replace with typed payload schema where repo-owned |
| tools/schemas/tools/3d-asset-viewer.schema.json | #/$defs/jsonArray/items | n/a | broad jsonValue escape hatch | replace with typed payload schema where repo-owned |
| tools/schemas/tools/3d-asset-viewer.schema.json | #/$defs/jsonObject/patternProperties/^.*$ | pattern:^.*$ | open-ended dictionary with jsonValue | narrow key pattern and value schema |
| tools/schemas/tools/3d-asset-viewer.schema.json | #/$defs/jsonObject/patternProperties/^.*$ | n/a | broad jsonValue escape hatch | replace with typed payload schema where repo-owned |
| tools/schemas/tools/3d-asset-viewer.schema.json | #/properties/asset3d | n/a | broad jsonValue escape hatch | replace with typed payload schema where repo-owned |
| tools/schemas/tools/3d-camera-path-editor.schema.json | #/$defs/jsonArray/items | n/a | broad jsonValue escape hatch | replace with typed payload schema where repo-owned |
| tools/schemas/tools/3d-camera-path-editor.schema.json | #/$defs/jsonObject/patternProperties/^.*$ | pattern:^.*$ | open-ended dictionary with jsonValue | narrow key pattern and value schema |
| tools/schemas/tools/3d-camera-path-editor.schema.json | #/$defs/jsonObject/patternProperties/^.*$ | n/a | broad jsonValue escape hatch | replace with typed payload schema where repo-owned |
| tools/schemas/tools/3d-camera-path-editor.schema.json | #/properties/cameraPath | n/a | broad jsonValue escape hatch | replace with typed payload schema where repo-owned |
| tools/schemas/tools/3d-json-payload.schema.json | #/$defs/jsonArray/items | n/a | broad jsonValue escape hatch | replace with typed payload schema where repo-owned |
| tools/schemas/tools/3d-json-payload.schema.json | #/$defs/jsonObject/patternProperties/^.*$ | pattern:^.*$ | open-ended dictionary with jsonValue | narrow key pattern and value schema |
| tools/schemas/tools/3d-json-payload.schema.json | #/$defs/jsonObject/patternProperties/^.*$ | n/a | broad jsonValue escape hatch | replace with typed payload schema where repo-owned |
| tools/schemas/tools/3d-json-payload.schema.json | #/properties/mapPayload | n/a | broad jsonValue escape hatch | replace with typed payload schema where repo-owned |
| tools/schemas/tools/asset-pipeline.schema.json | #/$defs/jsonArray/items | n/a | broad jsonValue escape hatch | replace with typed payload schema where repo-owned |
| tools/schemas/tools/asset-pipeline.schema.json | #/$defs/jsonObject/patternProperties/^.*$ | pattern:^.*$ | open-ended dictionary with jsonValue | narrow key pattern and value schema |
| tools/schemas/tools/asset-pipeline.schema.json | #/$defs/jsonObject/patternProperties/^.*$ | n/a | broad jsonValue escape hatch | replace with typed payload schema where repo-owned |
| tools/schemas/tools/asset-pipeline.schema.json | #/properties/pipelinePayload | n/a | broad jsonValue escape hatch | replace with typed payload schema where repo-owned |
| tools/schemas/tools/object-vector-studio-v2.schema.json | #/$defs/arcShape/allOf/1 | missing | missing additionalProperties on object schema | set additionalProperties false or typed dictionary |
| tools/schemas/tools/object-vector-studio-v2.schema.json | #/$defs/circleShape/allOf/1 | missing | missing additionalProperties on object schema | set additionalProperties false or typed dictionary |
| tools/schemas/tools/object-vector-studio-v2.schema.json | #/$defs/ellipseShape/allOf/1 | missing | missing additionalProperties on object schema | set additionalProperties false or typed dictionary |
| tools/schemas/tools/object-vector-studio-v2.schema.json | #/$defs/lineShape/allOf/1 | missing | missing additionalProperties on object schema | set additionalProperties false or typed dictionary |
| tools/schemas/tools/object-vector-studio-v2.schema.json | #/$defs/polygonShape/allOf/1 | missing | missing additionalProperties on object schema | set additionalProperties false or typed dictionary |
| tools/schemas/tools/object-vector-studio-v2.schema.json | #/$defs/polylineShape/allOf/1 | missing | missing additionalProperties on object schema | set additionalProperties false or typed dictionary |
| tools/schemas/tools/object-vector-studio-v2.schema.json | #/$defs/rectangleShape/allOf/1 | missing | missing additionalProperties on object schema | set additionalProperties false or typed dictionary |
| tools/schemas/tools/object-vector-studio-v2.schema.json | #/$defs/shapeCommon/properties/geometry | missing | missing additionalProperties on object schema | set additionalProperties false or typed dictionary |
| tools/schemas/tools/object-vector-studio-v2.schema.json | #/$defs/squareShape/allOf/1 | missing | missing additionalProperties on object schema | set additionalProperties false or typed dictionary |
| tools/schemas/tools/object-vector-studio-v2.schema.json | #/$defs/textShape/allOf/1 | missing | missing additionalProperties on object schema | set additionalProperties false or typed dictionary |
| tools/schemas/tools/object-vector-studio-v2.schema.json | #/$defs/triangleShape/allOf/1 | missing | missing additionalProperties on object schema | set additionalProperties false or typed dictionary |
| tools/schemas/tools/parallax-editor.schema.json | #/$defs/jsonArray/items | n/a | broad jsonValue escape hatch | replace with typed payload schema where repo-owned |
| tools/schemas/tools/parallax-editor.schema.json | #/$defs/jsonObject/patternProperties/^.*$ | pattern:^.*$ | open-ended dictionary with jsonValue | narrow key pattern and value schema |
| tools/schemas/tools/parallax-editor.schema.json | #/$defs/jsonObject/patternProperties/^.*$ | n/a | broad jsonValue escape hatch | replace with typed payload schema where repo-owned |
| tools/schemas/tools/parallax-editor.schema.json | #/properties/parallaxDocument | n/a | broad jsonValue escape hatch | replace with typed payload schema where repo-owned |
| tools/schemas/tools/parallax-editor.schema.json | #/properties/tilemapDocumentPath | n/a | broad jsonValue escape hatch | replace with typed payload schema where repo-owned |
| tools/schemas/tools/parallax-editor.schema.json | #/properties/vectorAssetSvgPath | n/a | broad jsonValue escape hatch | replace with typed payload schema where repo-owned |
| tools/schemas/tools/performance-profiler.schema.json | #/$defs/jsonArray/items | n/a | broad jsonValue escape hatch | replace with typed payload schema where repo-owned |
| tools/schemas/tools/performance-profiler.schema.json | #/$defs/jsonObject/patternProperties/^.*$ | pattern:^.*$ | open-ended dictionary with jsonValue | narrow key pattern and value schema |
| tools/schemas/tools/performance-profiler.schema.json | #/$defs/jsonObject/patternProperties/^.*$ | n/a | broad jsonValue escape hatch | replace with typed payload schema where repo-owned |
| tools/schemas/tools/performance-profiler.schema.json | #/properties/profileSettings | n/a | broad jsonValue escape hatch | replace with typed payload schema where repo-owned |
| tools/schemas/tools/physics-sandbox.schema.json | #/$defs/jsonArray/items | n/a | broad jsonValue escape hatch | replace with typed payload schema where repo-owned |
| tools/schemas/tools/physics-sandbox.schema.json | #/$defs/jsonObject/patternProperties/^.*$ | pattern:^.*$ | open-ended dictionary with jsonValue | narrow key pattern and value schema |
| tools/schemas/tools/physics-sandbox.schema.json | #/$defs/jsonObject/patternProperties/^.*$ | n/a | broad jsonValue escape hatch | replace with typed payload schema where repo-owned |
| tools/schemas/tools/physics-sandbox.schema.json | #/properties/physicsBody | n/a | broad jsonValue escape hatch | replace with typed payload schema where repo-owned |
| tools/schemas/tools/replay-visualizer.schema.json | #/$defs/jsonArray/items | n/a | broad jsonValue escape hatch | replace with typed payload schema where repo-owned |
| tools/schemas/tools/replay-visualizer.schema.json | #/$defs/jsonObject/patternProperties/^.*$ | pattern:^.*$ | open-ended dictionary with jsonValue | narrow key pattern and value schema |
| tools/schemas/tools/replay-visualizer.schema.json | #/$defs/jsonObject/patternProperties/^.*$ | n/a | broad jsonValue escape hatch | replace with typed payload schema where repo-owned |
| tools/schemas/tools/replay-visualizer.schema.json | #/properties/events | n/a | broad jsonValue escape hatch | replace with typed payload schema where repo-owned |
| tools/schemas/tools/sprite-editor.schema.json | #/$defs/jsonArray/items | n/a | broad jsonValue escape hatch | replace with typed payload schema where repo-owned |
| tools/schemas/tools/sprite-editor.schema.json | #/$defs/jsonObject/patternProperties/^.*$ | pattern:^.*$ | open-ended dictionary with jsonValue | narrow key pattern and value schema |
| tools/schemas/tools/sprite-editor.schema.json | #/$defs/jsonObject/patternProperties/^.*$ | n/a | broad jsonValue escape hatch | replace with typed payload schema where repo-owned |
| tools/schemas/tools/sprite-editor.schema.json | #/properties/assetRegistry | n/a | broad jsonValue escape hatch | replace with typed payload schema where repo-owned |
| tools/schemas/tools/sprite-editor.schema.json | #/properties/spriteProject | n/a | broad jsonValue escape hatch | replace with typed payload schema where repo-owned |
| tools/schemas/tools/state-inspector.schema.json | #/$defs/jsonArray/items | n/a | broad jsonValue escape hatch | replace with typed payload schema where repo-owned |
| tools/schemas/tools/state-inspector.schema.json | #/$defs/jsonObject/patternProperties/^.*$ | pattern:^.*$ | open-ended dictionary with jsonValue | narrow key pattern and value schema |
| tools/schemas/tools/state-inspector.schema.json | #/$defs/jsonObject/patternProperties/^.*$ | n/a | broad jsonValue escape hatch | replace with typed payload schema where repo-owned |
| tools/schemas/tools/state-inspector.schema.json | #/properties/snapshot | n/a | broad jsonValue escape hatch | replace with typed payload schema where repo-owned |
| tools/schemas/tools/svg-asset-studio.schema.json | #/$defs/jsonArray/items | n/a | broad jsonValue escape hatch | replace with typed payload schema where repo-owned |
| tools/schemas/tools/svg-asset-studio.schema.json | #/$defs/jsonObject/patternProperties/^.*$ | pattern:^.*$ | open-ended dictionary with jsonValue | narrow key pattern and value schema |
| tools/schemas/tools/svg-asset-studio.schema.json | #/$defs/jsonObject/patternProperties/^.*$ | n/a | broad jsonValue escape hatch | replace with typed payload schema where repo-owned |
| tools/schemas/tools/svg-asset-studio.schema.json | #/properties/vectorAssetDocument | n/a | broad jsonValue escape hatch | replace with typed payload schema where repo-owned |
| tools/schemas/tools/tile-map-editor.schema.json | #/$defs/jsonArray/items | n/a | broad jsonValue escape hatch | replace with typed payload schema where repo-owned |
| tools/schemas/tools/tile-map-editor.schema.json | #/$defs/jsonObject/patternProperties/^.*$ | pattern:^.*$ | open-ended dictionary with jsonValue | narrow key pattern and value schema |
| tools/schemas/tools/tile-map-editor.schema.json | #/$defs/jsonObject/patternProperties/^.*$ | n/a | broad jsonValue escape hatch | replace with typed payload schema where repo-owned |
| tools/schemas/tools/tile-map-editor.schema.json | #/properties/parallaxDocument | n/a | broad jsonValue escape hatch | replace with typed payload schema where repo-owned |
| tools/schemas/tools/tile-map-editor.schema.json | #/properties/tileMapDocument | n/a | broad jsonValue escape hatch | replace with typed payload schema where repo-owned |
| tools/schemas/tools/tile-map-editor.schema.json | #/properties/tilemapDocumentPath | n/a | broad jsonValue escape hatch | replace with typed payload schema where repo-owned |
| tools/schemas/tools/vector-map-editor.schema.json | #/$defs/jsonArray/items | n/a | broad jsonValue escape hatch | replace with typed payload schema where repo-owned |
| tools/schemas/tools/vector-map-editor.schema.json | #/$defs/jsonObject/patternProperties/^.*$ | pattern:^.*$ | open-ended dictionary with jsonValue | narrow key pattern and value schema |
| tools/schemas/tools/vector-map-editor.schema.json | #/$defs/jsonObject/patternProperties/^.*$ | n/a | broad jsonValue escape hatch | replace with typed payload schema where repo-owned |
| tools/schemas/tools/vector-map-editor.schema.json | #/properties/vectorMapDocument | n/a | broad jsonValue escape hatch | replace with typed payload schema where repo-owned |
