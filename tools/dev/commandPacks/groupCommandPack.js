/*
Toolbox Aid
David Quesenberry
04/05/2026
groupCommandPack.js
*/

import { DebugPanelGroupRegistry } from "../advanced/debugPanelGroupRegistry.js";
import { registerStandardPanelGroups } from "../advanced/registerStandardPanelGroups.js";
import {
  requireAtLeastArgs,
  requireNoArgs
} from "./packUtils.js";
import { createResult } from "./commandPackResultUtils.js";
import { getRuntimeAndRegistry } from "../../../src/shared/utils/runtimeRegistryUtils.js";

import { sanitizeText } from "../../../src/engine/debug/inspectors/shared/inspectorUtils.js";

function buildSnapshot(panelRegistry) {
  const panels = panelRegistry.getOrderedPanels(true);
  const allPanels = Array.isArray(panels) ? panels : [];
  return {
    version: "1",
    updatedAt: Date.now(),
    panels: allPanels.map((panel) => ({
      id: sanitizeText(panel?.id),
      enabled: Boolean(panel?.enabled)
    }))
  };
}

function persistSnapshotIfConfigured(context, panelRegistry) {
  if (typeof context?.persistOverlayPanelState !== "function") {
    return "PERSISTENCE_NOT_CONFIGURED";
  }

  try {
    context.persistOverlayPanelState(buildSnapshot(panelRegistry));
    return "PERSISTENCE_UPDATED";
  } catch (_error) {
    return "PERSISTENCE_UPDATE_FAILED";
  }
}

function setGroupEnabled(context, groupDescriptor, nextEnabled) {
  const runtimeContext = getRuntimeAndRegistry(context);
  if (runtimeContext.status !== "ready") {
    return createResult(
      "failed",
      "Group",
      [runtimeContext.message],
      runtimeContext.code
    );
  }

  const panelRegistry = runtimeContext.panelRegistry;
  const panelMap = new Map();
  const allPanels = panelRegistry.getOrderedPanels(true);
  (Array.isArray(allPanels) ? allPanels : []).forEach((panel) => {
    const panelId = sanitizeText(panel?.id);
    if (panelId) {
      panelMap.set(panelId, panel);
    }
  });

  const targetPanelIds = Array.isArray(groupDescriptor?.panelIds) ? groupDescriptor.panelIds : [];
  const missingPanelIds = [];
  let changedCount = 0;

  targetPanelIds.forEach((panelId) => {
    const id = sanitizeText(panelId);
    if (!id) {
      return;
    }

    const panel = panelMap.get(id);
    if (!panel) {
      missingPanelIds.push(id);
      return;
    }

    const before = Boolean(panel.enabled);
    const result = panelRegistry.setPanelEnabled(id, nextEnabled === true);
    if (sanitizeText(result?.status) === "ready" && before !== (nextEnabled === true)) {
      changedCount += 1;
    }
  });

  if (nextEnabled === true && targetPanelIds.length > 0) {
    runtimeContext.runtime.showOverlay();
  }

  const persistence = persistSnapshotIfConfigured(context, panelRegistry);

  return createResult(
    "ready",
    nextEnabled === true ? "Group Show" : "Group Hide",
    [
      `groupId=${groupDescriptor.groupId}`,
      `targetEnabled=${nextEnabled === true}`,
      `panelCount=${targetPanelIds.length}`,
      `changedCount=${changedCount}`,
      `missingCount=${missingPanelIds.length}`,
      `persistence=${persistence}`
    ],
    nextEnabled === true ? "GROUP_SHOW_READY" : "GROUP_HIDE_READY",
    {
      groupId: groupDescriptor.groupId,
      targetEnabled: nextEnabled === true,
      changedCount,
      missingPanelIds,
      persistence
    }
  );
}

const groupRegistry = new DebugPanelGroupRegistry();
registerStandardPanelGroups(groupRegistry, "standard");

export function createGroupCommandPack() {
  return {
    packId: "group",
    label: "Group",
    description: "Panel group commands for quick overlay visibility operations.",
    commands: [
      {
        name: "group.list",
        summary: "List registered panel groups.",
        usage: "group.list",
        validate({ args, commandName }) {
          return requireNoArgs({ args, commandName });
        },
        handler() {
          const groups = groupRegistry.listGroups();
          if (groups.length === 0) {
            return createResult(
              "failed",
              "Group List",
              ["No panel groups are registered."],
              "GROUP_LIST_EMPTY"
            );
          }

          return createResult(
            "ready",
            "Group List",
            [
              `groupCount=${groups.length}`,
              ...groups.map((group) => `${group.groupId} panelCount=${group.panelIds.length}`)
            ],
            "GROUP_LIST_READY",
            {
              groupCount: groups.length,
              groupIds: groups.map((group) => group.groupId)
            }
          );
        }
      },
      {
        name: "group.show",
        summary: "Enable all panels in a group.",
        usage: "group.show <groupId>",
        validate({ args, commandName }) {
          return requireAtLeastArgs(1, { args, commandName });
        },
        handler(context, args) {
          const groupId = sanitizeText(args?.[0]);
          const group = groupRegistry.getGroup(groupId);
          if (!group) {
            return createResult(
              "failed",
              "Group Show",
              [`Group ${groupId || "n/a"} was not found.`],
              "GROUP_NOT_FOUND",
              {
                groupId
              }
            );
          }
          return setGroupEnabled(context, group, true);
        }
      },
      {
        name: "group.hide",
        summary: "Disable all panels in a group.",
        usage: "group.hide <groupId>",
        validate({ args, commandName }) {
          return requireAtLeastArgs(1, { args, commandName });
        },
        handler(context, args) {
          const groupId = sanitizeText(args?.[0]);
          const group = groupRegistry.getGroup(groupId);
          if (!group) {
            return createResult(
              "failed",
              "Group Hide",
              [`Group ${groupId || "n/a"} was not found.`],
              "GROUP_NOT_FOUND",
              {
                groupId
              }
            );
          }
          return setGroupEnabled(context, group, false);
        }
      },
      {
        name: "group.toggle",
        summary: "Toggle all panels in a group based on current enabled state.",
        usage: "group.toggle <groupId>",
        validate({ args, commandName }) {
          return requireAtLeastArgs(1, { args, commandName });
        },
        handler(context, args) {
          const groupId = sanitizeText(args?.[0]);
          const group = groupRegistry.getGroup(groupId);
          if (!group) {
            return createResult(
              "failed",
              "Group Toggle",
              [`Group ${groupId || "n/a"} was not found.`],
              "GROUP_NOT_FOUND",
              {
                groupId
              }
            );
          }

          const runtimeContext = getRuntimeAndRegistry(context);
          if (runtimeContext.status !== "ready") {
            return createResult(
              "failed",
              "Group",
              [runtimeContext.message],
              runtimeContext.code
            );
          }

          const panelRegistry = runtimeContext.panelRegistry;
          const panelMap = new Map();
          const allPanels = panelRegistry.getOrderedPanels(true);
          (Array.isArray(allPanels) ? allPanels : []).forEach((panel) => {
            const panelId = sanitizeText(panel?.id);
            if (panelId) {
              panelMap.set(panelId, panel);
            }
          });

          const hasEnabledPanel = group.panelIds.some((panelId) => {
            const panel = panelMap.get(panelId);
            return Boolean(panel?.enabled);
          });

          return setGroupEnabled(context, group, !hasEnabledPanel);
        }
      }
    ]
  };
}
