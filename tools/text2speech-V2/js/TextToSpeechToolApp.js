import {
  TEXT_TO_SPEECH_AGE_FILTER_OPTIONS,
  TEXT_TO_SPEECH_CHARACTER_PRESET_DEFAULTS,
  TEXT_TO_SPEECH_CHARACTER_PRESET_OPTIONS,
  TEXT_TO_SPEECH_DEFAULTS,
  TEXT_TO_SPEECH_DISPLAY_NAME,
  TEXT_TO_SPEECH_GENDER_FILTER_OPTIONS,
  TEXT_TO_SPEECH_LANGUAGE_OPTIONS,
  TEXT_TO_SPEECH_QUEUE_MODE_OPTIONS,
  TEXT_TO_SPEECH_RANGE_DEFAULTS,
  TEXT_TO_SPEECH_SCHEMA_ID,
  TEXT_TO_SPEECH_SSML_LIKE_PRESET_DEFAULTS,
  TEXT_TO_SPEECH_SSML_LIKE_PRESET_OPTIONS,
  TEXT_TO_SPEECH_VOICE_AGE_PRESET_DEFAULTS
} from "../../../src/engine/audio/TextToSpeechDefaults.js";

const WORKSPACE_TOOL_STATE_KEY = "workspace.tools.text2speach-V2";
const TEXT_TO_SPEECH_SCHEMA_URL = `/${TEXT_TO_SPEECH_SCHEMA_ID}`;
const TEXT_TO_SPEECH_URL_SOURCE_PARAM = "samplePresetPath";

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function slugFromName(name) {
  const slug = String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "speech-item";
}

function schemaProperties(schema) {
  return isPlainObject(schema?.properties) ? schema.properties : {};
}

function missingRequiredFields(value, schema) {
  return (Array.isArray(schema?.required) ? schema.required : [])
    .filter((key) => !Object.prototype.hasOwnProperty.call(value, key));
}

function resolvePointer(schema, pointer) {
  if (!pointer || pointer === "#") {
    return schema;
  }
  if (!pointer.startsWith("#/")) {
    return null;
  }
  return pointer
    .slice(2)
    .split("/")
    .map((segment) => segment.replace(/~1/g, "/").replace(/~0/g, "~"))
    .reduce((node, key) => (node && typeof node === "object" ? node[key] : undefined), schema) || null;
}

function typeMatches(value, expectedType) {
  if (expectedType === "object") {
    return isPlainObject(value);
  }
  if (expectedType === "array") {
    return Array.isArray(value);
  }
  if (expectedType === "integer") {
    return Number.isInteger(value);
  }
  if (expectedType === "number") {
    return typeof value === "number" && Number.isFinite(value);
  }
  if (expectedType === "string") {
    return typeof value === "string";
  }
  if (expectedType === "boolean") {
    return typeof value === "boolean";
  }
  if (expectedType === "null") {
    return value === null;
  }
  return true;
}

