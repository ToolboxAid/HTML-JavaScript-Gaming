import test from "node:test";
import assert from "node:assert/strict";
import { SUPABASE_POSTGRES_PRODUCT_TABLES } from "../../../api/auth/provider-contract-stubs.mjs";
import {
  REQUIRED_LEGAL_DOCUMENTS,
  readLegalDocumentCatalog,
  readPublishedLegalDocument,
} from "../../../api/legal/legal-document-service.mjs";
import { getMockDbTableSchemas } from "../../../api/persistence/mock-db-store.js";
import { SEED_DB_KEYS, makeSeedUlid } from "../../../api/seed/seed-db-keys.mjs";
import { createServerSeedTables } from "../../../api/seed/server-seed-loader.mjs";

const REQUIRED_TYPES = Object.freeze([
  "terms_of_service",
  "privacy_policy",
  "cookies_policy",
  "community_guidelines",
  "copyright_policy",
  "dmca_policy",
]);

const REQUIRED_SLUGS = Object.freeze([
  "terms",
  "privacy",
  "cookies",
  "community",
  "copyright",
  "dmca",
]);

function termsDocument(tables) {
  return tables.legal_documents.find((row) => row.documentType === "terms_of_service");
}

function termsVersion(tables) {
  const document = termsDocument(tables);
  return tables.legal_document_versions.find((row) => row.documentKey === document.key);
}

function documentByType(tables, documentType) {
  return tables.legal_documents.find((row) => row.documentType === documentType);
}

function versionByType(tables, documentType) {
  const document = documentByType(tables, documentType);
  return tables.legal_document_versions.find((row) => row.documentKey === document.key);
}

test("legal document tables are registered as DB-backed product tables", () => {
  const schemas = getMockDbTableSchemas();
  assert.deepEqual(schemas.legal_documents, [
    "key",
    "documentType",
    "slug",
    "title",
    "status",
    "publishedVersionKey",
    "createdAt",
    "updatedAt",
    "createdBy",
    "updatedBy",
  ]);
  assert.deepEqual(schemas.legal_document_versions, [
    "key",
    "documentKey",
    "version",
    "bodyMarkdown",
    "effectiveAt",
    "publishedAt",
    "publishedBy",
    "createdAt",
    "updatedAt",
    "createdBy",
    "updatedBy",
  ]);
  assert.equal(SUPABASE_POSTGRES_PRODUCT_TABLES.includes("legal_documents"), true);
  assert.equal(SUPABASE_POSTGRES_PRODUCT_TABLES.includes("legal_document_versions"), true);
});

test("seeded legal foundation enumerates the required document types without legal copy", () => {
  const tables = createServerSeedTables();
  assert.deepEqual(tables.legal_documents.map((row) => row.documentType), REQUIRED_TYPES);
  assert.deepEqual(REQUIRED_LEGAL_DOCUMENTS.map((row) => row.documentType), REQUIRED_TYPES);
  assert.deepEqual(tables.legal_documents.map((row) => row.slug), REQUIRED_SLUGS);
  assert.deepEqual(REQUIRED_LEGAL_DOCUMENTS.map((row) => row.slug), REQUIRED_SLUGS);
  assert.equal(tables.legal_documents.every((row) => row.status === "draft"), true);
  assert.equal(tables.legal_documents.every((row) => row.publishedVersionKey === ""), true);
  assert.equal(tables.legal_document_versions.every((row) => row.bodyMarkdown === ""), true);
  assert.equal(tables.legal_document_versions.every((row) => row.publishedAt === ""), true);
  assert.equal(tables.legal_documents.some((row) => Object.hasOwn(row, "monthlyPriceCents")), false);
  assert.equal(tables.legal_document_versions.some((row) => Object.hasOwn(row, "revenueShareBps")), false);
});

test("legal document catalog exposes routing metadata and missing published diagnostics", () => {
  const catalog = readLegalDocumentCatalog(createServerSeedTables());
  assert.equal(catalog.status, "WARN");
  assert.equal(catalog.ownerRoleRequired, "owner");
  assert.deepEqual(catalog.sourceTables, ["legal_documents", "legal_document_versions"]);
  assert.deepEqual(catalog.documents.map((row) => row.documentType), REQUIRED_TYPES);
  assert.deepEqual(catalog.documents.map((row) => row.route), [
    "legal/terms.html",
    "legal/privacy-policy.html",
    "legal/cookies-policy.html",
    "legal/community-guidelines.html",
    "legal/copyright-policy.html",
    "legal/dmca-policy.html",
  ]);
  assert.equal(catalog.diagnostics.length, 6);
  assert.equal(catalog.diagnostics.every((entry) => entry.message.includes("No published legal version")), true);
});

test("published legal read diagnoses missing published content without rendering draft body", () => {
  const tables = createServerSeedTables();
  REQUIRED_TYPES.forEach((documentType) => {
    versionByType(tables, documentType).bodyMarkdown = `Draft ${documentType} fixture must not render publicly.`;
    const published = readPublishedLegalDocument(tables, { documentType });
    assert.equal(published.available, false);
    assert.equal(published.status, "WARN");
    assert.equal(published.bodyMarkdown, "");
    assert.match(published.diagnostic, /Owner must publish approved content/);
  });
});

test("published legal read renders only the linked published version", () => {
  const tables = createServerSeedTables();
  const document = termsDocument(tables);
  const version = termsVersion(tables);
  document.status = "published";
  document.publishedVersionKey = version.key;
  version.bodyMarkdown = "Approved Terms test fixture.";
  version.effectiveAt = "2026-06-18T12:00:00.000Z";
  version.publishedAt = "2026-06-18T12:00:00.000Z";
  version.publishedBy = SEED_DB_KEYS.users.admin;
  tables.legal_document_versions.push({
    bodyMarkdown: "Draft Terms test fixture must not render.",
    createdAt: "2026-06-18T12:00:00.000Z",
    createdBy: SEED_DB_KEYS.users.admin,
    documentKey: document.key,
    effectiveAt: "",
    key: makeSeedUlid(4200),
    publishedAt: "",
    publishedBy: "",
    updatedAt: "2026-06-18T12:00:00.000Z",
    updatedBy: SEED_DB_KEYS.users.admin,
    version: "2",
  });
  const published = readPublishedLegalDocument(tables, { slug: "terms" });
  assert.equal(published.status, "PASS");
  assert.equal(published.available, true);
  assert.equal(published.title, "Terms of Service");
  assert.equal(published.bodyMarkdown, "Approved Terms test fixture.");
  assert.equal(published.bodyMarkdown.includes("Draft Terms"), false);
});

test("published legal read diagnoses unresolved published version keys", () => {
  const tables = createServerSeedTables();
  const document = termsDocument(tables);
  document.status = "published";
  document.publishedVersionKey = makeSeedUlid(4300);
  const published = readPublishedLegalDocument(tables, { documentType: "terms_of_service" });
  assert.equal(published.available, false);
  assert.equal(published.status, "FAIL");
  assert.equal(published.bodyMarkdown, "");
  assert.match(published.diagnostic, /does not resolve to a published version/);
});
