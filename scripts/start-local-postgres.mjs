#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import process from "node:process";

const CONTAINER_NAME = "gamefoundry-local-postgres";
const IMAGE_NAME = "postgres:16";
const VOLUME_NAME = "gamefoundry-local-postgres-data";
const LOCAL_DATABASE_URL = "postgresql://postgres:postgres@127.0.0.1:5432/gamefoundry_dev";
const READY_ATTEMPTS = 30;
const READY_WAIT_MS = 1000;

function runDocker(args, { allowFailure = false } = {}) {
  const result = spawnSync("docker", args, {
    encoding: "utf8",
    windowsHide: true,
  });
  if (!allowFailure && result.status !== 0) {
    const message = [result.stderr, result.stdout].filter(Boolean).join("\n").trim();
    throw new Error(message || `docker ${args.join(" ")} failed.`);
  }
  return {
    ok: result.status === 0,
    output: String(result.stdout || "").trim(),
    error: String(result.stderr || "").trim(),
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function assertDockerReady() {
  const version = runDocker(["info", "--format", "{{.ServerVersion}}"], { allowFailure: true });
  if (!version.ok || !version.output) {
    throw new Error("Docker daemon is not reachable. Start Docker Desktop, then rerun npm run dev:local-postgres.");
  }
  return version.output;
}

function containerName() {
  return runDocker([
    "ps",
    "-a",
    "--filter",
    `name=^/${CONTAINER_NAME}$`,
    "--format",
    "{{.Names}}",
  ], { allowFailure: true }).output;
}

function runningContainerName() {
  return runDocker([
    "ps",
    "--filter",
    `name=^/${CONTAINER_NAME}$`,
    "--format",
    "{{.Names}}",
  ], { allowFailure: true }).output;
}

function ensureContainer() {
  if (runningContainerName() === CONTAINER_NAME) {
    return "already-running";
  }
  if (containerName() === CONTAINER_NAME) {
    runDocker(["start", CONTAINER_NAME]);
    return "started-existing";
  }
  runDocker([
    "run",
    "--detach",
    "--name",
    CONTAINER_NAME,
    "--env",
    "POSTGRES_PASSWORD=postgres",
    "--env",
    "POSTGRES_DB=gamefoundry_dev",
    "--publish",
    "127.0.0.1:5432:5432",
    "--volume",
    `${VOLUME_NAME}:/var/lib/postgresql/data`,
    IMAGE_NAME,
  ]);
  return "created";
}

async function waitForReady() {
  for (let attempt = 1; attempt <= READY_ATTEMPTS; attempt += 1) {
    const ready = runDocker([
      "exec",
      CONTAINER_NAME,
      "pg_isready",
      "-h",
      "127.0.0.1",
      "-U",
      "postgres",
      "-d",
      "gamefoundry_dev",
    ], { allowFailure: true });
    if (ready.ok && ready.output.includes("accepting connections")) {
      return attempt;
    }
    await sleep(READY_WAIT_MS);
  }
  throw new Error(`PostgreSQL did not become ready after ${READY_ATTEMPTS} second(s).`);
}

async function main() {
  const dockerVersion = assertDockerReady();
  const state = ensureContainer();
  const readyAttempt = await waitForReady();

  console.log(`PASS - Docker daemon reachable (${dockerVersion}).`);
  console.log(`PASS - Local Postgres container ${CONTAINER_NAME} ${state}.`);
  console.log(`PASS - PostgreSQL accepted connections after readiness attempt ${readyAttempt}.`);
  console.log(`PASS - Runtime database URL: ${LOCAL_DATABASE_URL}`);
}

await main();