function validateSchemaValue(value, schema, pointer, rootSchema = schema) {
  if (!isPlainObject(schema)) {
    return [];
  }
  if (typeof schema.$ref === "string") {
    const referencedSchema = resolvePointer(rootSchema, schema.$ref);
    return referencedSchema
      ? validateSchemaValue(value, referencedSchema, pointer, rootSchema)
      : [`${pointer}: unresolved schema reference ${schema.$ref}`];
  }

  const errors = [];
  const expectedTypes = Array.isArray(schema.type) ? schema.type : (schema.type ? [schema.type] : []);
  if (expectedTypes.length && !expectedTypes.some((type) => typeMatches(value, type))) {
    errors.push(`${pointer}: expected ${expectedTypes.join(" or ")}`);
    return errors;
  }
  if (Object.prototype.hasOwnProperty.call(schema, "const") && value !== schema.const) {
    errors.push(`${pointer}: expected ${JSON.stringify(schema.const)}`);
  }
  if (Array.isArray(schema.enum) && !schema.enum.includes(value)) {
    errors.push(`${pointer}: expected one of ${schema.enum.map((entry) => JSON.stringify(entry)).join(", ")}`);
  }
  if (typeof value === "string") {
    if (Number.isFinite(schema.minLength) && value.length < schema.minLength) {
      errors.push(`${pointer}: must be at least ${schema.minLength} characters`);
    }
    if (Number.isFinite(schema.maxLength) && value.length > schema.maxLength) {
      errors.push(`${pointer}: must be no more than ${schema.maxLength} characters`);
    }
    if (typeof schema.pattern === "string" && !(new RegExp(schema.pattern).test(value))) {
      errors.push(`${pointer}: must match ${schema.pattern}`);
    }
  }
  if ((typeof value === "number" || Number.isInteger(value)) && Number.isFinite(schema.minimum) && value < schema.minimum) {
    errors.push(`${pointer}: must be greater than or equal to ${schema.minimum}`);
  }
  if ((typeof value === "number" || Number.isInteger(value)) && Number.isFinite(schema.maximum) && value > schema.maximum) {
    errors.push(`${pointer}: must be less than or equal to ${schema.maximum}`);
  }
  if (Array.isArray(value)) {
    if (Number.isInteger(schema.minItems) && value.length < schema.minItems) {
      errors.push(`${pointer}: must contain at least ${schema.minItems} item${schema.minItems === 1 ? "" : "s"}`);
    }
    if (Number.isInteger(schema.maxItems) && value.length > schema.maxItems) {
      errors.push(`${pointer}: must contain no more than ${schema.maxItems} item${schema.maxItems === 1 ? "" : "s"}`);
    }
    if (isPlainObject(schema.items)) {
      value.forEach((item, index) => {
        errors.push(...validateSchemaValue(item, schema.items, `${pointer}[${index}]`, rootSchema));
      });
    }
  }
  if (isPlainObject(value)) {
    const properties = schemaProperties(schema);
    missingRequiredFields(value, schema).forEach((key) => {
      errors.push(`${pointer}.${key} is required`);
    });
    Object.entries(value).forEach(([key, childValue]) => {
      if (isPlainObject(properties[key])) {
        errors.push(...validateSchemaValue(childValue, properties[key], `${pointer}.${key}`, rootSchema));
      } else if (schema.additionalProperties === false) {
        errors.push(`${pointer}.${key} is not allowed`);
      }
    });
  }
  return errors;
}

export class TextToSpeechToolApp {
  constructor({
    actionNav,
    engine,
    outputSummary,
    queueControl,
    shell,
    speechOptions,
    statusLog,
    textInput,
    windowRef = window
  }) {
    this.actionNav = actionNav;
    this.engine = engine;
    this.outputSummary = outputSummary;
    this.queueControl = queueControl;
    this.shell = shell;
    this.speechOptions = speechOptions;
    this.statusLog = statusLog;
    this.textInput = textInput;
    this.window = windowRef;
    this.isApplyingQueueItem = false;
    this.payloadSchema = null;
  }

  async start() {
    this.shell.mount();
    this.speechOptions.populate({
      ageFilterOptions: TEXT_TO_SPEECH_AGE_FILTER_OPTIONS,
      characterPresetOptions: TEXT_TO_SPEECH_CHARACTER_PRESET_OPTIONS,
      characterPresetDefaults: TEXT_TO_SPEECH_CHARACTER_PRESET_DEFAULTS,
      defaults: TEXT_TO_SPEECH_DEFAULTS,
      genderFilterOptions: TEXT_TO_SPEECH_GENDER_FILTER_OPTIONS,
      languageOptions: TEXT_TO_SPEECH_LANGUAGE_OPTIONS,
      queueModeOptions: TEXT_TO_SPEECH_QUEUE_MODE_OPTIONS,
      rangeDefaults: TEXT_TO_SPEECH_RANGE_DEFAULTS,
      ssmlLikePresetDefaults: TEXT_TO_SPEECH_SSML_LIKE_PRESET_DEFAULTS,
      ssmlLikePresetOptions: TEXT_TO_SPEECH_SSML_LIKE_PRESET_OPTIONS,
      voiceAgePresetDefaults: TEXT_TO_SPEECH_VOICE_AGE_PRESET_DEFAULTS
    });
    this.actionNav.mount({
      onCopyJson: () => {
        void this.copyJson();
      },
      onExportJson: () => this.exportJson(),
      onImportJson: (file) => {
        void this.importJson(file);
      },
      onPause: () => this.pause(),
      onResume: () => this.resume(),
      onReturnToWorkspace: (url) => {
        this.window.location.href = url;
      },
      onSpeak: () => this.speak(),
      onStop: () => this.stop()
    });
    this.queueControl.mount({
      onAdd: () => this.addSpeechItem(),
      onChange: (item) => this.applyQueueItem(item, "queue-item-selected"),
      onDelete: () => this.deleteSpeechItem(),
      onDuplicate: () => this.duplicateSpeechItem(),
      onNameChange: (name) => this.updateSelectedItemName(name)
    });
    this.textInput.mount({
      onInput: () => {
        if (this.isApplyingQueueItem) {
          return;
        }
        this.syncSelectedItemFromControls("text-updated", ["text"]);
        this.refreshOutputSummary("text-updated");
      }
    });
    this.speechOptions.mount({
      onChange: ({ controlId } = {}) => {
        if (controlId === "gender" || controlId === "language") {
          this.refreshVoices(`${controlId}-changed`);
        }
        if (controlId === "age") {
          const options = this.speechOptions.value();
          this.statusLog.ok(`Voice Age shaping applied: ${this.speechOptions.selectedVoiceAgeLabel()}; rate=${options.rate}; pitch=${options.pitch}.`);
        } else if (controlId === "ssmlLikePreset") {
          const options = this.speechOptions.value();
          this.statusLog.ok(`SSML-like preset applied: ${options.ssmlLikePreset}; rate=${options.rate}; pitch=${options.pitch}; volume=${options.volume}.`);
        }
        this.syncSelectedItemFromControls("settings-updated", [controlId || "speechOptions"]);
        this.refreshOutputSummary("settings-updated");
      }
    });
    this.statusLog.mount();
    await this.loadQueue();
    this.refreshVoices();
    this.engine.onVoicesChanged(() => {
      this.refreshVoices("voiceschanged");
      this.refreshOutputSummary("voices-updated");
    });
    this.refreshOutputSummary("ready");
    this.refreshActionState();
    if (this.engine.isSupported()) {
      this.statusLog.ok(`${TEXT_TO_SPEECH_DISPLAY_NAME} ready. SpeechSynthesis is available.`);
    } else {
      this.statusLog.fail(`${TEXT_TO_SPEECH_DISPLAY_NAME} unavailable: SpeechSynthesis is not available in this browser.`);
    }
  }

