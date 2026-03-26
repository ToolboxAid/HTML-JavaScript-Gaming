/*
Toolbox Aid
David Quesenberry
03/26/2026
VectorMapRuntimeExporter.js
*/
export class VectorMapRuntimeExporter {
  build(documentModel) {
    const data = documentModel.toJSON();
    return {
      version: data.version,
      name: data.name,
      mode: data.mode,
      width: data.width,
      height: data.height,
      background: data.background,
      objects: data.objects.map((object) => ({
        id: object.id,
        name: object.name,
        kind: object.kind,
        space: object.space,
        closed: object.closed,
        center: { ...object.center },
        rotation: { ...object.rotation },
        style: {
          stroke: object.style.stroke,
          fill: object.style.fill,
          lineWidth: object.style.lineWidth,
          colorMode: object.style.colorMode
        },
        flags: { ...object.flags },
        points: object.points.map((point) => ({
          x: point.x,
          y: point.y,
          z: point.z,
          color: point.color
        }))
      }))
    };
  }

  download(documentModel) {
    const payload = JSON.stringify(this.build(documentModel), null, 2);
    const fileName = `${documentModel.getData().name || "untitled"}.runtime.json`;
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }
}
