export class MarketplaceCategoryError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "MarketplaceCategoryError";
    this.statusCode = statusCode;
  }
}

export const APPROVED_MARKETPLACE_CATEGORIES = Object.freeze([
  Object.freeze({ code: "games", displayName: "Games" }),
  Object.freeze({ code: "assets", displayName: "Assets" }),
  Object.freeze({ code: "audio", displayName: "Audio" }),
  Object.freeze({ code: "music", displayName: "Music" }),
  Object.freeze({ code: "worlds", displayName: "Worlds" }),
  Object.freeze({ code: "templates", displayName: "Templates" }),
  Object.freeze({ code: "tutorials", displayName: "Tutorials" }),
]);

const APPROVED_LABEL_BY_CODE = new Map(APPROVED_MARKETPLACE_CATEGORIES.map((category) => [
  category.code,
  category.displayName,
]));
const URL_SAFE_CODE_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function categoryDiagnostic(status, code, message) {
  return {
    code,
    message,
    status,
  };
}

function normalizedCategoryCode(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizedDisplayName(value) {
  return String(value || "").trim();
}

function marketplaceCategoryRows(tables) {
  if (!tables || typeof tables !== "object") {
    throw new MarketplaceCategoryError("Marketplace categories require database tables.", 500);
  }
  if (!Array.isArray(tables.marketplace_categories)) {
    throw new MarketplaceCategoryError("marketplace_categories table is required.", 500);
  }
  return tables.marketplace_categories;
}

function activeCategory(row) {
  return row?.active !== false;
}

function validatedCategory(row, index, diagnostics, seenCodes) {
  const code = normalizedCategoryCode(row?.code);
  const displayName = normalizedDisplayName(row?.displayName);
  if (!code) {
    diagnostics.push(categoryDiagnostic("FAIL", `row-${index}`, "Marketplace category code is required."));
    return null;
  }
  if (!URL_SAFE_CODE_PATTERN.test(code)) {
    diagnostics.push(categoryDiagnostic("FAIL", code, "Marketplace category code must be URL-safe."));
    return null;
  }
  if (!APPROVED_LABEL_BY_CODE.has(code)) {
    diagnostics.push(categoryDiagnostic("FAIL", code, "Marketplace category code is not approved."));
    return null;
  }
  if (seenCodes.has(code)) {
    diagnostics.push(categoryDiagnostic("FAIL", code, "Marketplace category code is duplicated."));
    return null;
  }
  seenCodes.add(code);
  if (displayName !== APPROVED_LABEL_BY_CODE.get(code)) {
    diagnostics.push(categoryDiagnostic("FAIL", code, "Marketplace category display label does not match the approved list."));
    return null;
  }
  const sortName = normalizedDisplayName(row.sortName);
  if (sortName !== displayName.toLowerCase()) {
    diagnostics.push(categoryDiagnostic("FAIL", code, "Marketplace category sortName must match the lowercase display label."));
    return null;
  }
  return {
    active: activeCategory(row),
    code,
    displayName,
    key: row.key,
    sortName,
  };
}

function sortedCategories(categories) {
  return categories.slice().sort((left, right) => (
    left.displayName.localeCompare(right.displayName)
  ));
}

function missingCategoryDiagnostics(categories) {
  const activeCodes = new Set(categories.filter((category) => category.active).map((category) => category.code));
  return APPROVED_MARKETPLACE_CATEGORIES
    .filter((category) => !activeCodes.has(category.code))
    .map((category) => categoryDiagnostic("FAIL", category.code, "Approved marketplace category is missing or inactive."));
}

function overallStatus(diagnostics) {
  if (diagnostics.some((entry) => entry.status === "FAIL")) {
    return "FAIL";
  }
  if (diagnostics.some((entry) => entry.status === "WARN")) {
    return "WARN";
  }
  return "PASS";
}

export function readMarketplaceCategories(tables) {
  const diagnostics = [];
  const seenCodes = new Set();
  const categories = marketplaceCategoryRows(tables)
    .filter(activeCategory)
    .map((row, index) => validatedCategory(row, index, diagnostics, seenCodes))
    .filter(Boolean);
  diagnostics.push(...missingCategoryDiagnostics(categories));
  return {
    categories: sortedCategories(categories),
    diagnostics,
    sourceTables: ["marketplace_categories"],
    status: overallStatus(diagnostics),
  };
}

export function validateMarketplaceCategoryCode(tables, code) {
  const normalizedCode = normalizedCategoryCode(code);
  if (!normalizedCode) {
    throw new MarketplaceCategoryError("Marketplace category code is required.");
  }
  const categories = readMarketplaceCategories(tables);
  if (categories.status === "FAIL") {
    throw new MarketplaceCategoryError("Marketplace categories contain invalid records.", 500);
  }
  const category = categories.categories.find((entry) => entry.code === normalizedCode);
  if (!category) {
    throw new MarketplaceCategoryError(`Marketplace category ${normalizedCode} was not found.`, 404);
  }
  return category;
}
