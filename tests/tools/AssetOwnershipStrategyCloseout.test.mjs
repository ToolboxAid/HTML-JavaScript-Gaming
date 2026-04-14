import assert from "node:assert/strict";
import { validateAssetOwnershipStrategy } from "../../scripts/validate-asset-ownership-strategy.mjs";

export async function run() {
  const result = await validateAssetOwnershipStrategy({ emitLogs: false });
  assert.equal(
    result.status,
    "valid",
    `Asset ownership strategy validation failed.\n${result.issues.join("\n")}`
  );
  assert.equal(
    result.reportPath.endsWith("docs/dev/reports/asset_ownership_strategy_validation.txt"),
    true
  );
}