  isWorkspaceLaunch() {
    const params = new URLSearchParams(this.window.location.search);
    return params.get("launch") === "workspace"
      && params.get("fromTool") === "workspace-manager-v2"
      && Boolean(params.get("hostContextId"));
  }

  hasWorkspaceLaunchIntent() {
    const params = new URLSearchParams(this.window.location.search);
    return params.get("launch") === "workspace" && params.get("fromTool") === "workspace-manager-v2";
  }

  async loadPayloadSchema() {
    if (this.payloadSchema) {
      return { ok: true, schema: this.payloadSchema };
    }
    if (typeof this.window.fetch !== "function") {
      return { ok: false, message: `${TEXT_TO_SPEECH_DISPLAY_NAME} schema validation failed: Fetch API is unavailable.` };
    }
    try {
      const response = await this.window.fetch(TEXT_TO_SPEECH_SCHEMA_URL, { cache: "no-store" });
      if (!response.ok) {
        return { ok: false, message: `${TEXT_TO_SPEECH_DISPLAY_NAME} schema validation failed: ${TEXT_TO_SPEECH_SCHEMA_URL} returned ${response.status}.` };
      }
      const schema = await response.json();
      if (!isPlainObject(schema)) {
        return { ok: false, message: `${TEXT_TO_SPEECH_DISPLAY_NAME} schema validation failed: ${TEXT_TO_SPEECH_SCHEMA_URL} did not return a schema object.` };
      }
      this.payloadSchema = schema;
      return { ok: true, schema };
    } catch (error) {
      return { ok: false, message: `${TEXT_TO_SPEECH_DISPLAY_NAME} schema validation failed: ${error.message}` };
    }
  }

  validatePayload(payload, sourcePath) {
    const errors = validateSchemaValue(payload, this.payloadSchema, "root", this.payloadSchema);
    return errors.length
      ? { ok: false, message: `${TEXT_TO_SPEECH_DISPLAY_NAME} payload from ${sourcePath} failed ${TEXT_TO_SPEECH_SCHEMA_ID} validation: ${errors.join(" | ")}` }
      : { ok: true };
  }

