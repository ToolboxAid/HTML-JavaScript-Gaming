import { resolveServerApiFetchUrl } from "../../api/public-config-client.js";

// Dev-runtime only: do not import this viewer from production bundles.
const NOTES_DIRECTORY = "dev/archive/legacy-docs-build/admin-notes";
const DEFAULT_NOTE = "index";
const VIEWER_PATH = "/admin/admin-notes.html";
const LINK_CLASS = "btn btn--compact primary";
const NOTE_NAME_PATTERN = /^[A-Za-z0-9_-]+$/;
const STATUS_ICON_PATTERN = /^\[([ xX.!?-])\]\s*(.*)$/;
const NOTE_INDEX_FILE = "index.txt";
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
  },
  "-": {
    marker: "[-]",
    icon: "⏭️",
    label: "Skipped",
    name: "skipped",
    title: "Skipped"
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
    this.currentFolder = documentRef.querySelector("[data-admin-notes-current-folder]");
    this.parentFolderButton = documentRef.querySelector("[data-admin-notes-parent-folder]");
    this.folderLinks = documentRef.querySelector("[data-admin-notes-folder-links]");
    this.fileLinks = documentRef.querySelector("[data-admin-notes-file-links]");
    this.folderDiagnostic = documentRef.querySelector("[data-admin-notes-folder-diagnostic]");
    this.legendList = documentRef.querySelector("[data-admin-notes-legend-list]");
    this.currentFolderPath = NOTES_DIRECTORY;
    this.viewerPath = this.viewerPathFromLocation(window.location);
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
    this.parentFolderButton?.addEventListener("click", (event) => {
      event.preventDefault();
      if (this.parentFolderButton.disabled) {
        return;
      }
      const parentFolderPath = this.parentFolderPath(this.currentFolderPath);
      if (!parentFolderPath) {
        return;
      }
      if (parentFolderPath === NOTES_DIRECTORY) {
        this.openNote(DEFAULT_NOTE, true);
        return;
      }
      this.openFile(`${parentFolderPath}/${NOTE_INDEX_FILE}`, true);
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
      const response = await fetch(this.repoFileUrl(filePath), { cache: "no-store" });
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
    return noteName === DEFAULT_NOTE ? this.viewerPath : `${this.viewerPath}?note=${encodeURIComponent(noteName)}`;
  }

  hrefForFile(filePath) {
    return `${this.viewerPath}?file=${encodeURIComponent(filePath)}`;
  }

  viewerPathFromLocation(locationRef) {
    const pathname = String(locationRef?.pathname || "").replace(/\/+/g, "/");
    if (pathname.endsWith("/owner/notes.html")) {
      return "/owner/notes.html";
    }
    if (pathname.endsWith("/src/dev-runtime/admin/notes.html")) {
      return "/src/dev-runtime/admin/notes.html";
    }
    return VIEWER_PATH;
  }

  repoFileUrl(filePath) {
    return `/${String(filePath || "").replace(/^\/+/, "")}`;
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
    this.folderLinks?.replaceChildren();
    this.fileLinks?.replaceChildren();
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
    const currentFolderPath = listing.folderPath || this.adminNotesFolderPathFromValue(folderPath) || NOTES_DIRECTORY;
    this.updateCurrentFolder(currentFolderPath);
    const entries = listing.entries;
    const safeEntries = entries
      .map((entry) => this.safeDirectoryEntry(entry))
      .filter(Boolean)
      .filter((entry) => !(entry.path === currentFilePath && this.fileNameForPath(entry.path) === NOTE_INDEX_FILE))
      .sort((left, right) => left.label.localeCompare(right.label));
    const folderEntries = safeEntries.filter((entry) => entry.type === "folder");
    const fileEntries = safeEntries.filter((entry) => entry.type === "file");

    this.folderLinks?.replaceChildren();
    this.fileLinks?.replaceChildren();
    this.setFolderDiagnostic(listing.error || (safeEntries.length ? "" : "No Admin Notes files found in this folder."));
    folderEntries.forEach((entry) => {
      this.folderLinks?.append(this.directoryLink(entry));
    });
    fileEntries.forEach((entry) => {
      this.fileLinks?.append(this.directoryLink(entry));
    });
  }

  async directoryListingForFolder(folderPath) {
    const safeFolderPath = this.adminNotesFolderPathFromValue(folderPath);
    if (!safeFolderPath) {
      return {
        entries: [],
        error: "Current Folder listing is restricted to dev/archive/legacy-docs-build/admin-notes/."
      };
    }
    try {
      const response = await fetch(await this.directoryListingUrl(safeFolderPath), { cache: "no-store" });
      const listing = await response.json().catch(() => null);
      if (!response.ok) {
        return {
          entries: [],
          error: listing?.error || "Current Folder listing is unavailable. Start the local/dev server to read Admin Notes folders from the filesystem."
        };
      }
      return {
        entries: Array.isArray(listing.entries) ? listing.entries : [],
        folderPath: this.adminNotesFolderPathFromValue(listing.folderPath),
        error: listing?.ok === false
          ? listing.error || "Current Folder listing is unavailable. Start the local/dev server to read Admin Notes folders from the filesystem."
          : ""
      };
    } catch {
      return {
        entries: [],
        error: "Current Folder listing is unavailable. Start the local/dev server to read Admin Notes folders from the filesystem."
      };
    }
  }

  directoryListingUrl(folderPath) {
    const folder = folderPath.endsWith("/") ? folderPath.slice(0, -1) : folderPath;
    return resolveServerApiFetchUrl(`/dev/admin-notes/directory?folder=${encodeURIComponent(folder)}`);
  }

  setFolderDiagnostic(message) {
    if (this.folderDiagnostic) {
      this.folderDiagnostic.textContent = message;
    }
  }

  updateCurrentFolder(folderPath) {
    this.currentFolderPath = folderPath;
    if (this.currentFolder) {
      this.currentFolder.textContent = this.folderNameForPath(folderPath);
    }
    if (this.parentFolderButton) {
      const atRoot = folderPath === NOTES_DIRECTORY;
      this.parentFolderButton.disabled = atRoot;
      this.parentFolderButton.setAttribute("aria-disabled", String(atRoot));
    }
  }

  folderNameForPath(folderPath) {
    return String(folderPath || NOTES_DIRECTORY).split("/").filter(Boolean).pop() || "admin-notes";
  }

  parentFolderPath(folderPath) {
    const safeFolderPath = this.adminNotesFolderPathFromValue(folderPath);
    if (!safeFolderPath || safeFolderPath === NOTES_DIRECTORY) {
      return "";
    }
    const segments = safeFolderPath.split("/");
    segments.pop();
    const parentPath = segments.join("/");
    return this.adminNotesFolderPathFromValue(parentPath) || "";
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

if (!window.GameFoundrySessionGuard?.blocked) {
  new AdminNotesViewer().start();
}
