import assert from "node:assert/strict";
import { buildAssetMarketplace, summarizeAssetMarketplace } from "../../tools/shared/assetMarketplace.js";

export async function run() {
  const result = buildAssetMarketplace({
    currentSchemaVersion: 1,
    listings: [
      {
        listingId: "market.sprite.hero",
        assetId: "sprite.hero",
        assetType: "sprite",
        version: 1,
        author: "toolbox"
      }
    ]
  });
  assert.equal(result.marketplace.status, "ready");
  assert.equal(result.marketplace.listings.length, 1);
  assert.equal(summarizeAssetMarketplace(result), "Asset marketplace ready with 1 listings.");
}
