const NOTES_DIRECTORY = "docs_build/dev/admin-notes";
const DEFAULT_NOTE = "index";
const LINK_CLASS = "btn btn--compact primary";
const NOTE_NAME_PATTERN = /^[A-Za-z0-9_-]+$/;
const STATUS_ICON_PATTERN = /^\[([ xX.!?])\]\s*(.*)$/;
const NOTE_INDEX_FILE = "index.txt";
const DIRECTORY_LIST_QUERY = "adminNotesDirectory";
const STATUS_MARKERS = {
  " ": {
    marker: "[ ]",
    icon: "⬜",
    label: "Not Started",
    name: "not-started",
    title: "Not Started"
  },
  "!": {
    marker: "[!]",
    icon: "⛔",
    label: "Blocker",
    name: "blocker",
    title: "Blocker"
  },
  "?": {
    marker: "[?]",
    icon: "❓",
    label: "Decide",
    name: "decide",
    title: "Decide which project questions need their own subnote files."
  },
  ".": {
    marker: "[.]",
    icon: "🟡",
    label: "In Progress",
    name: "in-progress",
    title: "In Progress"
  },
  x: {
    marker: "[x]",
    icon: "✅",
    label: "Complete",
    name: "complete",
    title: "Complete"
  }
};

class AdminNotesViewer {
  constructor(documentRef = document, historyRef = window.history) {
    this.documentRef = documentRef;
    this.historyRef = historyRef;
    this.surface = documentRef.querySelector("[data-admin-notes-viewer]");
    this.title = documentRef.querySelector("[data-admin-notes-title]");
    this.status = documentRef.querySelector("[data-admin-notes-status]");
    this.content = documentRef.querySelector("[data-admin-notes-content]");
    this.directory = documentRef.querySelector("[data-admin-notes-directory]");
    this.directoryLinks = documentRef.querySelector("[data-admin-notes-directory-links]");
    this.openFolderLink = documentRef.querySelector("[data-admin-notes-open-folder]");
    this.folderDiagnostic = documentRef.querySelector("[data-admin-notes-folder-diagnostic]");
    this.legendList = documentRef.querySelector("[data-admin-notes-legend-list]");
    this.bindEvents();
  }

  bindEvents() {
    this.surface?.addEventListener("click", (event) => {
      const link = event.target.closest("[data-admin-note-link], [data-admin-note-file]");
      if (!link || !this.surface.contains(link)) {
        return;
      }
      event.preventDefault();
      if (link.dataset.adminNoteFile) {
        this.openFile(link.dataset.adminNoteFile, true);
        return;
      }
      this.openNote(link.dataset.adminNoteLink || DEFAULT_NOTE, true);
    });
    this.openFolderLink?.addEventListener("click", (event) => {
      if (!this.openFolderLink.href || this.openFolderLink.getAttribute("aria-disabled") === "true") {
        event.preventDefault();
        this.setFolderDiagnostic("Open folder is available only for safe Admin Notes folders in local/dev mode.");
        return;
      }
      event.preventDefault();
      this.documentRef.defaultView?.open(this.openFolderLink.href, "_blank", "noopener,noreferrer");
      this.setFolderDiagnostic("If the folder did not open, your browser may require local file or dev-server mode for folder links.");
    });
  }

  start() {
    this.renderLegend();
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
      ? `${NOTES_DIRECTORY}/${NOTE_INDEX_FILE}`
      : `${NOTES_DIRECTORY}/${noteName}/${NOTE_INDEX_FILE}`;
  }

  async openNote(noteName, pushHistory) {
    const normalizedNoteName = this.noteNameFromValue(noteName);
    this.clearContent();
    const title = NOTE_INDEX_FILE;
    this.setTitle(title);

    if (!this.validNoteName(normalizedNoteName)) {
      this.renderError(
        `Rejected note path "${noteName}". Use a bracket note name containing only letters, numbers, underscores, or hyphens.`
      );
      await this.renderDirectoryLinks(NOTES_DIRECTORY, "");
      return;
    }

    const notePath = this.notePath(normalizedNoteName);
    await this.loadTextFile({
      filePath: notePath,
      title,
      currentFilePath: notePath,
      missingMessage: `Missing note file ${notePath}. Add this file under ${NOTES_DIRECTORY}/ or return to index.txt.`,
      errorMessage: `Unable to load ${notePath}. Check the note file and reload the page.`,
      pushHistory,
      pushUrl: this.hrefForNote(normalizedNoteName)
    });
  }

