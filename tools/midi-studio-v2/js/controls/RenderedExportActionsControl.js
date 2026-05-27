export class RenderedExportActionsControl {
  constructor({ mp3Button, oggButton, wavButton }) {
    this.mp3Button = mp3Button;
    this.oggButton = oggButton;
    this.wavButton = wavButton;
  }

  mount({ onExport }) {
    this.wavButton.addEventListener("click", (event) => {
      event.stopPropagation();
      onExport("wav");
    });
    this.mp3Button.addEventListener("click", (event) => {
      event.stopPropagation();
      onExport("mp3");
    });
    this.oggButton.addEventListener("click", (event) => {
      event.stopPropagation();
      onExport("ogg");
    });
  }
}
