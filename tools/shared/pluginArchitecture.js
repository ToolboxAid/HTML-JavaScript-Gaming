import { cloneJson } from '../../src/shared/utils/jsonUtils.js';

function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function createReport(level, code, message) {
  return {
    level: sanitizeText(level) || "info",
    code: sanitizeText(code),
    message: sanitizeText(message)
  };
}

function validateHostPackage(hostPackageManifest) {
  const pkg = hostPackageManifest?.package;
  if (!pkg || typeof pkg !== "object" || !Array.isArray(pkg.assets)) {
    throw new Error("Host package manifest is required.");
  }
  return pkg;
}

function normalizePlugin(pluginManifest) {
  const plugin = pluginManifest?.plugin;
  if (!plugin || typeof plugin !== "object") {
    throw new Error("Plugin manifest is missing plugin root.");
  }
  const pluginId = sanitizeText(plugin.id);
  if (!pluginId) {
    throw new Error("Plugin manifest is missing plugin.id.");
  }
  const assets = Array.isArray(plugin.assets) ? plugin.assets : [];
  assets.forEach((asset, index) => {
    const assetId = sanitizeText(asset?.id);
    if (!assetId) {
      throw new Error(`Plugin asset at index ${index} is missing id.`);
    }
    if (!assetId.startsWith(`${pluginId}.`)) {
      throw new Error(`Plugin asset ${assetId} must be namespaced with ${pluginId}.`);
    }
  });
  const dependencies = Array.isArray(plugin.dependencies) ? plugin.dependencies : [];
  const roots = Array.isArray(plugin.roots) ? plugin.roots : [];
  return {
    id: pluginId,
    version: Number.isFinite(plugin.version) ? plugin.version : 1,
    assets: cloneJson(assets),
    dependencies: cloneJson(dependencies),
    roots: cloneJson(roots)
  };
}

export function summarizePluginArchitecture(result) {
  const plugins = Array.isArray(result?.plugins?.acceptedPlugins) ? result.plugins.acceptedPlugins : [];
  if (result?.plugins?.status === "ready") {
    return `Plugin architecture ready with ${plugins.length} accepted plugins.`;
  }
  if (result?.plugins?.status === "failed") {
    return `Plugin architecture failed at ${sanitizeText(result.plugins.failedAt) || "plugin"}.`;
  }
  return "Plugin architecture unavailable.";
}

export function buildPluginArchitecture(options = {}) {
  const reports = [];
  try {
    const hostPackage = cloneJson(options.hostPackageManifest);
    const pkg = validateHostPackage(hostPackage);
    const acceptedPlugins = [];
    const reservedAssetIds = new Set(pkg.assets.map((asset) => sanitizeText(asset?.id)).filter(Boolean));
    const pluginManifests = Array.isArray(options.pluginManifests) ? options.pluginManifests : [];

    pluginManifests
      .map((manifest) => normalizePlugin(manifest))
      .sort((left, right) => left.id.localeCompare(right.id))
      .forEach((plugin) => {
        plugin.assets.forEach((asset) => {
          const assetId = sanitizeText(asset?.id);
          if (reservedAssetIds.has(assetId)) {
            throw new Error(`Plugin asset conflict detected for ${assetId}.`);
          }
          reservedAssetIds.add(assetId);
        });

        plugin.dependencies.forEach((dependency, index) => {
          const from = sanitizeText(dependency?.from);
          const to = sanitizeText(dependency?.to);
          if (!from || !to) {
            throw new Error(`Plugin dependency at index ${index} is incomplete for ${plugin.id}.`);
          }
          const validFrom = plugin.assets.some((asset) => sanitizeText(asset?.id) === from);
          const validTo = reservedAssetIds.has(to) || pkg.assets.some((asset) => sanitizeText(asset?.id) === to);
          if (!validFrom || !validTo) {
            throw new Error(`Plugin dependency ${from} -> ${to} is outside the allowed isolation boundary.`);
          }
        });

        acceptedPlugins.push(plugin);
      });

    const mergedManifest = cloneJson(hostPackage);
    mergedManifest.plugins = {
      version: 1,
      entries: acceptedPlugins.map((plugin) => ({
        id: plugin.id,
        version: plugin.version,
        roots: plugin.roots.slice().sort((left, right) => sanitizeText(left?.id).localeCompare(sanitizeText(right?.id)))
      }))
    };
    acceptedPlugins.forEach((plugin) => {
      mergedManifest.package.assets.push(...plugin.assets);
      mergedManifest.package.dependencies.push(...plugin.dependencies);
      plugin.roots.forEach((root) => {
        mergedManifest.package.roots.push(root);
      });
    });
    mergedManifest.package.assets.sort((left, right) => sanitizeText(left?.id).localeCompare(sanitizeText(right?.id)));
    mergedManifest.package.dependencies.sort((left, right) => {
      const byFrom = sanitizeText(left?.from).localeCompare(sanitizeText(right?.from));
      if (byFrom !== 0) {
        return byFrom;
      }
      const byType = sanitizeText(left?.type).localeCompare(sanitizeText(right?.type));
      if (byType !== 0) {
        return byType;
      }
      return sanitizeText(left?.to).localeCompare(sanitizeText(right?.to));
    });
    mergedManifest.package.roots.sort((left, right) => sanitizeText(left?.id).localeCompare(sanitizeText(right?.id)));

    reports.push(createReport("info", "PLUGIN_PLAN_READY", `Accepted ${acceptedPlugins.length} plugin manifest${acceptedPlugins.length === 1 ? "" : "s"} for packaging and runtime participation.`));
    return {
      plugins: {
        status: "ready",
        acceptedPlugins,
        mergedPackageManifest: mergedManifest,
        reports
      }
    };
  } catch (error) {
    reports.push(createReport("error", "PLUGIN_PLAN_FAILED", error instanceof Error ? error.message : "Plugin architecture failed."));
    return {
      plugins: {
        status: "failed",
        failedAt: "plugin",
        acceptedPlugins: [],
        reports
      }
    };
  }
}
