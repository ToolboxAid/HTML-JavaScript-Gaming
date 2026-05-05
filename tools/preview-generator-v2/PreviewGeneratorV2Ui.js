import { AssetFolderControl } from "./controls/AssetFolderControl.js";
import { CaptureModeControl } from "./controls/CaptureModeControl.js";
import { LastGeneratedImageControl } from "./controls/LastGeneratedImageControl.js";
import { MenuSampleControl } from "./controls/MenuSampleControl.js";
import { OutputSummaryControl } from "./controls/OutputSummaryControl.js";
import { PathsOrIdsControl } from "./controls/PathsOrIdsControl.js";
import { PreviewFrameControl } from "./controls/PreviewFrameControl.js";
import { RenderControlsControl } from "./controls/RenderControlsControl.js";
import { RepoDestinationControl } from "./controls/RepoDestinationControl.js";
import { StatusControl } from "./controls/StatusControl.js";
import { TargetSourceControl } from "./controls/TargetSourceControl.js";

class PreviewGeneratorV2Ui {
  constructor({
    pickRepoBtn,
    executeBtn,
    stopBtn,
    baseUrlInput,
    waitMsInput,
    assetFolderInput,
    sampleListInput,
    forceRewriteInput,
    statusEl,
    logEl,
    clearLogBtn,
    frame,
    lastGeneratedImageEmptyEl,
    lastGeneratedImagePreviewEl,
    lastGeneratedImageEl,
    lastGeneratedImageMetaEl,
    repoSelectedValueEl,
    writeFolderSampleValueEl,
    writeFolderActualValueEl,
    targetTypeInputs,
    captureModeInputs
  }) {
    this.menuSample = new MenuSampleControl({ executeBtn, stopBtn });
    this.repoDestination = new RepoDestinationControl({ pickRepoBtn, repoSelectedValueEl });
    this.targetSource = new TargetSourceControl({ targetTypeInputs, baseUrlInput });
    this.assetFolder = new AssetFolderControl({ assetFolderInput });
    this.captureMode = new CaptureModeControl({ captureModeInputs });
    this.renderControls = new RenderControlsControl({ waitMsInput, forceRewriteInput });
    this.pathsOrIds = new PathsOrIdsControl({ sampleListInput });
    this.lastGeneratedImage = new LastGeneratedImageControl({
      lastGeneratedImageEmptyEl,
      lastGeneratedImagePreviewEl,
      lastGeneratedImageEl,
      lastGeneratedImageMetaEl
    });
    this.outputSummary = new OutputSummaryControl({ writeFolderSampleValueEl, writeFolderActualValueEl });
    this.status = new StatusControl({ statusEl, logEl, clearLogBtn });
    this.previewFrame = new PreviewFrameControl({ frame });
  }

  setRepoDestinationDisplayName(displayName) {
    this.repoDestination.setRepoDestinationDisplayName(displayName);
  }

  syncGeneratePreviewButton(isGenerating, canGenerate) {
    this.menuSample.syncGeneratePreviewButton(isGenerating, canGenerate);
  }

  setStopDisabled(isDisabled) {
    this.menuSample.setStopDisabled(isDisabled);
  }

  setLastGeneratedImage(svgContent, label) {
    this.lastGeneratedImage.setLastGeneratedImage(svgContent, label);
  }

  getSelectedCaptureMode() {
    return this.captureMode.getSelectedCaptureMode();
  }

  getCaptureModeLabel(modeValue = this.getSelectedCaptureMode()) {
    return this.captureMode.getCaptureModeLabel(modeValue);
  }

  getSelectedTargetType() {
    return this.targetSource.getSelectedTargetType();
  }
}

export { PreviewGeneratorV2Ui };
