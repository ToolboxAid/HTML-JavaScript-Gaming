/*
Toolbox Aid
David Quesenberry
03/25/2026
VectorMapRenderer3D.js
*/
export class VectorMapRenderer3D {
  project(point, view) {
    const angle = Math.PI / 6;
    const isoX = (point.x - point.z) * Math.cos(angle);
    const isoY = point.y + (point.x + point.z) * Math.sin(angle) * 0.5;
    return {
      x: isoX * view.zoom + view.offsetX,
      y: isoY * view.zoom + view.offsetY
    };
  }

  render(ctx, state) {
    const { canvas, documentData, selectionModel, view, hover } = state;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = documentData.background || "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    this.drawGrid(ctx, canvas);
    this.drawAxes(ctx, canvas, view);

    for (const object of documentData.objects) {
      this.drawObject(ctx, object, selectionModel.isSelectedObject(object.id), view);
    }

    const selection = selectionModel.getSelection({
      getObjectById: (objectId) => documentData.objects.find((item) => item.id === objectId)
    });

    if (selection.object) {
      this.drawCenter(ctx, selection.object.center, view);
    }

    if (hover) {
      const projected = this.project(hover, view);
      ctx.save();
      ctx.strokeStyle = "#80e4a3";
      ctx.beginPath();
      ctx.arc(projected.x, projected.y, 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  drawGrid(ctx, canvas) {
    ctx.save();
    ctx.strokeStyle = "#162038";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawAxes(ctx, canvas, view) {
    const origin = this.project({ x: 0, y: 0, z: 0 }, view);
    const xAxis = this.project({ x: 120, y: 0, z: 0 }, view);
    const yAxis = this.project({ x: 0, y: 120, z: 0 }, view);
    const zAxis = this.project({ x: 0, y: 0, z: 120 }, view);

    ctx.save();
    ctx.lineWidth = 2;

    ctx.strokeStyle = "#7bc0ff";
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(xAxis.x, xAxis.y);
    ctx.stroke();

    ctx.strokeStyle = "#80e4a3";
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(yAxis.x, yAxis.y);
    ctx.stroke();

    ctx.strokeStyle = "#ffb36b";
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(zAxis.x, zAxis.y);
    ctx.stroke();

    ctx.restore();
  }

  drawObject(ctx, object, isSelected, view) {
    const points = object.points.map((point) => this.project(point, view));
    ctx.save();
    ctx.strokeStyle = object.style.stroke || "#ffffff";
    ctx.lineWidth = Math.max(1, (object.style.lineWidth || 2) * view.zoom * 0.4);

    if (points.length >= 1) {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let index = 1; index < points.length; index += 1) {
        ctx.lineTo(points[index].x, points[index].y);
      }
      if (object.closed && points.length > 2) {
        ctx.closePath();
      }
      ctx.stroke();
    }

    for (const point of points) {
      ctx.beginPath();
      ctx.fillStyle = "#ffd86b";
      ctx.arc(point.x, point.y, isSelected ? 5 : 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#09101d";
      ctx.stroke();
    }

    if (isSelected && points.length) {
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = "#6bb8ff";
      const xs = points.map((point) => point.x);
      const ys = points.map((point) => point.y);
      ctx.strokeRect(Math.min(...xs) - 8, Math.min(...ys) - 8, Math.max(...xs) - Math.min(...xs) + 16, Math.max(...ys) - Math.min(...ys) + 16);
      ctx.setLineDash([]);
    }

    ctx.restore();
  }

  drawCenter(ctx, center, view) {
    const point = this.project(center, view);
    ctx.save();
    ctx.strokeStyle = "#ff7ef4";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(point.x - 10, point.y);
    ctx.lineTo(point.x + 10, point.y);
    ctx.moveTo(point.x, point.y - 10);
    ctx.lineTo(point.x, point.y + 10);
    ctx.stroke();
    ctx.restore();
  }
}
