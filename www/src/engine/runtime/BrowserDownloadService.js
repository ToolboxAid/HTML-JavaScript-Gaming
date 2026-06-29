/*
Toolbox Aid
David Quesenberry
03/27/2026
BrowserDownloadService.js
*/
export default class BrowserDownloadService {
  static fromBrowser({ linkElement = null, urlRef = globalThis.URL ?? null } = {}) {
    return new BrowserDownloadService({ linkElement, urlRef });
  }

  constructor({ linkElement = null, urlRef = null } = {}) {
    this.linkElement = linkElement;
    this.urlRef = urlRef;
  }

  setLinkElement(linkElement) {
    this.linkElement = linkElement;
  }

  canDownload() {
    return !!(
      this.linkElement &&
      this.urlRef &&
      typeof this.urlRef.createObjectURL === "function" &&
      typeof this.urlRef.revokeObjectURL === "function"
    );
  }

  downloadBlob(name, blob) {
    if (!this.canDownload() || !blob) return false;
    const url = this.urlRef.createObjectURL(blob);
    this.linkElement.download = name;
    this.linkElement.href = url;
    this.linkElement.click();
    setTimeout(() => this.urlRef.revokeObjectURL(url), 1000);
    return true;
  }

  downloadText(name, text, mime = "text/plain") {
    return this.downloadBlob(name, new Blob([text], { type: mime }));
  }
}
