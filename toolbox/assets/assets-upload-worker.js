const DEFAULT_CHUNK_SIZE_BYTES = 64 * 1024;
const MAX_CHUNK_SIZE_BYTES = 1024 * 1024;

function normalizedPositiveInteger(value, fallback, maximum = Number.POSITIVE_INFINITY) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue) || numberValue <= 0) {
    return fallback;
  }
  return Math.min(maximum, Math.floor(numberValue));
}

function delay(milliseconds) {
  const delayMilliseconds = Math.max(0, Number(milliseconds) || 0);
  if (!delayMilliseconds) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    setTimeout(resolve, delayMilliseconds);
  });
}

function combineChunks(chunks, totalBytes) {
  const output = new Uint8Array(totalBytes);
  let offset = 0;
  chunks.forEach((chunk) => {
    output.set(chunk, offset);
    offset += chunk.byteLength;
  });
  return output;
}

function base64FromBytes(bytes) {
  const chunkSize = 0x8000;
  let binary = "";
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
}

function progressBytesForWritePending(bytesRead, totalBytes) {
  if (totalBytes <= 0) {
    return 0;
  }
  if (bytesRead >= totalBytes) {
    return Math.max(0, totalBytes - 1);
  }
  return bytesRead;
}

async function processUploadFile({ chunkSizeBytes, file, requestId, throttleMs }) {
  const totalBytes = Number(file?.size) || 0;
  const fileName = file?.name || "upload";
  const mimeType = file?.type || "";
  const chunkSize = normalizedPositiveInteger(chunkSizeBytes, DEFAULT_CHUNK_SIZE_BYTES, MAX_CHUNK_SIZE_BYTES);
  const chunks = [];
  let bytesRead = 0;

  self.postMessage({
    fileName,
    requestId,
    totalBytes,
    type: "started"
  });

  await delay(throttleMs);

  while (bytesRead < totalBytes) {
    const end = Math.min(totalBytes, bytesRead + chunkSize);
    const chunk = new Uint8Array(await file.slice(bytesRead, end).arrayBuffer());
    chunks.push(chunk);
    bytesRead += chunk.byteLength;
    self.postMessage({
      bytesUploaded: progressBytesForWritePending(bytesRead, totalBytes),
      fileName,
      requestId,
      totalBytes,
      type: "progress"
    });
    await delay(throttleMs);
  }

  const bytes = combineChunks(chunks, totalBytes);
  self.postMessage({
    fileName,
    payload: {
      fileContentBase64: base64FromBytes(bytes),
      hasFileBytes: true,
      mimeType,
      name: fileName,
      size: totalBytes,
      type: mimeType
    },
    requestId,
    totalBytes,
    type: "complete"
  });
}

self.addEventListener("message", (event) => {
  const message = event.data || {};
  if (message.type !== "process-file") {
    return;
  }
  processUploadFile(message).catch((error) => {
    self.postMessage({
      fileName: message.file?.name || "upload",
      message: error instanceof Error ? error.message : "Upload worker failed.",
      requestId: message.requestId,
      type: "error"
    });
  });
});
