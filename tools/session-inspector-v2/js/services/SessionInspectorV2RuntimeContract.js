const SESSION_INSPECTOR_V2_RUNTIME_CONTRACT = Object.freeze({
  communicatesWithTools: false,
  storageAccess: "read/delete",
  toolId: "session-inspector-v2",
  usesRepoSelection: false,
  writesStorage: true
});

export function sessionInspectorV2RuntimeContract() {
  return { ...SESSION_INSPECTOR_V2_RUNTIME_CONTRACT };
}
