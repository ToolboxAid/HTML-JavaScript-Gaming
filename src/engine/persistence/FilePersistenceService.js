/*
Toolbox Aid
David Quesenberry
05/20/2026
FilePersistenceService.js
*/
function resolveWindowRef(windowRef = null) {
  return windowRef || globalThis.window || globalThis;
}

function resolveDocumentRef(documentRef = null, windowRef = null) {
  return documentRef || resolveWindowRef(windowRef).document || globalThis.document || null;
}

function resolveFileReader(file, windowRef = null) {
  return file?.ownerDocument?.defaultView?.FileReader
    || resolveWindowRef(windowRef).FileReader
    || globalThis.FileReader
    || null;
}

export async function readFileText(file, { errorMessage = "Unable to read selected file.", windowRef = null } = {}) {
  if (!file) {
    throw new Error(errorMessage);
  }
  if (typeof file.text === "function") {
    return String(await file.text());
  }

  const FileReaderCtor = resolveFileReader(file, windowRef);
  if (typeof FileReaderCtor !== "function") {
    throw new Error(errorMessage);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReaderCtor();
    reader.onerror = () => reject(new Error(errorMessage));
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.readAsText(file);
  });
}

export async function readFileHandleText(fileHandle, {
  handleErrorMessage = "file handle cannot be read",
  textErrorMessage = "file text read-back is unavailable"
} = {}) {
  if (!fileHandle || typeof fileHandle.getFile !== "function") {
    throw new Error(handleErrorMessage);
  }

  const file = await fileHandle.getFile();
  if (!file || typeof file.text !== "function") {
    throw new Error(textErrorMessage);
  }

  return {
    file,
    text: String(await file.text())
  };
}

export async function writeFileHandleText(fileHandle, content, {
  handleErrorMessage = "file handle cannot be written"
} = {}) {
  if (!fileHandle || typeof fileHandle.createWritable !== "function") {
    throw new Error(handleErrorMessage);
  }

  const writable = await fileHandle.createWritable();
  await writable.write(String(content));
  await writable.close();
  return true;
}

export function downloadBlobFile(blob, fileName, {
  appendToBody = false,
  documentRef = null,
  windowRef = null
} = {}) {
  const browserWindow = resolveWindowRef(windowRef);
  const documentObject = resolveDocumentRef(documentRef, browserWindow);
  const urlApi = browserWindow.URL || browserWindow.webkitURL || globalThis.URL;
  if (
    !blob
    || !documentObject
    || typeof documentObject.createElement !== "function"
    || typeof urlApi?.createObjectURL !== "function"
    || typeof urlApi?.revokeObjectURL !== "function"
  ) {
    return false;
  }

  const url = urlApi.createObjectURL(blob);
  const link = documentObject.createElement("a");
  link.href = url;
  link.download = fileName;
  link.rel = "noopener";
  if (appendToBody && documentObject.body) {
    documentObject.body.append(link);
  }
  link.click();
  if (appendToBody && typeof link.remove === "function") {
    link.remove();
  }
  urlApi.revokeObjectURL(url);
  return true;
}

export function downloadTextFile(content, fileName, {
  appendToBody = false,
  documentRef = null,
  mimeType = "application/json",
  windowRef = null
} = {}) {
  const browserWindow = resolveWindowRef(windowRef);
  const documentObject = resolveDocumentRef(documentRef, browserWindow);
  const BlobCtor = browserWindow.Blob || globalThis.Blob;
  const urlApi = browserWindow.URL || browserWindow.webkitURL || globalThis.URL;
  if (
    !documentObject
    || typeof documentObject.createElement !== "function"
    || typeof BlobCtor !== "function"
    || typeof urlApi?.createObjectURL !== "function"
    || typeof urlApi?.revokeObjectURL !== "function"
  ) {
    return false;
  }

  const blob = new BlobCtor([String(content)], { type: mimeType });
  return downloadBlobFile(blob, fileName, { appendToBody, documentRef, windowRef });
}
