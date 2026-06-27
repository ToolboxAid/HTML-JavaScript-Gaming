/*
Toolbox Aid
David Quesenberry
03/25/2026
AITargetDummyDebugOverlay.js
*/
export default class AITargetDummyDebugOverlay {
  render(renderer, { world, telemetry }) {
    const dummy = world.dummy;
    const target = telemetry.lastKnownTarget;

    renderer.drawCircle(dummy.x, dummy.y, world.config.pursueEnterDist, 'rgba(14, 165, 233, 0.12)');
    renderer.drawCircle(dummy.x, dummy.y, world.config.pursueExitDist, 'rgba(14, 165, 233, 0.08)');
    renderer.drawCircle(dummy.x, dummy.y, world.config.evadeEnterDist, 'rgba(239, 68, 68, 0.2)');
    renderer.drawCircle(dummy.x, dummy.y, world.config.evadeExitDist, 'rgba(239, 68, 68, 0.12)');

    if (target) {
      renderer.drawRect(target.x - 3, target.y - 3, 6, 6, '#facc15');
    }

    renderer.drawLine(dummy.x, dummy.y, dummy.x + (dummy.vx * 0.2), dummy.y + (dummy.vy * 0.2), '#93c5fd', 2);

    renderer.drawRect(648, 88, 286, 222, 'rgba(2, 6, 23, 0.82)');
    renderer.strokeRect(648, 88, 286, 222, '#334155', 1);
    const lines = [
      `STATE: ${dummy.state.toUpperCase()}`,
      `DIST: ${dummy.lastDistance.toFixed(1)}`,
      `VEL: ${telemetry.velocity.toFixed(1)}`,
      `DECISION MS: ${Math.round(telemetry.decisionTimeMs)}`,
      `STATE CHANGED: ${telemetry.stateChanged}`,
      `TARGET: ${target ? `${Math.round(target.x)},${Math.round(target.y)}` : 'none'}`,
    ];
    lines.forEach((line, index) => {
      renderer.drawText(line, 664, 108 + (index * 30), {
        color: index === 0 ? '#e2e8f0' : '#94a3b8',
        font: '15px monospace',
        textBaseline: 'top',
      });
    });
  }
}
