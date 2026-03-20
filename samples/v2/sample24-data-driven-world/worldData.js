export const worldData = {
  worldBounds: { x: 80, y: 170, width: 800, height: 280 },
  entities: [
    {
      type: 'player',
      transform: { x: 140, y: 240 },
      size: { width: 48, height: 48 },
      speed: { value: 240 },
      inputControlled: { enabled: true },
      renderable: { color: 'actorFill', label: 'player' },
      collider: { solid: false },
    },
    {
      type: 'solid',
      transform: { x: 340, y: 170 },
      size: { width: 80, height: 180 },
      renderable: { color: '#8888ff', label: 'solidA' },
      solid: { enabled: true },
    },
    {
      type: 'solid',
      transform: { x: 540, y: 270 },
      size: { width: 160, height: 70 },
      renderable: { color: '#66cc99', label: 'solidB' },
      solid: { enabled: true },
    },
    {
      type: 'marker',
      transform: { x: 760, y: 210 },
      size: { width: 36, height: 36 },
      renderable: { color: '#ffd166', label: 'goal' },
    },
  ],
};
