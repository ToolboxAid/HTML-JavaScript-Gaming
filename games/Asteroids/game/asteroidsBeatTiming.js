const ASTEROID_BEAT_MIN_INTERVAL_SECONDS = 0.18;
const ASTEROID_BEAT_MAX_INTERVAL_SECONDS = 0.98;
const ASTEROID_BEAT_SIZE_WEIGHTS = Object.freeze({
  1: 1,
  2: 4,
  3: 9,
});

function isActiveAsteroid(asteroid) {
  return Boolean(asteroid)
    && typeof asteroid === 'object'
    && asteroid.active !== false
    && asteroid.alive !== false
    && asteroid.destroyed !== true;
}

export function getAsteroidsBeatWeightedTotal(asteroids) {
  if (!Array.isArray(asteroids)) {
    return 0;
  }
  return asteroids.reduce((total, asteroid) => (
    total + (isActiveAsteroid(asteroid) ? ASTEROID_BEAT_SIZE_WEIGHTS[asteroid.size] || 0 : 0)
  ), 0);
}

function getAsteroidsBeatInterval(weightedTotal, maxWeightedTotal) {
  const safeWeightedTotal = Math.max(0, Number.isFinite(weightedTotal) ? weightedTotal : 0);
  const safeMaxWeightedTotal = Math.max(1, Number.isFinite(maxWeightedTotal) ? maxWeightedTotal : safeWeightedTotal);
  const weightedProgress = Math.min(1, safeWeightedTotal / safeMaxWeightedTotal);
  return ASTEROID_BEAT_MIN_INTERVAL_SECONDS
    + ((ASTEROID_BEAT_MAX_INTERVAL_SECONDS - ASTEROID_BEAT_MIN_INTERVAL_SECONDS) * weightedProgress);
}

export function calculateAsteroidsBeatTiming(asteroids, currentMaxWeightedTotal) {
  const weightedTotal = getAsteroidsBeatWeightedTotal(asteroids);
  const baselineWeightedTotal = Number.isFinite(currentMaxWeightedTotal) ? currentMaxWeightedTotal : 1;
  const maxWeightedTotal = Math.max(baselineWeightedTotal, weightedTotal, 1);
  return {
    intervalSeconds: getAsteroidsBeatInterval(weightedTotal, maxWeightedTotal),
    maxWeightedTotal,
    weightedTotal,
  };
}
