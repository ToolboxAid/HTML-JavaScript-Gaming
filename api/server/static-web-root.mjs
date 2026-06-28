import fs from "node:fs/promises";
import path from "node:path";

export const LOCAL_WEB_ROOT_ENV = "GAMEFOUNDRY_LOCAL_WEB_ROOT";
export const WWW_LOCAL_WEB_ROOT = "www";
export const REPO_ROOT_LOCAL_WEB_ROOT = ".";
export const DEFAULT_LOCAL_WEB_ROOT = WWW_LOCAL_WEB_ROOT;

export function isInsideRoot(rootPath, absolutePath) {
  const relativePath = path.relative(rootPath, absolutePath);
  return relativePath === "" || (!relativePath.startsWith("..") && !path.isAbsolute(relativePath));
}

function normalizeWebRootValue(value) {
  const normalizedValue = String(value || "").trim();
  if (!normalizedValue) {
    return DEFAULT_LOCAL_WEB_ROOT;
  }
  if (normalizedValue === "." || normalizedValue === "root" || normalizedValue === "repo-root") {
    return REPO_ROOT_LOCAL_WEB_ROOT;
  }
  return normalizedValue.replace(/\\/g, "/").replace(/^\/+/, "").replace(/\/+$/, "") || DEFAULT_LOCAL_WEB_ROOT;
}

export function resolveLocalWebRoot({
  env = process.env,
  repoRoot,
  webRoot,
} = {}) {
  if (!repoRoot) {
    throw new Error("resolveLocalWebRoot requires repoRoot.");
  }
  const resolvedRepoRoot = path.resolve(repoRoot);
  const configuredValue = normalizeWebRootValue(webRoot ?? env?.[LOCAL_WEB_ROOT_ENV]);
  const absolutePath = path.resolve(resolvedRepoRoot, configuredValue);
  if (!isInsideRoot(resolvedRepoRoot, absolutePath)) {
    throw new Error(`${LOCAL_WEB_ROOT_ENV} must resolve inside the repository root.`);
  }
  return Object.freeze({
    absolutePath,
    envName: LOCAL_WEB_ROOT_ENV,
    relativePath: configuredValue,
    source: webRoot === undefined && env?.[LOCAL_WEB_ROOT_ENV] === undefined ? "default" : "configured",
  });
}

export function resolveBrowserRoutePath(decodedPath) {
  const normalizedPath = path.normalize(decodedPath || "/").replace(/^(\.\.[/\\])+/, "");
  const webPath = normalizedPath.replace(/\\/g, "/");
  if (webPath === "/") {
    return "/index.html";
  }
  if (webPath === "/tools" || webPath.startsWith("/tools/")) {
    return `/toolbox${webPath.slice("/tools".length)}`;
  }
  if (webPath === "/admin/admin-notes.html") {
    return "/src/dev-runtime/admin/notes.html";
  }
  return webPath;
}

function staticRouteCandidateRoots({ repoRoot, webRootConfig }) {
  const roots = [webRootConfig.absolutePath];
  if (webRootConfig.absolutePath !== repoRoot) {
    roots.push(repoRoot);
  }
  return roots;
}

export async function resolveStaticRouteTarget({
  decodedPath,
  fsStat = fs.stat,
  repoRoot,
  webRoot,
} = {}) {
  const resolvedRepoRoot = path.resolve(repoRoot);
  const webRootConfig = resolveLocalWebRoot({ repoRoot: resolvedRepoRoot, webRoot });
  const routePath = resolveBrowserRoutePath(decodedPath);
  for (const rootPath of staticRouteCandidateRoots({ repoRoot: resolvedRepoRoot, webRootConfig })) {
    const absolutePath = path.resolve(rootPath, `.${routePath}`);
    if (!isInsideRoot(rootPath, absolutePath)) {
      continue;
    }
    let targetPath = absolutePath;
    let stat = await fsStat(targetPath).catch(() => null);
    if (stat && stat.isDirectory()) {
      targetPath = path.join(targetPath, "index.html");
      stat = await fsStat(targetPath).catch(() => null);
    }
    if (stat && stat.isFile()) {
      return Object.freeze({
        routePath,
        targetPath,
        webRoot: webRootConfig,
      });
    }
  }
  return Object.freeze({
    routePath,
    targetPath: "",
    webRoot: webRootConfig,
  });
}
