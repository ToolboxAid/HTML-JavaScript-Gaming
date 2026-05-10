import { AssetFolderControl } from "./controls/AssetFolderControl.js";
import { CaptureModeControl } from "./controls/CaptureModeControl.js";
import { GeneratePreviewControl } from "./controls/GeneratePreviewControl.js";
import { LastGeneratedImageControl } from "./controls/LastGeneratedImageControl.js";
import { OutputSummaryControl } from "./controls/OutputSummaryControl.js";
import { PathsOrIdsControl } from "./controls/PathsOrIdsControl.js";
import { PreviewFrameControl } from "./controls/PreviewFrameControl.js";
import { RenderControlsControl } from "./controls/RenderControlsControl.js";
import { RepoDestinationControl } from "./controls/RepoDestinationControl.js";
import { StatusLogControl } from "./controls/StatusLogControl.js";
import { TargetSourceControl } from "./controls/TargetSourceControl.js";

class PreviewGeneratorV2Ui {
  constructor({ documentRef = document } = {}) {
    this.generatePreview = new GeneratePreviewControl({ documentRef });
    this.repoDestination = new RepoDestinationControl({ documentRef });
    this.targetSource = new TargetSourceControl({ documentRef });
    this.assetFolder = new AssetFolderControl({ documentRef });
    this.captureMode = new CaptureModeControl({ documentRef });
    this.renderControls = new RenderControlsControl({ documentRef });
    this.pathsOrIds = new PathsOrIdsControl({ documentRef });
    this.lastGeneratedImage = new LastGeneratedImageControl({ documentRef });
    this.outputSummary = new OutputSummaryControl({ documentRef });
    this.statusLog = new StatusLogControl({ documentRef });
    this.previewFrame = new PreviewFrameControl({ documentRef });
  }

  setRepoDestinationDisplayName(displayName) {
    this.repoDestination.setRepoDestinationDisplayName(displayName);
  }

  setPickRepoVisible(isVisible) {
    this.repoDestination.setPickRepoVisible(isVisible);
  }

  setWorkspaceToolStateControlsLocked(isLocked) {
    this.repoDestination.setPickRepoEnabled(!isLocked);
    this.targetSource.setDisabled(isLocked);
    this.pathsOrIds.setDisabled(isLocked);
  }

  syncGeneratePreviewButton(isGenerating, canGenerate) {
    this.generatePreview.syncGeneratePreviewButton(isGenerating, canGenerate);
  }

  setStopDisabled(isDisabled) {
    this.generatePreview.setStopDisabled(isDisabled);
  }

  setLastGeneratedImage(svgContent, label) {
    this.lastGeneratedImage.setLastGeneratedImage(svgContent, label);
  }

  setPreviewTargetImage(imagePath) {
    this.lastGeneratedImage.setPreviewTargetImage(imagePath);
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
