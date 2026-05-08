const SESSION_INSPECTOR_RUNTIME_CONTRACT = Object.freeze({
  communicatesWithTools: false,
  storageAccess: "read-only",
  toolId: "session-inspector",
  usesRepoSelection: false,
  writesStorage: false
});

export function sessionInspectorRuntimeContract() {
  return { ...SESSION_INSPECTOR_RUNTIME_CONTRACT };
}
