import { SpriteEditorViewport } from "./viewport.js";
import { SpriteEditorDocument } from "./document.js";
import { SpriteEditorCanvasControlSurface } from "./controlSurface.js";
import { BrowserDownloadService, FullscreenService } from "../../../engine/runtime/index.js";
import { installSpriteEditorPopupMethods } from "./appPopups.js";
import { installSpriteEditorMenuMethods } from "./appMenus.js";
import { installSpriteEditorRenderMethods } from "./appRender.js";
import { installSpriteEditorActionMethods } from "./appActions.js";
import { installSpriteEditorIOMethods } from "./appIO.js";
import { installSpriteEditorInputMethods } from "./appInput.js";
import { installSpriteEditorCommandMethods } from "./appCommands.js";
import { installSpriteEditorPaletteMethods } from "./appPalette.js";
import { installSpriteEditorExportMethods } from "./appExport.js";
import { installSpriteEditorTimelineMethods } from "./appTimeline.js";
import { installSpriteEditorHistoryMethods } from "./appHistory.js";
import { installSpriteEditorViewToolMethods } from "./appViewTools.js";
import { installSpriteEditorLayerMethods } from "./appLayers.js";
import { installSpriteEditorShellMethods } from "./appShell.js";

class SpriteEditorApp {
    constructor(canvas,fileInput,downloadLink) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.fileInput = fileInput;
      this.downloadLink = downloadLink;
      this.downloads = BrowserDownloadService.fromBrowser({ linkElement: downloadLink });
      this.viewport = new SpriteEditorViewport(canvas);
      this.document = new SpriteEditorDocument();
      this.controlSurface = new SpriteEditorCanvasControlSurface(this);
      this.activeTool = "brush";
      this.brush = { size: 1, shape: "square" };
      this.hoveredGridCell = null;
      this.isPointerDown = false;
      this.mirror = false;
      this.selectionStart = null;
      this.selectionPasteOrigin = { x: 0, y: 0 };
      this.selectionMoveSession = null;
      this.timelineInteraction = null;
      this.timelineStripRect = null;
      this.frameRangeSelection = null;
      this.playbackRange = { enabled: false, startFrame: 0, endFrame: 0 };
      this.timelineHoverIndex = null;
      this.playback = { isPlaying: false, fps: 6, loop: true, previewFrameIndex: 0, lastTick: 0 };
      this.strokeLastCell = null;
      this.shapePreview = null;
      this.currentPalettePreset = "Custom";
      this.paletteWorkflow = { source: null, target: null, scope: "active_layer" };
      this.exportMode = "all_frames";
      this.onionSkin = { prev: false, next: false };
      this.statusMessage = "Locked 16:9 viewport ready.";
      this.flashMessageUntil = 0;
      this.gridRect = null;
      this.uiDensityEffectiveMode = "pro";
      this.zoom = 1;
      this.pan = { x: 0, y: 0 };
      this.fullscreen = FullscreenService.fromBrowser({
        documentRef: globalThis.document ?? null,
        target: canvas.closest(".sprite-editor-shell")
      });
      this.isPanning = false;
      this.panStart = null;
      this.keybindings = this.createKeybindingMap();
      this.macroDefinitions = this.loadMacroDefinitions();
      this.commandDefinitions = this.getCommandDefinitions();
      this.recentActions = this.loadRecentActions();
      this.favoriteActions = this.loadFavoriteActions();
      this.commandPaletteCommands = this.createCommandPaletteCommands();
      this.history = { undo: [], redo: [], maxEntries: 120 };
      this.activeStrokeHistory = null;
      this.historySuppressedDepth = 0;
      this.dirtyBaselineSignature = "";
      this.isDirty = false;
      this.replaceGuard = { open: false, title: "", message: "", onConfirm: null, confirmRect: null, cancelRect: null };
      this.layerRenamePrompt = { open: false, text: "", title: "Rename Layer", panelRect: null, confirmRect: null, cancelRect: null };
      this.helpDetailPopup = { open: false, section: "", panelRect: null, closeRect: null };
      this.aboutPopup = { open: false, panelRect: null, closeRect: null };
      this.palettePresetPopup = { open: false, panelRect: null, closeRect: null, backRect: null, rowRects: [] };
      this.paletteSidebarScroll = 0;
      this.paletteSidebarMetrics = null;
      this.paletteSortMode = "name";
      this.canvas.style.imageRendering = "pixelated";

      this.resize();
      this.dirtyBaselineSignature = this.historySignature(this.captureHistoryState());
      this.updateDirtyState();
      this.bindEvents();
      this.renderAll();
      requestAnimationFrame((ts) => this.tick(ts));
    }

    showMessageAndRender(message) {
      this.showMessage(message);
      this.renderAll();
    }

    showMessage(m) { this.statusMessage = m; this.flashMessageUntil = performance.now() + 1800; }
}

installSpriteEditorPopupMethods(SpriteEditorApp);
installSpriteEditorMenuMethods(SpriteEditorApp);
installSpriteEditorRenderMethods(SpriteEditorApp);
installSpriteEditorActionMethods(SpriteEditorApp);
installSpriteEditorIOMethods(SpriteEditorApp);
installSpriteEditorInputMethods(SpriteEditorApp);
installSpriteEditorCommandMethods(SpriteEditorApp);
installSpriteEditorPaletteMethods(SpriteEditorApp);
installSpriteEditorExportMethods(SpriteEditorApp);
installSpriteEditorTimelineMethods(SpriteEditorApp);
installSpriteEditorHistoryMethods(SpriteEditorApp);
installSpriteEditorViewToolMethods(SpriteEditorApp);
installSpriteEditorLayerMethods(SpriteEditorApp);
installSpriteEditorShellMethods(SpriteEditorApp);

export { SpriteEditorApp };
