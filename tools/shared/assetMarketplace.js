import { buildProjectVersioning } from "./projectVersioning.js";
import { cloneJson } from "../../src/shared/utils/jsonUtils.js";

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

function normalizeListing(rawListing) {
  const listing = rawListing && typeof rawListing === "object" ? rawListing : {};
  return {
    listingId: sanitizeText(listing.listingId),
    assetId: sanitizeText(listing.assetId),
    assetType: sanitizeText(listing.assetType),
    version: Number.isFinite(listing.version) ? listing.version : 1,
    author: sanitizeText(listing.author) || "unknown",
    packageManifest: listing.packageManifest && typeof listing.packageManifest === "object" ? cloneJson(listing.packageManifest) : null
  };
}

export function summarizeAssetMarketplace(result) {
  const listings = Array.isArray(result?.marketplace?.listings) ? result.marketplace.listings : [];
  if (result?.marketplace?.status !== "ready") {
    return "Asset marketplace unavailable.";
  }
  return `Asset marketplace ready with ${listings.length} listings.`;
}

export function buildAssetMarketplace(options = {}) {
  const rawListings = Array.isArray(options.listings) ? options.listings : [];
  const listings = rawListings
    .map((listing) => normalizeListing(listing))
    .filter((listing) => listing.listingId && listing.assetId)
    .sort((left, right) => {
      const byAssetType = left.assetType.localeCompare(right.assetType);
      if (byAssetType !== 0) {
        return byAssetType;
      }
      const byAssetId = left.assetId.localeCompare(right.assetId);
      if (byAssetId !== 0) {
        return byAssetId;
      }
      return left.listingId.localeCompare(right.listingId);
    });

  const reports = [];
  const acceptedListings = listings.map((listing) => {
    const versioning = buildProjectVersioning({
      currentSchemaVersion: Number.isFinite(options.currentSchemaVersion) ? options.currentSchemaVersion : 1,
      projectDocument: { schema: `marketplace.${listing.assetType || "asset"}`, version: listing.version },
      packageManifest: listing.packageManifest
    });
    const compatible = versioning.versioning.status !== "migration-needed";
    reports.push(createReport(
      compatible ? "info" : "warning",
      compatible ? "MARKETPLACE_LISTING_READY" : "MARKETPLACE_LISTING_REVIEW",
      `${listing.listingId} (${listing.assetId}) ${compatible ? "is ready for marketplace consumption" : "requires review before marketplace consumption"}.`
    ));
    return {
      ...listing,
      compatible,
      versioning
    };
  });

  return {
    marketplace: {
      status: "ready",
      listings: acceptedListings,
      reports,
      reportText: [
        summarizeAssetMarketplace({ marketplace: { status: "ready", listings: acceptedListings } }),
        ...acceptedListings.map((listing) => `${listing.listingId}: ${listing.assetId} (${listing.assetType}) v${listing.version} by ${listing.author}${listing.compatible ? "" : " [review]"}`),
        ...reports.map((report) => `[${report.level}] ${report.code}: ${report.message}`)
      ].join("\n")
    }
  };
}
