import assert from "node:assert/strict";
import { validateGamesTemplateContract } from "../../scripts/validate-games-template-contract.mjs";

export async function run() {
  const result = await validateGamesTemplateContract({ emitLogs: false });
  assert.equal(
    result.status,
    "valid",
    `Games template contract validator failed.\n${result.issues.join("\n")}`
  );
  assert.equal(result.reportPath.endsWith("docs/dev/reports/games_template_contract_validation.txt"), true);
}
