const STORAGE_INSPECTOR_V2_RUNTIME_CONTRACT = Object.freeze({
  communicatesWithTools: false,
  storageAccess: "read/delete",
  toolId: "storage-inspector-v2",
  usesRepoSelection: false,
  writesStorage: true
});

export function storageInspectorV2RuntimeContract() {
  return { ...STORAGE_INSPECTOR_V2_RUNTIME_CONTRACT };
}
