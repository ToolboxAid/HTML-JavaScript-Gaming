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

function readSchemaVersion(projectDocument) {
  return Number.isFinite(projectDocument?.version) ? projectDocument.version : 1;
}

function readSchemaName(projectDocument, fallback = "project") {
  return sanitizeText(projectDocument?.schema) || fallback;
}

export function summarizeProjectVersioning(result) {
  const summary = sanitizeText(result?.versioning?.summary);
  return summary || "Project versioning unavailable.";
}

export function buildProjectVersioning(options = {}) {
  const currentSchemaVersion = Number.isFinite(options.currentSchemaVersion) ? options.currentSchemaVersion : 1;
  const reports = [];
  const projectDocument = options.projectDocument && typeof options.projectDocument === "object"
    ? options.projectDocument
    : {};
  const packageManifest = options.packageManifest && typeof options.packageManifest === "object"
    ? options.packageManifest
    : null;
  const projectSchema = readSchemaName(projectDocument, "project");
  const projectVersion = readSchemaVersion(projectDocument);
  const migrationSteps = [];

  if (projectVersion < currentSchemaVersion) {
    migrationSteps.push(`Upgrade ${projectSchema} from v${projectVersion} to v${currentSchemaVersion}.`);
    reports.push(createReport("warning", "PROJECT_VERSION_OUTDATED", `Project schema version ${projectVersion} is older than the current supported version ${currentSchemaVersion}.`));
  } else {
    reports.push(createReport("info", "PROJECT_VERSION_CURRENT", `Project schema version ${projectVersion} matches the current supported version.`));
  }

  if (packageManifest?.package) {
    const packageVersion = Number.isFinite(packageManifest.package.version) ? packageManifest.package.version : 1;
    if (packageVersion < currentSchemaVersion) {
      migrationSteps.push(`Repackage output to emit package version ${currentSchemaVersion}.`);
      reports.push(createReport("warning", "PACKAGE_VERSION_OUTDATED", `Package manifest version ${packageVersion} is older than the current supported version ${currentSchemaVersion}.`));
    } else {
      reports.push(createReport("info", "PACKAGE_VERSION_CURRENT", `Package manifest version ${packageVersion} is compatible with the current baseline.`));
    }
  }

  const previousSnapshot = options.previousVersionSnapshot && typeof options.previousVersionSnapshot === "object"
    ? options.previousVersionSnapshot
    : null;
  const diffLines = [];
  if (previousSnapshot) {
    const previousProjectVersion = Number.isFinite(previousSnapshot.projectVersion) ? previousSnapshot.projectVersion : 1;
    if (previousProjectVersion !== projectVersion) {
      diffLines.push(`projectVersion ${previousProjectVersion} -> ${projectVersion}`);
    }
    const previousPackageVersion = Number.isFinite(previousSnapshot.packageVersion) ? previousSnapshot.packageVersion : 1;
    const packageVersion = Number.isFinite(packageManifest?.package?.version) ? packageManifest.package.version : 1;
    if (previousPackageVersion !== packageVersion) {
      diffLines.push(`packageVersion ${previousPackageVersion} -> ${packageVersion}`);
    }
  }

  const status = migrationSteps.length > 0 ? "migration-needed" : "compatible";
  const summary = status === "compatible"
    ? `Project versioning compatible at schema v${projectVersion}.`
    : `Project versioning requires ${migrationSteps.length} migration step${migrationSteps.length === 1 ? "" : "s"}.`;

  return {
    versioning: {
      status,
      projectSchema,
      projectVersion,
      packageVersion: Number.isFinite(packageManifest?.package?.version) ? packageManifest.package.version : null,
      migrationSteps,
      diffLines,
      reports,
      summary
    }
  };
}
