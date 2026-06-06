const NOTES_DIRECTORY = "docs_build/dev/admin-notes";
const DEFAULT_NOTE = "index";
const LINK_CLASS = "btn btn--compact primary";
const NOTE_NAME_PATTERN = /^[A-Za-z0-9_-]+$/;
const STATUS_ICON_PATTERN = /^\[([ xX.!?])\]\s*(.*)$/;

class AdminNotesViewer {
  constructor(documentRef = document, historyRef = window.history) {
    this.documentRef = documentRef;
    this.historyRef = historyRef;
    this.title = documentRef.querySelector("[data-admin-notes-title]");
    this.returnLink = documentRef.querySelector("[data-admin-notes-return]");
    this.status = documentRef.querySelector("[data-admin-notes-status]");
    this.content = documentRef.querySelector("[data-admin-notes-content]");
    this.bindEvents();
  }

  bindEvents() {
    this.content?.addEventListener("click", (event) => {
      const link = event.target.closest("[data-admin-note-link], [data-admin-note-file]");
      if (!link || !this.content.contains(link)) {
        return;
      }
      event.preventDefault();
      if (link.dataset.adminNoteFile) {
        this.openFile(link.dataset.adminNoteFile, true);
        return;
      }
      this.openNote(link.dataset.adminNoteLink || DEFAULT_NOTE, true);
    });

    this.returnLink?.addEventListener("click", (event) => {
      event.preventDefault();
      this.openNote(DEFAULT_NOTE, true);
    });
  }

  start() {
    this.openFromLocation(window.location, false);
  }

  openFromLocation(locationRef, pushHistory) {
    const params = new URLSearchParams(locationRef.search);
    const filePath = params.get("file");
    if (filePath) {
      this.openFile(filePath, pushHistory);
      return;
    }
    this.openNote(this.noteNameFromValue(params.get("note") || DEFAULT_NOTE), pushHistory);
  }

  noteNameFromValue(value) {
    const normalized = String(value || DEFAULT_NOTE)
      .trim()
      .replace(/\\/g, "/")
      .replace(/\/index(?:\.txt)?$/i, "")
      .replace(/\.txt$/i, "");
    return normalized || DEFAULT_NOTE;
  }

  validNoteName(noteName) {
    return NOTE_NAME_PATTERN.test(noteName);
  }

  notePath(noteName) {
    return noteName === DEFAULT_NOTE
      ? `${NOTES_DIRECTORY}/index.txt`
      : `${NOTES_DIRECTORY}/${noteName}/index.txt`;
  }

  async openNote(noteName, pushHistory) {
    const normalizedNoteName = this.noteNameFromValue(noteName);
    this.clearContent();
    const title = normalizedNoteName === DEFAULT_NOTE ? "index.txt" : `${normalizedNoteName}/index.txt`;
    this.setTitle(title);
    this.setReturnVisible(normalizedNoteName !== DEFAULT_NOTE);

    if (!this.validNoteName(normalizedNoteName)) {
      this.renderError(
        `Rejected note path "${noteName}". Use a bracket note name containing only letters, numbers, underscores, or hyphens.`
      );
      return;
    }

    const notePath = this.notePath(normalizedNoteName);
    await this.loadTextFile({
      filePath: notePath,
      title,
      missingMessage: `Missing note file ${notePath}. Add this file under ${NOTES_DIRECTORY}/ or return to index.txt.`,
      errorMessage: `Unable to load ${notePath}. Check the note file and reload the page.`,
      pushHistory,
      pushUrl: this.hrefForNote(normalizedNoteName)
    });
  }

  async openFile(filePath, pushHistory) {
    const normalizedFilePath = this.rootRelativeTextPathFromValue(filePath);
    this.clearContent();
    this.setTitle(normalizedFilePath || "linked file");
    this.setReturnVisible(true);

    if (!normalizedFilePath) {
      this.renderError(
        `Rejected linked file path "${filePath}". Use a repository-root text file path without traversal.`
      );
      return;
    }

    await this.loadTextFile({
      filePath: normalizedFilePath,
      title: normalizedFilePath,
      missingMessage: `Missing linked file ${normalizedFilePath}. Add this text file under the repository root or return to index.txt.`,
      errorMessage: `Unable to load ${normalizedFilePath}. Check the linked text file and reload the page.`,
      pushHistory,
      pushUrl: this.hrefForFile(normalizedFilePath)
    });
  }

  async loadTextFile({ filePath, title, missingMessage, errorMessage, pushHistory, pushUrl }) {
    try {
      const response = await fetch(filePath, { cache: "no-store" });
      if (!response.ok) {
        this.renderError(missingMessage);
        return;
      }
      const text = await response.text();
      this.renderNote(text, title);
      this.setStatus(`Loaded ${filePath}.`);
      if (pushHistory) {
        this.historyRef.pushState({}, "", pushUrl);
      }
    } catch {
      this.renderError(errorMessage);
    }
  }

  hrefForNote(noteName) {
    return noteName === DEFAULT_NOTE ? "admin/notes.html" : `admin/notes.html?note=${encodeURIComponent(noteName)}`;
  }

  hrefForFile(filePath) {
    return `admin/notes.html?file=${encodeURIComponent(filePath)}`;
  }

