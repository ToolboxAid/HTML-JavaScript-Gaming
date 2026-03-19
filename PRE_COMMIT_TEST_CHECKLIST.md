# Pre-Commit Test Checklist

## Games / samples to test
- Asteroids-style sample / primary object-heavy sample
- any sample with spawn/remove/destroy loops
- any sample where objects are removed after collision

## Targeted runtime paths
- add object
- remove object
- destroy manager
- remove unknown object
- duplicate add rejection
- system add/remove path that passes through manager