  async loadQueue() {
    const queueDataResult = await this.queueData();
    if (!queueDataResult.ok) {
      this.statusLog.fail(queueDataResult.message);
      this.clearRenderedQueue("load-failed");
      this.actionNav.setSpeakEnabled(false);
      return;
    }
    if (queueDataResult.empty) {
      this.clearRenderedQueue("empty");
      this.statusLog.ok(queueDataResult.message);
      return;
    }
    const schemaResult = await this.loadPayloadSchema();
    if (!schemaResult.ok) {
      this.statusLog.fail(schemaResult.message);
      this.clearRenderedQueue("load-failed");
      this.actionNav.setSpeakEnabled(false);
      return;
    }
    const schemaRef = String(queueDataResult.schemaRef || "");
    if (schemaRef && schemaRef !== TEXT_TO_SPEECH_SCHEMA_ID) {
      this.statusLog.fail(`${TEXT_TO_SPEECH_DISPLAY_NAME} payload from ${queueDataResult.sourcePath} uses ${schemaRef}; expected ${TEXT_TO_SPEECH_SCHEMA_ID}.`);
      this.clearRenderedQueue("load-failed");
      this.actionNav.setSpeakEnabled(false);
      return;
    }
    const payloadValidation = this.validatePayload(queueDataResult.payload, queueDataResult.sourcePath);
    if (!payloadValidation.ok) {
      this.statusLog.fail(payloadValidation.message);
      this.clearRenderedQueue("load-failed");
      this.actionNav.setSpeakEnabled(false);
      return;
    }
    this.queueControl.populate(queueDataResult.payload);
    this.applyQueueItem(this.queueControl.selectedItem() || queueDataResult.payload[0], "queue-loaded");
    this.statusLog.ok(`Loaded ${TEXT_TO_SPEECH_DISPLAY_NAME} payload source: ${queueDataResult.sourcePath}.`);
    if (queueDataResult.sourceKind === "url-json") {
      this.statusLog.ok(`Loaded preset for ${TEXT_TO_SPEECH_DISPLAY_NAME}: ${queueDataResult.sourcePath}.`);
    }
    this.statusLog.ok(`${TEXT_TO_SPEECH_DISPLAY_NAME} schema validation result: ${TEXT_TO_SPEECH_SCHEMA_ID} valid; queue=${queueDataResult.payload.length}.`);
    this.statusLog.ok(`${TEXT_TO_SPEECH_DISPLAY_NAME} dirty state: ${queueDataResult.dirtyState}.`);
    this.statusLog.ok(`Loaded ${queueDataResult.payload.length} schema-complete ${TEXT_TO_SPEECH_DISPLAY_NAME} queue items.`);
  }

  clearRenderedQueue(status) {
    this.queueControl.populate([]);
    this.textInput.setText("", { emit: false });
    this.refreshOutputSummary(status);
  }

  urlPayloadSourcePath() {
    const params = new URLSearchParams(this.window.location.search);
    return String(params.get(TEXT_TO_SPEECH_URL_SOURCE_PARAM) || "").trim();
  }

  async queueData() {
    if (this.hasWorkspaceLaunchIntent() && !this.isWorkspaceLaunch()) {
      return {
        ok: false,
        message: `${TEXT_TO_SPEECH_DISPLAY_NAME} workspace launch requires hostContextId before loading workspace toolState.`
      };
    }
    if (!this.isWorkspaceLaunch()) {
      const samplePresetPath = this.urlPayloadSourcePath();
      if (!samplePresetPath) {
        return {
          empty: true,
          ok: true,
          message: `${TEXT_TO_SPEECH_DISPLAY_NAME} empty launch: no ${TEXT_TO_SPEECH_URL_SOURCE_PARAM} URL JSON source, workspace payload, or imported JSON is loaded. Use Import JSON or open a sample JSON source to load named speech items.`
        };
      }
      return this.queueDataFromUrlSource(samplePresetPath);
    }
    const rawToolState = this.window.sessionStorage.getItem(WORKSPACE_TOOL_STATE_KEY);
    if (!rawToolState) {
      return { ok: false, message: `Workspace launch missing ${WORKSPACE_TOOL_STATE_KEY}; queue cannot render.` };
    }
    try {
      const toolState = JSON.parse(rawToolState);
      if (!isPlainObject(toolState)) {
        return { ok: false, message: `${WORKSPACE_TOOL_STATE_KEY} must contain the normalized workspace toolState object before render.` };
      }
      if (!Object.prototype.hasOwnProperty.call(toolState, "data") || toolState.data === null) {
        return {
          empty: true,
          ok: true,
          message: `${TEXT_TO_SPEECH_DISPLAY_NAME} empty workspace launch: no workspace payload is loaded from ${WORKSPACE_TOOL_STATE_KEY}. Use Import JSON in standalone mode or add Text to Speech V2 named speech items before saving.`
        };
      }
      return {
        dirtyState: `isDirty=${toolState.dirty?.isDirty === true}; reason=${toolState.dirty?.reason || "clean"}`,
        ok: true,
        payload: toolState.data,
        schemaRef: toolState.schema?.schemaRef || "",
        sourcePath: toolState.workspace?.gameManifestPath || toolState.workspace?.boundManifestPath || WORKSPACE_TOOL_STATE_KEY
      };
    } catch (error) {
      return { ok: false, message: `${WORKSPACE_TOOL_STATE_KEY} is invalid JSON: ${error.message}` };
    }
  }

