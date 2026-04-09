import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");

export async function run() {
  const result = spawnSync(
    process.execPath,
    ["scripts/validate-games-template-contract.mjs"],
    {
      cwd: repoRoot,
      encoding: "utf8"
    }
  );

  const output = [result.stdout || "", result.stderr || ""].join("\n");
  assert.equal(result.status, 0, `Games template contract validator failed.\n${output}`);
  assert.match(output, /GAMES_TEMPLATE_CONTRACT_VALID/, "Validator did not report valid status.");
}
