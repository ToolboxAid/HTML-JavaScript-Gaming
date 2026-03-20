export default class LevelLoader {
  static cloneLevelData(levelData) {
    return structuredClone(levelData);
  }

  static applyEntityDefinitions(world, definitions, options = {}) {
    const { mapRenderableColor = (value) => value } = options;

    definitions.forEach((definition) => {
      const entityId = world.createEntity();

      Object.entries(definition).forEach(([key, value]) => {
        if (key === 'type') {
          world.addComponent(entityId, 'tag', { value });
          return;
        }

        if (key === 'renderable') {
          world.addComponent(entityId, 'renderable', {
            ...value,
            color: mapRenderableColor(value.color),
          });
          return;
        }

        world.addComponent(entityId, key, { ...value });
      });
    });
  }
}
