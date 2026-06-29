/*
Toolbox Aid
David Quesenberry
03/22/2026
UIFramework.js
*/
export default class UIFramework {
  constructor() {
    this.elements = [];
  }

  clear() {
    this.elements = [];
  }

  addPanel(config) {
    return this.addElement({ type: 'panel', ...config });
  }

  addLabel(config) {
    return this.addElement({ type: 'label', ...config });
  }

  addButton(config) {
    return this.addElement({ type: 'button', ...config });
  }

  addElement(config) {
    const element = {
      id: config.id,
      type: config.type,
      x: config.x ?? 0,
      y: config.y ?? 0,
      width: config.width ?? 0,
      height: config.height ?? 0,
      text: config.text ?? '',
      fill: config.fill ?? '#1f2937',
      stroke: config.stroke ?? '#d8d5ff',
      textColor: config.textColor ?? '#ffffff',
      onClick: config.onClick ?? null,
    };

    this.elements.push(element);
    return element;
  }

  render(renderer) {
    for (const element of this.elements) {
      if (element.type === 'panel' || element.type === 'button') {
        renderer.drawRect(element.x, element.y, element.width, element.height, element.fill);
        renderer.strokeRect(element.x, element.y, element.width, element.height, element.stroke, 2);
      }

      if (element.text) {
        renderer.drawText(element.text, element.x + 12, element.y + 24, {
          color: element.textColor,
          font: '16px monospace',
        });
      }
    }
  }

  click(x, y, context = {}) {
    for (let index = this.elements.length - 1; index >= 0; index -= 1) {
      const element = this.elements[index];
      if (element.type !== 'button') {
        continue;
      }

      const inside = (
        x >= element.x &&
        x <= element.x + element.width &&
        y >= element.y &&
        y <= element.y + element.height
      );

      if (!inside) {
        continue;
      }

      if (typeof element.onClick === 'function') {
        element.onClick(context);
      }
      return element.id;
    }

    return null;
  }

  getElements() {
    return this.elements.map((element) => ({ ...element, onClick: undefined }));
  }
}