  rootRelativeTextPathFromValue(value) {
    const rawValue = String(value || "").trim();
    if (/^[A-Za-z]:/.test(rawValue) || /^[A-Za-z][A-Za-z0-9+.-]*:/.test(rawValue)) {
      return null;
    }
    const normalizedPath = rawValue.replace(/\\/g, "/").replace(/^\/+/, "");
    const segments = normalizedPath.split("/");
    const invalidSegments = segments.some((segment) => !segment || segment === "." || segment === "..");
    if (!normalizedPath || invalidSegments || !normalizedPath.toLowerCase().endsWith(".txt")) {
      return null;
    }
    return normalizedPath;
  }

  clearContent() {
    this.content?.replaceChildren();
  }

  setTitle(value) {
    if (this.title) {
      this.title.textContent = value;
    }
  }

  setStatus(value) {
    if (this.status) {
      this.status.textContent = value;
    }
  }

  setReturnVisible(visible) {
    if (this.returnLink) {
      this.returnLink.hidden = !visible;
    }
  }

  renderError(message) {
    this.setStatus("Admin note error.");
    const errorMessage = this.documentRef.createElement("p");
    errorMessage.className = "status";
    errorMessage.dataset.adminNotesError = "";
    errorMessage.textContent = message;
    this.content?.append(errorMessage);
  }

  renderNote(text, title) {
    this.setTitle(title);
    const lines = text.split(/\r?\n/);
    let currentList = null;
    let lastTopLevelItem = null;
    let nestedList = null;

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        currentList = null;
        lastTopLevelItem = null;
        nestedList = null;
        return;
      }
      const bullet = line.match(/^(\s*)-\s+(.*)$/);
      if (bullet) {
        const level = bullet[1].length >= 2 ? 1 : 0;
        if (level === 0) {
          currentList = currentList || this.documentRef.createElement("ul");
          if (!currentList.parentNode) {
            this.content?.append(currentList);
          }
          const item = this.documentRef.createElement("li");
          this.appendRichText(item, bullet[2].trim());
          currentList.append(item);
          lastTopLevelItem = item;
          nestedList = null;
          return;
        }
        if (!lastTopLevelItem) {
          currentList = currentList || this.documentRef.createElement("ul");
          if (!currentList.parentNode) {
            this.content?.append(currentList);
          }
          lastTopLevelItem = this.documentRef.createElement("li");
          currentList.append(lastTopLevelItem);
        }
        nestedList = nestedList || this.documentRef.createElement("ul");
        if (!nestedList.parentNode) {
          lastTopLevelItem.append(nestedList);
        }
        const item = this.documentRef.createElement("li");
        this.appendRichText(item, bullet[2].trim());
        nestedList.append(item);
        return;
      }

      const node = this.sectionHeading(trimmed)
        ? this.documentRef.createElement("h3")
        : this.documentRef.createElement("p");
      this.appendRichText(node, trimmed);
      this.content?.append(node);
      currentList = null;
      lastTopLevelItem = null;
      nestedList = null;
    });
  }

  sectionHeading(text) {
    return ["Ideas", "Things to Fix", "Undecided Questions"].includes(text);
  }

  appendRichText(parent, text) {
    const statusMatch = text.match(STATUS_ICON_PATTERN);
    if (statusMatch) {
      parent.append(this.statusIcon(statusMatch[1]));
      parent.append(this.documentRef.createTextNode(" "));
      this.appendLinkedText(parent, statusMatch[2]);
      return;
    }
    this.appendLinkedText(parent, text);
  }

  statusIcon(rawStatus) {
    const icon = this.documentRef.createElement("strong");
    icon.dataset.adminNotesStatusIcon = this.statusIconName(rawStatus);
    icon.textContent = `[${rawStatus}]`;
    return icon;
  }

  statusIconName(rawStatus) {
    const normalizedStatus = rawStatus.toLowerCase();
    if (normalizedStatus === "x") {
      return "done";
    }
    if (normalizedStatus === ".") {
      return "active";
    }
    if (normalizedStatus === "!") {
      return "blocked";
    }
    if (normalizedStatus === "?") {
      return "question";
    }
    return "open";
  }

  appendLinkedText(parent, text) {
    const bracketPattern = /\[([^\]]+)\]/g;
    let cursor = 0;
    let match = bracketPattern.exec(text);
    while (match) {
      parent.append(this.documentRef.createTextNode(text.slice(cursor, match.index)));
      parent.append(this.linkOrText(match[1]));
      cursor = match.index + match[0].length;
      match = bracketPattern.exec(text);
    }
    parent.append(this.documentRef.createTextNode(text.slice(cursor)));
  }

  linkOrText(linkText) {
    const commaIndex = linkText.indexOf(",");
    if (commaIndex !== -1) {
      const label = linkText.slice(0, commaIndex).trim();
      const filePath = this.rootRelativeTextPathFromValue(linkText.slice(commaIndex + 1));
      if (!label || !filePath) {
        return this.documentRef.createTextNode(`[${linkText}]`);
      }
      const link = this.documentRef.createElement("a");
      link.href = this.hrefForFile(filePath);
      link.className = LINK_CLASS;
      link.dataset.adminNoteFile = filePath;
      link.textContent = label;
      return link;
    }

    const normalizedNoteName = this.noteNameFromValue(linkText);
    if (!this.validNoteName(normalizedNoteName)) {
      return this.documentRef.createTextNode(`[${linkText}]`);
    }
    const link = this.documentRef.createElement("a");
    link.href = this.hrefForNote(normalizedNoteName);
    link.className = LINK_CLASS;
    link.dataset.adminNoteLink = normalizedNoteName;
    link.textContent = `[${linkText}]`;
    return link;
  }
}

new AdminNotesViewer().start();
