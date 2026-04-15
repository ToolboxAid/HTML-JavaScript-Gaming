import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import {
  REQUIRED_TEST_DIRECTORIES,
  UNIT_COVERAGE_ANCHORS,
  INTEGRATION_COVERAGE_ANCHORS,
  FIXTURE_ARTIFACTS
} from "../helpers/testCoverageCatalog.mjs";

const REPO_ROOT = path.resolve(".");

function assertRepoFile(relativePath) {
  const absolutePath = path.join(REPO_ROOT, relativePath);
  assert.equal(existsSync(absolutePath), true, `Missing file: ${relativePath}`);
  assert.equal(statSync(absolutePath).isFile(), true, `Not a file: ${relativePath}`);
}

function assertRepoDirectory(relativePath) {
  const absolutePath = path.join(REPO_ROOT, relativePath);
  assert.equal(existsSync(absolutePath), true, `Missing directory: ${relativePath}`);
  assert.equal(statSync(absolutePath).isDirectory(), true, `Not a directory: ${relativePath}`);
}

export function run() {
  REQUIRED_TEST_DIRECTORIES.forEach((dir) => {
    assertRepoDirectory(`tests/${dir}`);
  });

  UNIT_COVERAGE_ANCHORS.forEach((filePath) => {
    assertRepoFile(filePath);
  });

  INTEGRATION_COVERAGE_ANCHORS.forEach((filePath) => {
    assertRepoFile(filePath);
  });

  FIXTURE_ARTIFACTS.forEach((filePath) => {
    assertRepoFile(filePath);
  });

  const runTestsPath = path.join(REPO_ROOT, "tests", "run-tests.mjs");
  const runTestsText = readFileSync(runTestsPath, "utf8");
  assert.match(runTestsText, /runTestsValidationCombinedPass/);
  assert.match(runTestsText, /\['TestsValidationCombinedPass', runTestsValidationCombinedPass\]/);
}
