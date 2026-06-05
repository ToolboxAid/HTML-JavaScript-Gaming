export const TOOLS_PROGRESS_STATUS_MODEL = Object.freeze([
  "Ready",
  "Wireframe",
  "Under Construction",
  "Planned",
  "Hidden",
  "Deprecated"
]);

export const TOOLS_PROGRESS_METADATA_FIELDS = Object.freeze([
  "status",
  "readiness",
  "visibility",
  "requiredForTestable",
  "requiredForPublish"
]);

export const TOOLS_PROGRESS_REQUIRED_METADATA_FIELDS = Object.freeze([
  "adminOnly",
  "deferred",
  "hidden",
  "progressChecklist",
  "requiredForPlayable",
  "requiredForPublish",
  "requiredForTestable",
  "requires",
  "status",
  "visibleInToolsList"
]);

const READINESS_BY_STATUS = Object.freeze({
  Ready: "Yes",
  Wireframe: "No",
  "Under Construction": "No",
  Planned: "No",
  Hidden: "No",
  Deprecated: "No"
});

export const TOOLS_PROGRESS_STATUS_METADATA = Object.freeze({
  "ai-assistant": {
    "requiredForPlayable": false,
    "requiredForTestable": false,
    "requiredForPublish": false,
    "requires": [],
    "status": "Wireframe",
    "progressChecklist": [
      "Review readiness",
      "Static wireframe text only"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true
  },
  "project-workspace": {
    "requiredForPlayable": true,
    "requiredForTestable": true,
    "requiredForPublish": true,
    "requires": [],
    "status": "Ready",
    "progressChecklist": [
      "Review readiness",
      "Static wireframe text only"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true
  },
  "game-design": {
    "requiredForPlayable": true,
    "requiredForTestable": true,
    "requiredForPublish": true,
    "requires": [
      "project-workspace"
    ],
    "status": "Ready",
    "progressChecklist": [
      "Review readiness",
      "Static wireframe text only"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true
  },
  "game-configuration": {
    "requiredForPlayable": true,
    "requiredForTestable": true,
    "requiredForPublish": true,
    "requires": [
      "game-design"
    ],
    "status": "Ready",
    "progressChecklist": [
      "Review readiness",
      "Static wireframe text only"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true
  },
  "assets": {
    "requiredForPlayable": true,
    "requiredForTestable": true,
    "requiredForPublish": true,
    "requires": [],
    "status": "Under Construction",
    "progressChecklist": [
      "Review readiness",
      "Static wireframe text only"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true
  },
  "colors": {
    "requiredForPlayable": true,
    "requiredForTestable": true,
    "requiredForPublish": true,
    "requires": [],
    "status": "Planned",
    "progressChecklist": [
      "Review readiness",
      "Static wireframe text only"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true
  },
  "fonts": {
    "requiredForPlayable": false,
    "requiredForTestable": false,
    "requiredForPublish": true,
    "requires": [],
    "status": "Wireframe",
    "progressChecklist": [
      "Review readiness",
      "Static wireframe text only"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true
  },
  "sprites": {
    "requiredForPlayable": true,
    "requiredForTestable": true,
    "requiredForPublish": true,
    "requires": [],
    "status": "Wireframe",
    "progressChecklist": [
      "Review readiness",
      "Static wireframe text only"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true
  },
  "characters": {
    "requiredForPlayable": true,
    "requiredForTestable": true,
    "requiredForPublish": true,
    "requires": [],
    "status": "Wireframe",
    "progressChecklist": [
      "Review readiness",
      "Static wireframe text only"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true
  },
  "objects": {
    "requiredForPlayable": true,
    "requiredForTestable": true,
    "requiredForPublish": true,
    "requires": [],
    "status": "Wireframe",
    "progressChecklist": [
      "Review readiness",
      "Static wireframe text only"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true
  },
  "worlds": {
    "requiredForPlayable": true,
    "requiredForTestable": true,
    "requiredForPublish": true,
    "requires": [],
    "status": "Under Construction",
    "progressChecklist": [
      "Review readiness",
      "Static wireframe text only"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true
  },
  "animations": {
    "requiredForPlayable": true,
    "requiredForTestable": true,
    "requiredForPublish": false,
    "requires": [],
    "status": "Under Construction",
    "progressChecklist": [
      "Review readiness",
      "Static wireframe text only"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true
  },
  "audio": {
    "requiredForPlayable": false,
    "requiredForTestable": false,
    "requiredForPublish": false,
    "requires": [],
    "status": "Wireframe",
    "progressChecklist": [
      "Review readiness",
      "Static wireframe text only"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true
  },
  "music": {
    "requiredForPlayable": false,
    "requiredForTestable": false,
    "requiredForPublish": false,
    "requires": [],
    "status": "Wireframe",
    "progressChecklist": [
      "Review readiness",
      "Static wireframe text only"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true
  },
  "voices": {
    "requiredForPlayable": false,
    "requiredForTestable": false,
    "requiredForPublish": false,
    "requires": [],
    "status": "Wireframe",
    "progressChecklist": [
      "Review readiness",
      "Static wireframe text only"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true
  },
  "videos": {
    "requiredForPlayable": false,
    "requiredForTestable": false,
    "requiredForPublish": false,
    "requires": [],
    "status": "Wireframe",
    "progressChecklist": [
      "Review readiness",
      "Static wireframe text only"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true
  },
  "build-game": {
    "requiredForPlayable": true,
    "requiredForTestable": true,
    "requiredForPublish": true,
    "requires": [
      "game-configuration"
    ],
    "status": "Planned",
    "progressChecklist": [
      "Review readiness",
      "Static wireframe text only"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true
  },
  "game-testing": {
    "requiredForPlayable": true,
    "requiredForTestable": true,
    "requiredForPublish": true,
    "requires": [
      "build-game"
    ],
    "status": "Planned",
    "progressChecklist": [
      "Review readiness",
      "Static wireframe text only"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true
  },
  "controls": {
    "requiredForPlayable": true,
    "requiredForTestable": true,
    "requiredForPublish": true,
    "requires": [],
    "status": "Wireframe",
    "progressChecklist": [
      "Review readiness",
      "Static wireframe text only"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true
  },
  "hitboxes": {
    "requiredForPlayable": true,
    "requiredForTestable": true,
    "requiredForPublish": true,
    "requires": [],
    "status": "Wireframe",
    "progressChecklist": [
      "Review readiness",
      "Static wireframe text only"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true
  },
  "saved-data": {
    "requiredForPlayable": false,
    "requiredForTestable": false,
    "requiredForPublish": false,
    "requires": [],
    "status": "Planned",
    "progressChecklist": [
      "Review readiness",
      "Static wireframe text only"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true
  },
  "debug": {
    "requiredForPlayable": true,
    "requiredForTestable": true,
    "requiredForPublish": true,
    "requires": [],
    "status": "Wireframe",
    "progressChecklist": [
      "Review readiness",
      "Static wireframe text only"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true
  },
  "performance": {
    "requiredForPlayable": true,
    "requiredForTestable": true,
    "requiredForPublish": true,
    "requires": [],
    "status": "Wireframe",
    "progressChecklist": [
      "Review readiness",
      "Static wireframe text only"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true
  },
  "events": {
    "requiredForPlayable": true,
    "requiredForTestable": true,
    "requiredForPublish": true,
    "requires": [],
    "status": "Wireframe",
    "progressChecklist": [
      "Review readiness",
      "Static wireframe text only"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true
  },
  "publish": {
    "requiredForPlayable": false,
    "requiredForTestable": false,
    "requiredForPublish": true,
    "requires": [
      "game-testing"
    ],
    "status": "Planned",
    "progressChecklist": [
      "Review readiness",
      "Static wireframe text only"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true
  },
  "marketplace": {
    "requiredForPlayable": false,
    "requiredForTestable": false,
    "requiredForPublish": false,
    "requires": [
      "publish"
    ],
    "status": "Wireframe",
    "progressChecklist": [
      "Review readiness",
      "Static wireframe text only"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true
  },
  "community": {
    "requiredForPlayable": false,
    "requiredForTestable": false,
    "requiredForPublish": false,
    "requires": [
      "publish"
    ],
    "status": "Wireframe",
    "progressChecklist": [
      "Review readiness",
      "Static wireframe text only"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true
  },
  "languages": {
    "requiredForPlayable": false,
    "requiredForTestable": false,
    "requiredForPublish": false,
    "requires": [
      "publish"
    ],
    "status": "Wireframe",
    "progressChecklist": [
      "Review readiness",
      "Static wireframe text only"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true
  },
  "achievements": {
    "requiredForPlayable": false,
    "requiredForTestable": false,
    "requiredForPublish": false,
    "requires": [],
    "status": "Wireframe",
    "progressChecklist": [
      "Review readiness",
      "Static wireframe text only"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true
  },
  "ratings": {
    "requiredForPlayable": false,
    "requiredForTestable": false,
    "requiredForPublish": false,
    "requires": [],
    "status": "Wireframe",
    "progressChecklist": [
      "Review readiness",
      "Static wireframe text only"
    ],
    "deferred": false,
    "hidden": false,
    "adminOnly": false,
    "visibleInToolsList": true
  },
  "cloud": {
    "requiredForPlayable": false,
    "requiredForTestable": false,
    "requiredForPublish": false,
    "requires": [
      "publish"
    ],
    "status": "Hidden",
    "progressChecklist": [
      "Hidden planned capability",
      "Static wireframe text only"
    ],
    "deferred": true,
    "hidden": true,
    "adminOnly": false,
    "visibleInToolsList": true
  },
  "code": {
    "requiredForPlayable": false,
    "requiredForTestable": false,
    "requiredForPublish": false,
    "requires": [],
    "status": "Hidden",
    "progressChecklist": [
      "Hidden planned capability",
      "Static wireframe text only"
    ],
    "deferred": true,
    "hidden": true,
    "adminOnly": false,
    "visibleInToolsList": true
  },
  "midi": {
    "requiredForPlayable": false,
    "requiredForTestable": false,
    "requiredForPublish": false,
    "requires": [],
    "status": "Hidden",
    "progressChecklist": [
      "Hidden planned capability",
      "Static wireframe text only"
    ],
    "deferred": true,
    "hidden": true,
    "adminOnly": false,
    "visibleInToolsList": true
  },
  "particles": {
    "requiredForPlayable": false,
    "requiredForTestable": false,
    "requiredForPublish": false,
    "requires": [],
    "status": "Hidden",
    "progressChecklist": [
      "Hidden planned capability",
      "Static wireframe text only"
    ],
    "deferred": true,
    "hidden": true,
    "adminOnly": false,
    "visibleInToolsList": true
  },
  "audio-effects": {
    "requiredForPlayable": false,
    "requiredForTestable": false,
    "requiredForPublish": false,
    "requires": [],
    "status": "Hidden",
    "progressChecklist": [
      "Hidden planned capability",
      "Static wireframe text only"
    ],
    "deferred": true,
    "hidden": true,
    "adminOnly": false,
    "visibleInToolsList": true
  },
  "speech-to-text": {
    "requiredForPlayable": false,
    "requiredForTestable": false,
    "requiredForPublish": false,
    "requires": [],
    "status": "Hidden",
    "progressChecklist": [
      "Hidden planned capability",
      "Static wireframe text only"
    ],
    "deferred": true,
    "hidden": true,
    "adminOnly": false,
    "visibleInToolsList": true
  },
  "text-to-speech": {
    "requiredForPlayable": false,
    "requiredForTestable": false,
    "requiredForPublish": false,
    "requires": [],
    "status": "Hidden",
    "progressChecklist": [
      "Hidden planned capability",
      "Static wireframe text only"
    ],
    "deferred": true,
    "hidden": true,
    "adminOnly": false,
    "visibleInToolsList": true
  },
  "users": {
    "requiredForPlayable": false,
    "requiredForTestable": false,
    "requiredForPublish": false,
    "requires": [],
    "status": "Planned",
    "progressChecklist": [
      "Admin-only planned capability",
      "Static wireframe text only"
    ],
    "deferred": true,
    "hidden": true,
    "adminOnly": true,
    "visibleInToolsList": false
  },
  "environments": {
    "requiredForPlayable": false,
    "requiredForTestable": false,
    "requiredForPublish": false,
    "requires": [],
    "status": "Planned",
    "progressChecklist": [
      "Admin-only planned capability",
      "Static wireframe text only"
    ],
    "deferred": true,
    "hidden": true,
    "adminOnly": true,
    "visibleInToolsList": false
  },
  "game-migration": {
    "requiredForPlayable": false,
    "requiredForTestable": false,
    "requiredForPublish": false,
    "requires": [],
    "status": "Planned",
    "progressChecklist": [
      "Admin-only planned capability",
      "Static wireframe text only"
    ],
    "deferred": true,
    "hidden": true,
    "adminOnly": true,
    "visibleInToolsList": false
  },
  "platform-settings": {
    "requiredForPlayable": false,
    "requiredForTestable": false,
    "requiredForPublish": false,
    "requires": [],
    "status": "Planned",
    "progressChecklist": [
      "Admin-only planned capability",
      "Static wireframe text only"
    ],
    "deferred": true,
    "hidden": true,
    "adminOnly": true,
    "visibleInToolsList": false
  }
});

function toolIdFor(toolOrId) {
  if (typeof toolOrId === "string") {
    return toolOrId.trim();
  }
  return typeof toolOrId?.id === "string" ? toolOrId.id.trim() : "";
}

function cloneMetadata(metadata) {
  return {
    ...metadata,
    progressChecklist: Array.isArray(metadata.progressChecklist) ? [...metadata.progressChecklist] : [],
    requires: Array.isArray(metadata.requires) ? [...metadata.requires] : [],
    visibility: {
      adminOnly: metadata.adminOnly === true,
      deferred: metadata.deferred === true,
      hidden: metadata.hidden === true,
      visibleInToolsList: metadata.visibleInToolsList === true
    }
  };
}

export function getToolProgressMetadata(toolOrId) {
  const toolId = toolIdFor(toolOrId);
  const metadata = toolId ? TOOLS_PROGRESS_STATUS_METADATA[toolId] : null;
  return metadata ? cloneMetadata(metadata) : null;
}

export function getMissingToolProgressMetadataFields(toolOrId) {
  const metadata = getToolProgressMetadata(toolOrId);
  if (!metadata) {
    return [...TOOLS_PROGRESS_REQUIRED_METADATA_FIELDS];
  }

  return TOOLS_PROGRESS_REQUIRED_METADATA_FIELDS.filter((field) => {
    if (field === "progressChecklist" || field === "requires") {
      return !Array.isArray(metadata[field]);
    }
    if (field === "status") {
      return !TOOLS_PROGRESS_STATUS_MODEL.includes(metadata.status);
    }
    return typeof metadata[field] !== "boolean";
  });
}

export function getToolProgressReadiness(status) {
  return READINESS_BY_STATUS[status] || "No";
}

export function applyToolsProgressMetadata(tool) {
  const metadata = getToolProgressMetadata(tool);
  const missingFields = getMissingToolProgressMetadataFields(tool);
  if (!metadata) {
    return {
      ...tool,
      adminOnly: true,
      deferred: true,
      hidden: true,
      missingStatusFields: missingFields,
      missingStatusMetadata: true,
      progressChecklist: [],
      readiness: "No",
      requiredForPlayable: false,
      requiredForPublish: false,
      requiredForTestable: false,
      requires: [],
      status: "Missing Metadata",
      visibility: {
        adminOnly: true,
        deferred: true,
        hidden: true,
        visibleInToolsList: false
      },
      visibleInToolsList: false
    };
  }

  return {
    ...tool,
    ...metadata,
    missingStatusFields: missingFields,
    missingStatusMetadata: missingFields.length > 0,
    readiness: getToolProgressReadiness(metadata.status)
  };
}

export function getToolsProgressSource(tools) {
  return tools.map((tool) => applyToolsProgressMetadata(tool));
}

export function getVisibleToolsProgressSource(tools) {
  return getToolsProgressSource(tools).filter((tool) => tool.visibleInToolsList === true);
}

export function toolProgressMetadataDiagnostic(tool) {
  if (!tool?.missingStatusMetadata) {
    return "";
  }

  const fields = Array.isArray(tool.missingStatusFields) && tool.missingStatusFields.length
    ? tool.missingStatusFields.join(", ")
    : "status metadata";
  return `Missing Admin Tools Progress metadata: ${fields}.`;
}
