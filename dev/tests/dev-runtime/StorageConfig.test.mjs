import assert from "node:assert/strict";
import test from "node:test";
import {
  STORAGE_PROJECTS_ALLOWED_PREFIXES,
  loadStorageConfig,
  normalizeStorageProjectsPrefix,
} from "../../../api/storage/storage-config.mjs";

function validStorageEnv(projectsPrefix = "/dev/projects/") {
  return {
    GAMEFOUNDRY_STORAGE_ACCESS_KEY_ID: "test-access-key",
    GAMEFOUNDRY_STORAGE_BUCKET: "gamefoundry-test-assets",
    GAMEFOUNDRY_STORAGE_ENDPOINT: "https://r2.example.invalid",
    GAMEFOUNDRY_STORAGE_PROJECTS_PREFIX: projectsPrefix,
    GAMEFOUNDRY_STORAGE_SECRET_ACCESS_KEY: "test-secret-key",
  };
}

test("storage projects prefix normalizes slash variants", () => {
  assert.equal(normalizeStorageProjectsPrefix("local/projects"), "/local/projects/");
  assert.equal(normalizeStorageProjectsPrefix("dev/projects"), "/dev/projects/");
  assert.equal(normalizeStorageProjectsPrefix("\\ist\\projects\\"), "/ist/projects/");
  assert.equal(normalizeStorageProjectsPrefix(" /uat/projects/ "), "/uat/projects/");
  assert.equal(normalizeStorageProjectsPrefix("prod/projects/"), "/prod/projects/");
});

test("storage config accepts only approved project storage prefixes", () => {
  assert.deepEqual(STORAGE_PROJECTS_ALLOWED_PREFIXES, [
    "/local/projects/",
    "/dev/projects/",
    "/ist/projects/",
    "/uat/projects/",
    "/prod/projects/",
  ]);

  STORAGE_PROJECTS_ALLOWED_PREFIXES.forEach((projectsPrefix) => {
    const config = loadStorageConfig(validStorageEnv(projectsPrefix));
    assert.equal(config.configured, true);
    assert.equal(config.safe.projectsPrefix, projectsPrefix);
  });
});

test("storage config rejects unapproved project storage prefixes", () => {
  ["/production/projects/", "/qa/projects/", "/projects/"].forEach((projectsPrefix) => {
    const config = loadStorageConfig(validStorageEnv(projectsPrefix));
    assert.equal(config.configured, false);
    assert.equal(config.safe.projectsPrefix, projectsPrefix);
    assert.match(config.validationError, /GAMEFOUNDRY_STORAGE_PROJECTS_PREFIX must be one of/);
    assert.equal(config.validationError.includes("/local/projects/"), true);
    assert.equal(config.validationError.includes("/prod/projects/"), true);
  });
});

test("storage config reports missing project storage prefix", () => {
  const env = validStorageEnv("");
  const config = loadStorageConfig(env);
  assert.equal(config.configured, false);
  assert.deepEqual(config.missingKeys, ["GAMEFOUNDRY_STORAGE_PROJECTS_PREFIX"]);
  assert.equal(config.safe.projectsPrefix, "");
});

test("storage config preserves safe partial values without exposing credentials", () => {
  const config = loadStorageConfig({
    GAMEFOUNDRY_STORAGE_BUCKET: "gamefoundry-test-assets",
    GAMEFOUNDRY_STORAGE_ENDPOINT: "https://r2.example.invalid/path-ignored",
    GAMEFOUNDRY_STORAGE_PROJECTS_PREFIX: "/local/projects/",
  });
  assert.equal(config.configured, false);
  assert.deepEqual(config.missingKeys, [
    "GAMEFOUNDRY_STORAGE_ACCESS_KEY_ID",
    "GAMEFOUNDRY_STORAGE_SECRET_ACCESS_KEY",
  ]);
  assert.deepEqual(config.safe, {
    bucket: "gamefoundry-test-assets",
    endpoint: "https://r2.example.invalid",
    projectsPrefix: "/local/projects/",
  });
  assert.equal(JSON.stringify(config.safe).includes("ACCESS_KEY"), false);
  assert.equal(JSON.stringify(config.safe).includes("SECRET"), false);
});

test("storage safe config does not expose credential values", () => {
  const env = validStorageEnv("/prod/projects/");
  const config = loadStorageConfig(env);
  assert.equal(config.configured, true);
  assert.deepEqual(config.safe, {
    bucket: "gamefoundry-test-assets",
    endpoint: "https://r2.example.invalid",
    projectsPrefix: "/prod/projects/",
  });
  assert.equal(Object.hasOwn(config.safe, "accessKeyId"), false);
  assert.equal(Object.hasOwn(config.safe, "secretAccessKey"), false);
  assert.equal(JSON.stringify(config.safe).includes("test-access-key"), false);
  assert.equal(JSON.stringify(config.safe).includes("test-secret-key"), false);
});
