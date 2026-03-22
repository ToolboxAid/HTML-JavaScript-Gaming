/*
Toolbox Aid
David Quesenberry
03/22/2026
GroupBehaviors.js
*/
import { clamp } from '../utils/math.js';

export function computeGroupSteering(agent, agents, {
  neighborRadius = 120,
  separationDistance = 34,
  alignmentWeight = 0.6,
  cohesionWeight = 0.35,
  separationWeight = 1.2,
  maxSpeed = 90,
} = {}) {
  const neighbors = agents.filter((other) => {
    if (other === agent) {
      return false;
    }

    return Math.hypot(other.x - agent.x, other.y - agent.y) <= neighborRadius;
  });

  if (neighbors.length === 0) {
    return { velocityX: agent.velocityX ?? 0, velocityY: agent.velocityY ?? 0, neighbors: 0 };
  }

  let alignmentX = 0;
  let alignmentY = 0;
  let cohesionX = 0;
  let cohesionY = 0;
  let separationX = 0;
  let separationY = 0;

  neighbors.forEach((other) => {
    alignmentX += other.velocityX ?? 0;
    alignmentY += other.velocityY ?? 0;
    cohesionX += other.x;
    cohesionY += other.y;

    const dx = agent.x - other.x;
    const dy = agent.y - other.y;
    const distance = Math.max(1, Math.hypot(dx, dy));
    if (distance < separationDistance) {
      separationX += dx / distance;
      separationY += dy / distance;
    }
  });

  alignmentX /= neighbors.length;
  alignmentY /= neighbors.length;
  cohesionX = (cohesionX / neighbors.length) - agent.x;
  cohesionY = (cohesionY / neighbors.length) - agent.y;

  const velocityX = (alignmentX * alignmentWeight) + (cohesionX * cohesionWeight) + (separationX * separationWeight);
  const velocityY = (alignmentY * alignmentWeight) + (cohesionY * cohesionWeight) + (separationY * separationWeight);
  const magnitude = Math.max(1, Math.hypot(velocityX, velocityY));

  return {
    velocityX: (velocityX / magnitude) * maxSpeed,
    velocityY: (velocityY / magnitude) * maxSpeed,
    neighbors: neighbors.length,
  };
}

export function stepGroupBehavior(agent, agents, dt, bounds, options = {}) {
  const steering = computeGroupSteering(agent, agents, options);
  agent.velocityX = steering.velocityX;
  agent.velocityY = steering.velocityY;
  agent.x += agent.velocityX * dt;
  agent.y += agent.velocityY * dt;

  if (bounds) {
    agent.x = clamp(agent.x, bounds.x, bounds.x + bounds.width - agent.width);
    agent.y = clamp(agent.y, bounds.y, bounds.y + bounds.height - agent.height);
  }

  return steering;
}