  async queueDataFromUrlSource(samplePresetPath) {
    if (typeof this.window.fetch !== "function") {
      return { ok: false, message: `${TEXT_TO_SPEECH_DISPLAY_NAME} URL JSON source failed: Fetch API is unavailable.` };
    }
    try {
      const response = await this.window.fetch(samplePresetPath, { cache: "no-store" });
      if (!response.ok) {
        return { ok: false, message: `${TEXT_TO_SPEECH_DISPLAY_NAME} URL JSON source ${samplePresetPath} failed: ${response.status}.` };
      }
      return {
        dirtyState: `urlSource=${samplePresetPath}; isDirty=false`,
        ok: true,
        payload: await response.json(),
        schemaRef: TEXT_TO_SPEECH_SCHEMA_ID,
        sourceKind: "url-json",
        sourcePath: samplePresetPath
      };
    } catch (error) {
      return { ok: false, message: `${TEXT_TO_SPEECH_DISPLAY_NAME} URL JSON source ${samplePresetPath} failed: ${error.message}` };
    }
  }

  uniqueItemName(baseName) {
    const existingNames = new Set(this.queueControl.selectedQueue().map((item) => item.name));
    if (!existingNames.has(baseName)) {
      return baseName;
    }
    for (let index = 2; index < 1000; index += 1) {
      const candidate = `${baseName} ${index}`;
      if (!existingNames.has(candidate)) {
        return candidate;
      }
    }
    return `${baseName} ${Date.now().toString(36)}`;
  }

  uniqueItemId(baseName) {
    const existingIds = new Set(this.queueControl.selectedQueue().map((item) => item.id));
    const baseId = slugFromName(baseName);
    if (!existingIds.has(baseId)) {
      return baseId;
    }
    for (let index = 2; index < 1000; index += 1) {
      const candidate = `${baseId}-${index}`;
      if (!existingIds.has(candidate)) {
        return candidate;
      }
    }
    return `${baseId}-${Date.now().toString(36)}`;
  }

  speechItemFromControls({ id, name, text = this.textInput.text() } = {}) {
    const itemName = String(name || "").trim() || this.uniqueItemName("New speech item");
    return {
      id: id || this.uniqueItemId(itemName),
      name: itemName,
      text,
      ...this.speechOptions.value()
    };
  }

  selectedItemFromControls() {
    const selectedItem = this.queueControl.selectedItem();
    if (!selectedItem) {
      return null;
    }
    return this.speechItemFromControls({
      id: selectedItem.id,
      name: this.queueControl.itemName() || selectedItem.name
    });
  }

  syncSelectedItemFromControls(reason, changedKeys) {
    const item = this.selectedItemFromControls();
    if (!item) {
      return;
    }
    this.queueControl.replaceSelectedItem(item);
    this.markWorkspaceDirty(reason, changedKeys);
  }

  markWorkspaceDirty(reason, changedKeys) {
    if (!this.isWorkspaceLaunch()) {
      return;
    }
    const rawToolState = this.window.sessionStorage.getItem(WORKSPACE_TOOL_STATE_KEY);
    if (!rawToolState) {
      this.statusLog.fail(`Cannot mark ${TEXT_TO_SPEECH_DISPLAY_NAME} dirty: missing ${WORKSPACE_TOOL_STATE_KEY}.`);
      return;
    }
    try {
      const toolState = JSON.parse(rawToolState);
      if (!isPlainObject(toolState)) {
        this.statusLog.fail(`Cannot mark ${TEXT_TO_SPEECH_DISPLAY_NAME} dirty: ${WORKSPACE_TOOL_STATE_KEY} is not an object.`);
        return;
      }
      const nextData = this.queueControl.selectedQueue();
      if (this.payloadSchema) {
        const validation = this.validatePayload(nextData, toolState.workspace?.gameManifestPath || WORKSPACE_TOOL_STATE_KEY);
        if (!validation.ok) {
          this.statusLog.fail(`Cannot mark ${TEXT_TO_SPEECH_DISPLAY_NAME} dirty: ${validation.message}`);
          return;
        }
      }
      this.window.sessionStorage.setItem(WORKSPACE_TOOL_STATE_KEY, JSON.stringify({
        ...toolState,
        data: nextData,
        dirty: {
          isDirty: true,
          reason,
          changedAt: new Date().toISOString(),
          changedKeys
        }
      }));
      this.statusLog.ok(`${TEXT_TO_SPEECH_DISPLAY_NAME} dirty state: true; reason=${reason}; changedKeys=${changedKeys.join(", ")}; queue=${nextData.length}.`);
      this.statusLog.ok(`${TEXT_TO_SPEECH_DISPLAY_NAME} manifest write-back target: ${toolState.workspace?.gameManifestPath || "(missing manifest path)"}.`);
    } catch (error) {
      this.statusLog.fail(`Cannot mark ${TEXT_TO_SPEECH_DISPLAY_NAME} dirty: ${error.message}`);
    }
  }

