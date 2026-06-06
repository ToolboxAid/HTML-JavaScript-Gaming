const NOTES_DIRECTORY = "docs_build/dev/admin-notes";
const DEFAULT_NOTE = "note";
const NOTE_NAME_PATTERN = /^[A-Za-z0-9_-]+$/;

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
      const link = event.target.closest("[data-admin-note-link]");
      if (!link) {
        return;
      }
      event.preventDefault();
      this.openNote(link.dataset.adminNoteLink || DEFAULT_NOTE, true);
    });

    this.returnLink?.addEventListener("click", (event) => {
      event.preventDefault();
      this.openNote(DEFAULT_NOTE, true);
    });
  }

  start() {
    this.openNote(this.noteNameFromLocation(window.location), false);
  }

  noteNameFromLocation(locationRef) {
    const params = new URLSearchParams(locationRef.search);
    return this.noteNameFromValue(params.get("note") || DEFAULT_NOTE);
  }

  noteNameFromValue(value) {
    return String(value || DEFAULT_NOTE).replace(/\.txt$/i, "");
  }

  validNoteName(noteName) {
    return NOTE_NAME_PATTERN.test(noteName);
  }

  notePath(noteName) {
    return `${NOTES_DIRECTORY}/${noteName}.txt`;
  }

  async openNote(noteName, pushHistory) {
    const normalizedNoteName = this.noteNameFromValue(noteName);
    this.clearContent();
    this.setTitle(`${normalizedNoteName || DEFAULT_NOTE}.txt`);
    this.setReturnVisible(normalizedNoteName !== DEFAULT_NOTE);

    if (!this.validNoteName(normalizedNoteName)) {
      this.renderError(
        `Rejected note path "${noteName}". Use a bracket note name containing only letters, numbers, underscores, or hyphens.`
      );
      return;
    }

    const notePath = this.notePath(normalizedNoteName);
    try {
      const response = await fetch(notePath, { cache: "no-store" });
      if (!response.ok) {
        this.renderError(`Missing note file ${notePath}. Add this file under ${NOTES_DIRECTORY}/ or return to note.txt.`);
        return;
      }
      const text = await response.text();
      this.renderNote(text, normalizedNoteName);
      this.setStatus(`Loaded ${notePath}.`);
      if (pushHistory) {
        this.historyRef.pushState({}, "", this.hrefForNote(normalizedNoteName));
      }
    } catch {
      this.renderError(`Unable to load ${notePath}. Check the note file and reload the page.`);
    }
  }

  hrefForNote(noteName) {
    return noteName === DEFAULT_NOTE ? "admin/notes.html" : `admin/notes.html?note=${encodeURIComponent(noteName)}`;
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

  renderNote(text, noteName) {
    this.setTitle(`${noteName}.txt`);
    const lines = text.split(/\r?\n/);
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return;
      }
      const node = this.sectionHeading(trimmed)
        ? this.documentRef.createElement("h3")
        : this.documentRef.createElement("p");
      this.appendLinkedText(node, trimmed);
      this.content?.append(node);
    });
  }

  sectionHeading(text) {
    return ["Ideas", "Things to Fix", "Undecided Questions"].includes(text);
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

  linkOrText(noteName) {
    const normalizedNoteName = this.noteNameFromValue(noteName);
    if (!this.validNoteName(normalizedNoteName)) {
      return this.documentRef.createTextNode(`[${noteName}]`);
    }
    const link = this.documentRef.createElement("a");
    link.href = this.hrefForNote(normalizedNoteName);
    link.dataset.adminNoteLink = normalizedNoteName;
    link.textContent = `[${noteName}]`;
    return link;
  }
}

new AdminNotesViewer().start();
