/*
Toolbox Aid
David Quesenberry
03/22/2026
SceneGraphViewer.js
*/
export default class SceneGraphViewer {
  flatten(nodes = [], depth = 0, result = []) {
    nodes.forEach((node) => {
      result.push({
        id: node.id,
        label: node.label || node.id,
        depth,
        childCount: node.children?.length || 0,
      });
      this.flatten(node.children || [], depth + 1, result);
    });
    return result;
  }
}