  async ensurePayloadSchemaForAction(actionLabel) {
    const schemaResult = await this.loadPayloadSchema();
    if (!schemaResult.ok) {
      this.statusLog.fail(`${actionLabel} blocked: ${schemaResult.message}`);
      return false;
    }
    return true;
  }

  validateCurrentPayloadForAction(actionLabel) {
    const payload = this.queueControl.selectedQueue();
    const payloadValidation = this.validatePayload(payload, `${TEXT_TO_SPEECH_DISPLAY_NAME} current UI payload`);
    if (!payloadValidation.ok) {
      this.statusLog.fail(`${actionLabel} blocked: ${payloadValidation.message}`);
      return { ok: false };
    }
    return { ok: true, payload };
  }

  async importJson(file) {
    if (this.isWorkspaceLaunch()) {
      this.statusLog.fail(`${TEXT_TO_SPEECH_DISPLAY_NAME} Import JSON is only available during standalone launch.`);
      return;
    }
    if (!file) {
      this.statusLog.fail(`${TEXT_TO_SPEECH_DISPLAY_NAME} Import JSON blocked: choose a JSON file first.`);
      return;
    }
    if (!(await this.ensurePayloadSchemaForAction("Import JSON"))) {
      return;
    }

    let payload;
    try {
      payload = JSON.parse(await file.text());
    } catch (error) {
      this.statusLog.fail(`${TEXT_TO_SPEECH_DISPLAY_NAME} Import JSON failed: ${file.name || "selected file"} is invalid JSON: ${error.message}`);
      return;
    }
    const sourcePath = file.name || "selected JSON file";
    const payloadValidation = this.validatePayload(payload, sourcePath);
    if (!payloadValidation.ok) {
      this.statusLog.fail(`Import JSON blocked: ${payloadValidation.message}`);
      return;
    }
    this.queueControl.populate(payload);
    this.applyQueueItem(this.queueControl.selectedItem() || payload[0], "json-imported");
    this.refreshVoices("json-imported");
    this.refreshOutputSummary("json-imported");
    this.statusLog.ok(`Imported ${payload.length} ${TEXT_TO_SPEECH_DISPLAY_NAME} item${payload.length === 1 ? "" : "s"} from ${sourcePath}; schema validation result: ${TEXT_TO_SPEECH_SCHEMA_ID} valid.`);
  }

  async copyJson() {
    if (this.isWorkspaceLaunch()) {
      this.statusLog.fail(`${TEXT_TO_SPEECH_DISPLAY_NAME} Copy JSON is only available during standalone launch.`);
      return;
    }
    if (!(await this.ensurePayloadSchemaForAction("Copy JSON"))) {
      return;
    }
    const validation = this.validateCurrentPayloadForAction("Copy JSON");
    if (!validation.ok) {
      return;
    }
    if (!this.window.navigator?.clipboard || typeof this.window.navigator.clipboard.writeText !== "function") {
      this.statusLog.fail("Copy JSON failed: Clipboard API is unavailable.");
      return;
    }
    const json = JSON.stringify(validation.payload, null, 2);
    try {
      await this.window.navigator.clipboard.writeText(json);
      this.statusLog.ok(`Copied ${TEXT_TO_SPEECH_DISPLAY_NAME} JSON root array to clipboard (${validation.payload.length} item${validation.payload.length === 1 ? "" : "s"}).`);
    } catch (error) {
      this.statusLog.fail(`Copy JSON failed: ${error.message}`);
    }
  }

