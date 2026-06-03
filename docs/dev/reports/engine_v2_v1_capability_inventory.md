# PR_26152_267 Engine V2 / V1 Capability Inventory

## Scope

- Inventory existing `src/` and `src/engine/` capability families.
- Inventory Engine V2 manifest-driven runtime capabilities already present under `src/engine/runtime`.
- Map V1 capability families to V2 equivalents.
- Identify reused, replaced, missing, and obsolete surfaces.

## Capability Map

| V1 / existing capability family | Representative existing surfaces | Engine V2 equivalent | Status |
|---|---|---|---|
| Core timing and engine loop | `src/engine/core/FixedTicker.js`, `FrameClock.js`, `Engine.js` | `runtimeTickLoop.js`, `runtimePlayableLoop.js`, `engineV2ConfigDrivenProofScene.js` | Replaced for V2 manifest runtime |
| Object/entity model | `entity/`, `components/`, `ecs/World.js` | `objectDefinitionReader.js`, `runtimeObjectRecordFactory.js`, `runtimeObjectInstantiation.js` | Replaced by manifest object records |
| Movement and physics | `systems/MovementSystem.js`, `physics/`, `systems/PhysicsSystem.js` | `runtimeMovementProcessing.js`, `runtimeTerrainEffects.js`, `runtimeEnvironmentEffects.js`, `engineV2ModifierStack.js` | Replaced/partitioned |
| Collision | `collision/`, `systems/CollisionSystem.js`, `CollisionResolutionSystem.js` | `runtimeCollisionProcessing.js`, `runtimeTriggerProcessing.js` | Replaced for manifest flow |
| Terrain/tilemap | `tilemap/`, tile collision helpers | `runtimeTerrainMaterialInstantiation.js`, `runtimeTerrainEffects.js` | Replaced conceptually; map authoring integration remains future |
| Rendering | `rendering/CanvasRenderer.js`, `LayeredRenderSystem.js`, `SpriteRenderSystem.js`, `VectorDrawing.js` | `runtimeRenderingBootstrap.js`, `runtimeRenderPipeline.js`, `engineV2UiRuntime.js`, `engineV2EffectRuntime.js` | Partially replaced; reusable renderer helpers remain candidates |
| Input | `input/`, `systems/InputControlSystem.js`, `InputMappingManifest.js` | `runtimeInputPipeline.js` | Adapted conceptually |
| Camera | `camera/CameraSystem.js`, `Camera2D.js`, `ZoneCameraSystem.js` | `engineV2CameraRuntime.js` | Replaced/adapted |
| Audio | `audio/AudioService.js`, media/synth/MIDI helpers | `engineV2AudioRuntime.js` | Adapted; low-level audio helpers remain reusable candidates |
| Animation/effects | `animation/AnimationController.js`, `fx/ParticleSystem.js` | `engineV2AnimationRuntime.js`, `engineV2EffectRuntime.js` | Replaced/adapted |
| AI/pathfinding | `ai/PatrolSystem.js`, `SteeringBehaviors.js`, `GridPathfinding.js` | `engineV2PatrolBehavior.js`, `engineV2ChaseFleeBehavior.js`, `engineV2PathfindingBaseline.js` | Adapted |
| Combat | `combat/Combat.js`, projectile and collision systems | `engineV2AbilitySystem.js`, `engineV2ProjectileSystem.js`, `engineV2StatusEffectSystem.js`, `engineV2WeaponSystem.js`, runtime health/damage/cooldown/lives/outcomes | Replaced |
| Possession/economy | Existing item/economy behavior is scattered or tool-owned | `engineV2InventorySystem.js`, `engineV2EquipmentSystem.js`, `engineV2ItemAndLootSystem.js`, `engineV2EconomyAndCurrency.js` | Added in V2 |
| Interaction/quests/dialogue | `interaction/InteractionSystem.js`, `world/QuestSystem.js`, `world/SpawnSystem.js`, `world/EventScriptSystem.js` | `engineV2InteractionSystem.js`, `engineV2ContainerSystem.js`, `engineV2VendorSystem.js`, `engineV2CraftingFoundation.js`, `engineV2ObjectiveSystem.js`, `engineV2QuestSystem.js`, `engineV2DialogueSystem.js` | Replaced |
| Persistence/save state | `persistence/`, `WorldSerializer.js`, browser storage services | `engineV2SaveStateModel.js`, `engineV2PersistenceRuntime.js`, `engineV2CheckpointSystem.js`, `engineV2ProfileStateSystem.js`, new shared Project Data Store contract | Partially replaced; browser storage is not authoritative |
| Custom code/extensions | Earlier user-facing Code Studio concept | `engineV2CustomExtensionsHookRuntime.js` with Custom Extensions lifecycle/boundary | Replaced user-facing concept |
| Networking/multiplayer | `network/` server/client/transport/debug surfaces | Engine V2 multiplayer boundary only | Future, not missing for initial Toolbox rebuild |
| Debug/automation/replay/security/release | `debug/`, `automation/`, `replay/`, `security/`, `release/` | No direct V2 gameplay equivalent yet | Future/optional depending lane |
| Theme/UI shell | `src/engine/theme`, `src/engine/ui` | Not Engine V2 gameplay runtime; remains separate surface | Reused/unchanged |

## Inventory Result

- Reused/adapted: input mapping concepts, audio helpers, camera concepts, AI/pathfinding concepts, render helper candidates.
- Replaced: hard-coded object, movement, collision, rule, interaction, combat, objective, quest, dialogue, save/load, and proof-scene behavior now has manifest-driven V2 slices.
- Missing/future: full networking, debug tooling integration, real database adapter, auth/admin/publish UI integration, deeper asset loading/binding integration.
- Obsolete for V2 readiness: browser storage as authoritative project state, sample-dependent runtime validation, hard-coded game behavior, and user-facing Code Studio naming.

## Validation

- PASS: static capability inventory completed from existing `src/`, `src/engine/`, and Engine V2 runtime surfaces.
- PASS: `git diff --check`

## Scope Exclusions

- No Toolbox rebuild.
- No samples.
- No runtime implementation changes for missing V1 capabilities.
