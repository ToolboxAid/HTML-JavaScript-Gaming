function devRuntimeAllowed() {
  const host = window.location.hostname;
  return window.GameFoundryDevRuntime?.enabled === true ||
    window.location.protocol === "file:" ||
    host === "localhost" ||
    host === "127.0.0.1";
}

async function loadLocalLoginSession() {
  if (!devRuntimeAllowed()) {
    return;
  }
  await import("../../../src/dev-runtime/auth/login-session.js");
}

loadLocalLoginSession().catch((error) => {
  console.error("Unable to load Local login session.", error);
});
