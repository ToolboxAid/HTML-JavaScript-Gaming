/*
Toolbox Aid
David Quesenberry
03/25/2026
VectorMapRenderer2D.js
*/
export class VectorMapRenderer2D {
  render(ctx, state) {
    const { canvas, documentData, selectionModel, view, hover, collisionVector, collisionHit } = state;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = documentData.background || "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    this.drawGrid(ctx, canvas, view);
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
      this.drawHover(ctx, hover, view);
    }
    if (collisionVector?.start && collisionVector?.end) {
      this.drawCollisionVector(ctx, collisionVector, collisionHit, view);
    }
  }

  drawGrid(ctx, canvas, view) {
    const step = 50 * view.zoom;
    ctx.save();
    ctx.strokeStyle = "#162038";
    ctx.lineWidth = 1;
    const offsetX = ((view.offsetX % step) + step) % step;
    const offsetY = ((view.offsetY % step) + step) % step;
    for (let x = offsetX; x < canvas.width; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = offsetY; y < canvas.height; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }
    ctx.restore();
  }

  drawAxes(ctx, canvas, view) {
    const originX = view.offsetX;
    const originY = view.offsetY;
    ctx.save();
    ctx.strokeStyle = "#3a568d";
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, originY); ctx.lineTo(canvas.width, originY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(originX, 0); ctx.lineTo(originX, canvas.height); ctx.stroke();
    ctx.restore();
  }

  toScreen(point, view) {
    return { x: point.x * view.zoom + view.offsetX, y: point.y * view.zoom + view.offsetY };
  }

  drawObject(ctx, object, isSelected, view) {
    const points = object.points.map((point) => this.toScreen(point, view));
    if (!points.length) {
      return;
    }

    ctx.save();
    ctx.lineWidth = Math.max(1, (object.style.lineWidth || 2) * view.zoom * 0.5);

    if (object.style.colorMode === "point" && points.length > 1) {
      for (let index = 0; index < points.length - 1; index += 1) {
        const gradient = ctx.createLinearGradient(points[index].x, points[index].y, points[index + 1].x, points[index + 1].y);
        gradient.addColorStop(0, object.points[index].color || object.style.stroke || "#ffffff");
        gradient.addColorStop(1, object.points[index + 1].color || object.style.stroke || "#ffffff");
        ctx.strokeStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(points[index].x, points[index].y);
        ctx.lineTo(points[index + 1].x, points[index + 1].y);
        ctx.stroke();
      }
      if (object.closed && points.length > 2) {
        const last = points[points.length - 1];
        const first = points[0];
        const gradient = ctx.createLinearGradient(last.x, last.y, first.x, first.y);
        gradient.addColorStop(0, object.points[object.points.length - 1].color || object.style.stroke || "#ffffff");
        gradient.addColorStop(1, object.points[0].color || object.style.stroke || "#ffffff");
        ctx.strokeStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(last.x, last.y);
        ctx.lineTo(first.x, first.y);
        ctx.stroke();
      }
    } else {
      ctx.strokeStyle = object.style.stroke || "#ffffff";
      ctx.fillStyle = object.style.fill || "transparent";
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let index = 1; index < points.length; index += 1) {
        ctx.lineTo(points[index].x, points[index].y);
      }
      if (object.closed && points.length > 2) {
        ctx.closePath();
      }
      ctx.stroke();
      if (object.style.fill && object.closed && points.length > 2) {
        ctx.globalAlpha = 0.2;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    for (let index = 0; index < points.length; index += 1) {
      const point = points[index];
      ctx.beginPath();
      ctx.fillStyle = object.points[index].color || "#ffd86b";
      ctx.arc(point.x, point.y, isSelected ? 5 : 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#09101d";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    if (isSelected) {
      ctx.strokeStyle = "#6bb8ff";
      ctx.setLineDash([6, 6]);
      const xs = points.map((point) => point.x);
      const ys = points.map((point) => point.y);
      ctx.strokeRect(Math.min(...xs) - 8, Math.min(...ys) - 8, Math.max(...xs) - Math.min(...xs) + 16, Math.max(...ys) - Math.min(...ys) + 16);
      ctx.setLineDash([]);
    }
    ctx.restore();
  }

  drawCenter(ctx, center, view) {
    const point = this.toScreen(center, view);
    ctx.save();
    ctx.strokeStyle = "#ff7ef4";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(point.x - 10, point.y); ctx.lineTo(point.x + 10, point.y);
    ctx.moveTo(point.x, point.y - 10); ctx.lineTo(point.x, point.y + 10);
    ctx.stroke();
    ctx.restore();
  }

  drawHover(ctx, hover, view) {
    const point = this.toScreen(hover, view);
    ctx.save();
    ctx.strokeStyle = "#80e4a3";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  drawCollisionVector(ctx, vector, hit, view) {
    const start = this.toScreen(vector.start, view);
    const end = this.toScreen(vector.end, view);
    ctx.save();
    ctx.strokeStyle = "#ffb36b";
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 6]);
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.setLineDash([]);

    for (const point of [start, end]) {
      ctx.beginPath();
      ctx.fillStyle = "#ffb36b";
      ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    if (hit?.point) {
      const hitPoint = this.toScreen(hit.point, view);
      ctx.fillStyle = "#ff7878";
      ctx.beginPath();
      ctx.arc(hitPoint.x, hitPoint.y, 6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
