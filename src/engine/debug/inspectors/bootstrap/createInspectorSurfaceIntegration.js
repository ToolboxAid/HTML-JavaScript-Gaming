/*
Toolbox Aid
David Quesenberry
04/06/2026
createInspectorSurfaceIntegration.js
*/

import { createInspectorCommandPack, registerInspectorCommands } from "../commands/registerInspectorCommands.js";
import { createDebugInspectorHost } from "../host/debugInspectorHost.js";
import { createDebugInspectorRegistry } from "../registry/debugInspectorRegistry.js";
import { asObject, sanitizeText } from "../shared/inspectorUtils.js";

const DEFAULT_INSPECTOR_PANELS = Object.freeze([
  Object.freeze({
    id: "inspector-entity",
    title: "Inspector: Entity",
    modelKey: "entity",
    priority: 1170
  }),
  Object.freeze({
    id: "inspector-component",
    title: "Inspector: Component",
    modelKey: "component",
    priority: 1171
  }),
  Object.freeze({
    id: "inspector-state-diff",
    title: "Inspector: State Diff",
    modelKey: "stateDiff",
    priority: 1172
  }),
  Object.freeze({
    id: "inspector-timeline",
    title: "Inspector: Timeline",
    modelKey: "timeline",
    priority: 1173
  }),
  Object.freeze({
    id: "inspector-event-stream",
    title: "Inspector: Event Stream",
    modelKey: "eventStream",
    priority: 1174
  })
]);

function toPanelDescriptor(host, definition, enabledByDefault) {
  const source = asObject(definition);
  const id = sanitizeText(source.id) || "inspector-panel";
  const title = sanitizeText(source.title) || id;
  const modelKey = sanitizeText(source.modelKey);
  const priority = Number.isFinite(source.priority) ? Number(source.priority) : 1170;
  return {
    id,
    title,
    enabled: enabledByDefault === true,
    priority,
    source: "inspectors",
    renderMode: "text-block",
    render(_panel, contextSnapshot = {}) {
      host.update(asObject(contextSnapshot));
      const snapshot = asObject(host.getSnapshot());
      const model = asObject(asObject(snapshot.models)[modelKey]);
      const lines = Array.isArray(model.lines) ? model.lines.slice(0, 12) : [];
      return {
        id,
        title,
        lines: lines.length > 0 ? lines : [`No ${modelKey || "inspector"} data available.`]
      };
    }
  };
}

function toProviderDescriptors() {
  return [
    {
      providerId: "inspector.entity.snapshot",
      title: "Inspector Entity Snapshot",
      readOnly: true,
      sourcePath: "inspectors.models.entity"
    },
    {
      providerId: "inspector.component.snapshot",
      title: "Inspector Component Snapshot",
      readOnly: true,
      sourcePath: "inspectors.models.component"
    },
    {
      providerId: "inspector.stateDiff.snapshot",
      title: "Inspector State Diff Snapshot",
      readOnly: true,
      sourcePath: "inspectors.models.stateDiff"
    },
    {
      providerId: "inspector.timeline.snapshot",
      title: "Inspector Timeline Snapshot",
      readOnly: true,
      sourcePath: "inspectors.models.timeline"
    },
    {
      providerId: "inspector.eventStream.snapshot",
      title: "Inspector Event Stream Snapshot",
      readOnly: true,
      sourcePath: "inspectors.models.eventStream"
    }
  ];
}

export function createInspectorSurfaceIntegration(options = {}) {
  const source = asObject(options);
  const registry = source.registry && typeof source.registry.getSnapshot === "function"
    ? source.registry
    : createDebugInspectorRegistry({
      inspectors: source.inspectors
    });
  const host = source.host && typeof source.host.getSnapshot === "function"
    ? source.host
    : createDebugInspectorHost({
      registry,
      limits: source.limits
    });
  const commandRegistration = source.commandRegistry
    ? registerInspectorCommands({
      host,
      commandRegistry: source.commandRegistry,
      packId: sanitizeText(source.commandPackId) || "inspectorx",
      namespace: sanitizeText(source.commandNamespace) || "inspectorx"
    })
    : null;

  return {
    registry,
    host,
    commandRegistration,
    update(context = {}) {
      return host.update(context);
    },
    getSnapshot() {
      return host.getSnapshot();
    }
  };
}

export function createAdvancedInspectorDebugPluginDefinition(options = {}) {
  const source = asObject(options);
  const integration = createInspectorSurfaceIntegration({
    registry: source.registry,
    host: source.host,
    limits: source.limits
  });
  const host = integration.host;
  const defaultPanels = Array.isArray(source.panels) ? source.panels : DEFAULT_INSPECTOR_PANELS;
  const includeCommandPack = source.includeCommandPack === true;
  const commandPackId = sanitizeText(source.commandPackId) || "inspectorx";
  const commandNamespace = sanitizeText(source.commandNamespace) || commandPackId;

  return {
    pluginId: sanitizeText(source.pluginId) || "inspectors.advanced",
    title: sanitizeText(source.title) || "Advanced Inspectors",
    featureFlag: sanitizeText(source.featureFlag) || "advancedInspectors",
    autoActivate: source.autoActivate === true,
    capabilities: [
      { capabilityId: "debug.overlay.panel", version: "1.0.0", required: true },
      { capabilityId: "debug.overlay.provider", version: "1.0.0", required: true },
      { capabilityId: "debug.command-pack", version: "1.0.0", required: includeCommandPack }
    ],
    getProviders() {
      return toProviderDescriptors();
    },
    getPanels() {
      return defaultPanels.map((panel) => toPanelDescriptor(host, panel, source.panelsEnabled === true));
    },
    getCommandPacks() {
      if (!includeCommandPack) {
        return [];
      }
      return [
        createInspectorCommandPack({
          host,
          packId: commandPackId,
          namespace: commandNamespace,
          label: sanitizeText(source.commandLabel) || "Advanced Inspector"
        })
      ];
    },
    update(context = {}) {
      return host.update(context);
    },
    getSnapshot() {
      return host.getSnapshot();
    }
  };
}