  async exportJson() {
    if (this.isWorkspaceLaunch()) {
      this.statusLog.fail(`${TEXT_TO_SPEECH_DISPLAY_NAME} Export JSON is only available during standalone launch.`);
      return;
    }
    if (!(await this.ensurePayloadSchemaForAction("Export JSON"))) {
      return;
    }
    const validation = this.validateCurrentPayloadForAction("Export JSON");
    if (!validation.ok) {
      return;
    }
    const json = JSON.stringify(validation.payload, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = this.window.document.createElement("a");
    link.href = url;
    link.download = "text-to-speech-v2.json";
    this.window.document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    this.statusLog.ok(`Exported ${TEXT_TO_SPEECH_DISPLAY_NAME} JSON root array (${validation.payload.length} item${validation.payload.length === 1 ? "" : "s"}).`);
  }

  addSpeechItem() {
    const requestedName = this.queueControl.itemName();
    if (!requestedName) {
      this.statusLog.fail(`${TEXT_TO_SPEECH_DISPLAY_NAME} Add blocked: Name is required before creating a named speech item.`);
      return;
    }
    const name = this.uniqueItemName(requestedName);
    const item = this.speechItemFromControls({
      id: this.uniqueItemId(name),
      name,
      text: this.textInput.text() || "New speech line."
    });
    this.queueControl.addItem(item);
    this.applyQueueItem(item, "queue-item-added");
    this.markWorkspaceDirty("speech-item-added", [`queue.${item.id}`]);
    this.statusLog.ok(`Added speech item: ${item.name}.`);
  }

  updateSelectedItemName(name) {
    if (this.isApplyingQueueItem) {
      return;
    }
    const selectedItem = this.queueControl.selectedItem();
    if (!selectedItem) {
      this.statusLog.fail(`${TEXT_TO_SPEECH_DISPLAY_NAME} name update failed: no named speech item is selected.`);
      return;
    }
    const itemName = String(name || "").trim();
    if (!itemName) {
      this.statusLog.fail(`${TEXT_TO_SPEECH_DISPLAY_NAME} name update blocked: Name is required and the selected item remains ${selectedItem.name}.`);
      return;
    }
    const item = {
      ...selectedItem,
      name: itemName
    };
    this.queueControl.replaceSelectedItem(item);
    this.markWorkspaceDirty("speech-item-renamed", [`queue.${item.id}.name`]);
    this.refreshOutputSummary("speech-item-renamed");
  }

  duplicateSpeechItem() {
    const selectedItem = this.selectedItemFromControls();
    if (!selectedItem) {
      this.statusLog.fail(`${TEXT_TO_SPEECH_DISPLAY_NAME} duplicate failed: no named sentence is selected.`);
      return;
    }
    this.queueControl.replaceSelectedItem(selectedItem);
    const name = this.uniqueItemName(`${selectedItem.name} copy`);
    const item = {
      ...clone(selectedItem),
      id: this.uniqueItemId(name),
      name
    };
    this.queueControl.addItem(item);
    this.applyQueueItem(item, "queue-item-duplicated");
    this.markWorkspaceDirty("speech-item-duplicated", [`queue.${item.id}`]);
    this.statusLog.ok(`Duplicated speech item: ${item.name}.`);
  }

  deleteSpeechItem() {
    const selectedItem = this.queueControl.selectedItem();
    if (!selectedItem) {
      this.statusLog.fail(`${TEXT_TO_SPEECH_DISPLAY_NAME} delete failed: no named sentence is selected.`);
      return;
    }
    const replacementItem = this.queueControl.selectedQueue().length === 1
      ? this.speechItemFromControls({
        id: this.uniqueItemId("New speech item"),
        name: this.uniqueItemName("New speech item"),
        text: "New speech line."
      })
      : null;
    const nextItem = this.queueControl.deleteSelectedItem(replacementItem);
    if (!nextItem) {
      this.statusLog.fail(`${TEXT_TO_SPEECH_DISPLAY_NAME} delete failed: no replacement named sentence is available.`);
      return;
    }
    this.applyQueueItem(nextItem, "queue-item-deleted");
    this.markWorkspaceDirty("speech-item-deleted", ["queue"]);
    this.statusLog.ok(`Deleted speech item: ${selectedItem.name}.`);
  }

  refreshVoices(source = "initial", selectedVoice = undefined) {
    const result = this.speechOptions.populateVoices(this.engine.voiceOptions(), selectedVoice);
    if (result.matchingVoiceCount > 0) {
      const action = source === "voiceschanged"
        ? "Updated"
        : source === "initial" ? "Loaded" : "Filtered";
      const voiceScope = result.genderFilter === "any"
        ? `${result.voiceCount} voices`
        : `${result.filteredVoiceCount} ${result.filterLabel} voices from ${result.voiceCount} total`;
      this.statusLog.ok(`${action} ${result.matchingVoiceCount} matching SpeechSynthesis voices for ${TEXT_TO_SPEECH_DISPLAY_NAME} (${voiceScope}; ${result.languageCount} languages; gender=${result.genderFilterLabel}; age=${result.ageFilterLabel}; language=${result.language}).`);
    } else {
      const message = result.voiceCount === 0
        ? `${TEXT_TO_SPEECH_DISPLAY_NAME} voice dropdown has no SpeechSynthesis voices; waiting for voiceschanged. Speak is disabled.`
        : result.filteredVoiceCount === 0
          ? `${TEXT_TO_SPEECH_DISPLAY_NAME} voice dropdown has no ${result.filterLabel} SpeechSynthesis voices; choose another Gender. Speak is disabled.`
        : `${TEXT_TO_SPEECH_DISPLAY_NAME} voice dropdown has no SpeechSynthesis voices matching ${result.language}; voice selection cleared. Speak is disabled.`;
      this.statusLog.fail(message);
    }
    if (result.languageAdjusted) {
      this.statusLog.ok(`Language selection adjusted from ${result.previousLanguage || "(none)"} to ${result.language || "(none)"} because available ${result.filterLabel} SpeechSynthesis voices changed.`);
    }
    if (source === "gender-changed" || source === "language-changed") {
      this.statusLog.ok(`Filter counts: available languages=${result.languageCount}; available voices=${result.filteredVoiceCount}; selected voice=${result.selectedVoiceLabel || "(none)"}; gender is a helper filter only, not a voice transformation.`);
    }
    if ((source === "age-changed" || source === "gender-changed" || source === "language-changed") && result.selectionAdjusted) {
      if (result.selectedVoice) {
        this.statusLog.ok(`Voice selection adjusted for ${result.filterLabel} / ${result.language}: ${result.selectedVoiceLabel}.`);
      } else {
        this.statusLog.fail(`Voice selection cleared for ${result.filterLabel} / ${result.language}: no matching SpeechSynthesis voices.`);
      }
    }
    this.refreshActionState();
    return result;
  }

  applyQueueItem(item, status) {
    if (!item) {
      this.statusLog.fail(`${TEXT_TO_SPEECH_DISPLAY_NAME} queue selection failed: no speech item is selected.`);
      return;
    }
    this.isApplyingQueueItem = true;
    try {
      this.queueControl.setItemName(item.name);
      this.textInput.setText(item.text, { emit: false });
      this.speechOptions.setValue(item);
    } finally {
      this.isApplyingQueueItem = false;
    }
    if (status !== "queue-loaded") {
      this.refreshVoices(status, item.voice);
    }
    this.refreshOutputSummary(status);
  }

  refreshOutputSummary(status) {
    this.outputSummary.render(this.queueControl.selectedQueue());
    this.refreshActionState();
  }

  refreshActionState() {
    const canSpeak = this.engine.isSupported() && this.textInput.hasText() && this.speechOptions.hasVoice();
    this.actionNav.setSpeakEnabled(canSpeak);
    this.actionNav.setPauseEnabled(this.engine.canPause());
    this.actionNav.setResumeEnabled(this.engine.canResume());
    this.actionNav.setStopEnabled(this.engine.isSupported());
  }

  speak() {
    const selectedItem = this.queueControl.selectedItem();
    const result = this.engine.speak({
      ...this.speechOptions.value(),
      speechItemId: selectedItem?.id || "",
      speechItemName: selectedItem?.name || "",
      text: this.textInput.text()
    });
    if (!result.ok) {
      this.statusLog.fail(result.message);
      this.refreshOutputSummary("speak-failed");
      return;
    }
    this.outputSummary.render(this.queueControl.selectedQueue());
    this.statusLog.ok(`Speech queued: ${result.speechItemName}; mode=${result.queueMode}; ${result.language}; voice=${result.voiceName}; rate=${result.rate}; pitch=${result.pitch}; volume=${result.volume}; queuedItems=${result.queuedSpeechItems.length}.`);
    this.refreshActionState();
  }

  pause() {
    const result = this.engine.pause();
    if (!result.ok) {
      this.statusLog.fail(result.message);
      return;
    }
    this.statusLog.ok("Speech paused.");
    this.refreshOutputSummary("paused");
  }

  resume() {
    const result = this.engine.resume();
    if (!result.ok) {
      this.statusLog.fail(result.message);
      return;
    }
    this.statusLog.ok("Speech resumed.");
    this.refreshOutputSummary("resumed");
  }

  stop() {
    const result = this.engine.stop();
    if (!result.ok) {
      this.statusLog.fail(result.message);
      this.refreshOutputSummary("stop-failed");
      return;
    }
    this.statusLog.ok(`Speech queue stopped: ${result.stoppedCount} queued item(s) cleared.`);
    this.refreshOutputSummary("stopped");
  }
}