  async openFile(filePath, pushHistory) {
    const normalizedFilePath = this.rootRelativeTextPathFromValue(filePath);
    this.clearContent();
    this.setTitle(normalizedFilePath ? this.fileNameForPath(normalizedFilePath) : "linked file");

    if (!normalizedFilePath) {
      this.renderError(
        `Rejected linked file path "${filePath}". Use a repository-root text file path without traversal.`
      );
      await this.renderDirectoryLinks(NOTES_DIRECTORY, "");
      return;
    }

    await this.loadTextFile({
      filePath: normalizedFilePath,
      title: this.fileNameForPath(normalizedFilePath),
      currentFilePath: normalizedFilePath,
      missingMessage: `Missing linked file ${normalizedFilePath}. Add this text file under the repository root or return to index.txt.`,
      errorMessage: `Unable to load ${normalizedFilePath}. Check the linked text file and reload the page.`,
      pushHistory,
      pushUrl: this.hrefForFile(normalizedFilePath)
    });
  }

  async loadTextFile({ filePath, title, currentFilePath, missingMessage, errorMessage, pushHistory, pushUrl }) {
    try {
      const response = await fetch(filePath, { cache: "no-store" });
      if (!response.ok) {
        this.renderError(missingMessage);
        await this.renderDirectoryLinks(this.folderPathForFile(currentFilePath), currentFilePath);
        return;
      }
      const text = await response.text();
      this.renderNote(text, title);
      this.setStatus(`Loaded ${filePath}.`);
      await this.renderDirectoryLinks(this.folderPathForFile(currentFilePath), currentFilePath);
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

  rootRelativeFolderPathFromValue(value) {
    const rawValue = String(value || "").trim();
    if (/^[A-Za-z]:/.test(rawValue) || /^[A-Za-z][A-Za-z0-9+.-]*:/.test(rawValue)) {
      return null;
    }
    const normalizedPath = rawValue.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
    const segments = normalizedPath.split("/");
    const invalidSegments = segments.some((segment) => !segment || segment === "." || segment === "..");
    if (!normalizedPath || invalidSegments) {
      return null;
    }
    return normalizedPath;
  }

  adminNotesFolderPathFromValue(value) {
    const folderPath = this.rootRelativeFolderPathFromValue(value);
    if (!folderPath) {
      return null;
    }
    if (folderPath !== NOTES_DIRECTORY && !folderPath.startsWith(`${NOTES_DIRECTORY}/`)) {
      return null;
    }
    return folderPath;
  }

  fileNameForPath(filePath) {
    return String(filePath || "").split("/").pop() || NOTE_INDEX_FILE;
  }

  folderPathForFile(filePath) {
    const segments = String(filePath || "").split("/");
    segments.pop();
    return segments.join("/");
  }

  clearContent() {
    this.content?.replaceChildren();
    this.directoryLinks?.replaceChildren();
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

  renderError(message) {
    this.setStatus("Admin note error.");
    const errorMessage = this.documentRef.createElement("p");
    errorMessage.className = "status";
    errorMessage.dataset.adminNotesError = "";
    errorMessage.textContent = message;
    this.content?.append(errorMessage);
  }

  async renderDirectoryLinks(folderPath, currentFilePath) {
    const listing = await this.directoryListingForFolder(folderPath);
    this.updateOpenFolderLink(listing);
    this.setFolderDiagnostic(listing.error || "");
    const entries = listing.entries;
    const safeEntries = entries
      .map((entry) => this.safeDirectoryEntry(entry))
      .filter(Boolean)
      .filter((entry) => !(entry.path === currentFilePath && this.fileNameForPath(entry.path) === NOTE_INDEX_FILE))
      .sort((left, right) => left.label.localeCompare(right.label));

    this.directoryLinks?.replaceChildren();
    safeEntries.forEach((entry) => {
      this.directoryLinks?.append(this.directoryLink(entry));
    });
  }

  async directoryListingForFolder(folderPath) {
    const safeFolderPath = this.adminNotesFolderPathFromValue(folderPath);
    if (!safeFolderPath) {
      return {
        entries: [],
        error: "Current Folder listing is restricted to docs_build/dev/admin-notes/."
      };
    }
    try {
      const response = await fetch(this.directoryListingUrl(safeFolderPath), { cache: "no-store" });
      if (!response.ok) {
        return {
          entries: [],
          error: "Current Folder listing is unavailable. Start the local/dev server to read Admin Notes folders from the filesystem."
        };
      }
      const listing = await response.json();
      return {
        entries: Array.isArray(listing.entries) ? listing.entries : [],
        folderPath: this.adminNotesFolderPathFromValue(listing.folderPath),
        folderFileUrl: this.safeFolderFileUrl(listing.folderFileUrl),
        error: ""
      };
    } catch {
      return {
        entries: [],
        error: "Current Folder listing is unavailable. Start the local/dev server to read Admin Notes folders from the filesystem."
      };
    }
  }

  directoryListingUrl(folderPath) {
    const folderUrl = folderPath.endsWith("/") ? folderPath : `${folderPath}/`;
    return `${folderUrl}?${DIRECTORY_LIST_QUERY}=1`;
  }

  safeFolderFileUrl(value) {
    const rawValue = String(value || "").trim();
    if (!rawValue || !rawValue.startsWith("file://")) {
      return "";
    }
    return rawValue;
  }

  setFolderDiagnostic(message) {
    if (this.folderDiagnostic) {
      this.folderDiagnostic.textContent = message;
    }
  }

  updateOpenFolderLink(listing) {
    if (!this.openFolderLink) {
      return;
    }
    const folderUrl = listing.folderFileUrl || "";
    if (!folderUrl) {
      this.openFolderLink.href = "#";
      this.openFolderLink.setAttribute("aria-disabled", "true");
      return;
    }
    this.openFolderLink.href = folderUrl;
    this.openFolderLink.setAttribute("aria-disabled", "false");
  }

  safeDirectoryEntry(entry) {
    const label = String(entry?.label || "").trim();
    const path = this.rootRelativeTextPathFromValue(entry?.path);
    if (!label || !path) {
      return null;
    }
    if (entry.type === "folder") {
      if (!path.endsWith(`/${NOTE_INDEX_FILE}`)) {
        return null;
      }
      if (!this.adminNotesFolderPathFromValue(this.folderPathForFile(path))) {
        return null;
      }
      return { label, path, type: "folder" };
    }
    if (entry.type === "file") {
      if (!this.adminNotesFolderPathFromValue(this.folderPathForFile(path))) {
        return null;
      }
      return { label, path, type: "file" };
    }
    return null;
  }

  directoryLink(entry) {
    const link = this.documentRef.createElement("a");
    link.className = LINK_CLASS;
    link.textContent = entry.label;
    link.href = this.hrefForFile(entry.path);
    link.dataset.adminNoteFile = entry.path;
    link.dataset.adminNotesDirectoryLink = entry.type;
    return link;
  }

  renderLegend() {
    this.legendList?.replaceChildren();
    Object.values(STATUS_MARKERS).forEach((marker) => {
      const item = this.documentRef.createElement("span");
      item.dataset.adminNotesLegendItem = marker.name;
      const icon = this.documentRef.createElement("span");
      icon.dataset.adminNotesLegendIcon = marker.name;
      icon.textContent = `${marker.marker} ${marker.icon}`;
      item.append(icon);
      item.append(this.documentRef.createTextNode(` ${marker.label}`));
      this.legendList?.append(item);
    });
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
    const marker = this.statusMarker(rawStatus);
    const icon = this.documentRef.createElement("span");
    icon.dataset.adminNotesStatusIcon = marker.name;
    icon.title = marker.title;
    icon.setAttribute("aria-label", marker.label);
    icon.textContent = marker.icon;
    return icon;
  }

  statusMarker(rawStatus) {
    const normalizedStatus = rawStatus.toLowerCase();
    return STATUS_MARKERS[normalizedStatus] || STATUS_MARKERS[" "];
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
