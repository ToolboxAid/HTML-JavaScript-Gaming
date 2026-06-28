export class LegalDocumentError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "LegalDocumentError";
    this.statusCode = statusCode;
  }
}

export const REQUIRED_LEGAL_DOCUMENTS = Object.freeze([
  Object.freeze({
    documentType: "terms_of_service",
    route: "legal/terms.html",
    slug: "terms",
    title: "Terms of Service",
  }),
  Object.freeze({
    documentType: "privacy_policy",
    route: "legal/privacy-policy.html",
    slug: "privacy",
    title: "Privacy Policy",
  }),
  Object.freeze({
    documentType: "cookies_policy",
    route: "legal/cookies-policy.html",
    slug: "cookies",
    title: "Cookies Policy",
  }),
  Object.freeze({
    documentType: "community_guidelines",
    route: "legal/community-guidelines.html",
    slug: "community",
    title: "Community Guidelines",
  }),
  Object.freeze({
    documentType: "copyright_policy",
    route: "legal/copyright-policy.html",
    slug: "copyright",
    title: "Copyright Policy",
  }),
  Object.freeze({
    documentType: "dmca_policy",
    route: "legal/dmca-policy.html",
    slug: "dmca",
    title: "DMCA Policy",
  }),
]);

const REQUIRED_BY_TYPE = new Map(REQUIRED_LEGAL_DOCUMENTS.map((document) => [
  document.documentType,
  document,
]));
const REQUIRED_BY_SLUG = new Map(REQUIRED_LEGAL_DOCUMENTS.map((document) => [
  document.slug,
  document,
]));

function tableRows(tables, tableName) {
  if (!tables || typeof tables !== "object") {
    throw new LegalDocumentError("Legal document service requires database tables.", 500);
  }
  if (!Array.isArray(tables[tableName])) {
    throw new LegalDocumentError(`${tableName} table is required for legal documents.`, 500);
  }
  return tables[tableName];
}

function normalizedText(value) {
  return String(value || "").trim();
}

function normalizedDocumentType(value) {
  return normalizedText(value).toLowerCase();
}

function normalizedSlug(value) {
  return normalizedText(value).toLowerCase();
}

function legalDiagnostic(status, documentType, message) {
  return {
    documentType,
    message,
    status,
  };
}

function requiredDefinition(body = {}) {
  const documentType = normalizedDocumentType(body.documentType);
  const slug = normalizedSlug(body.slug);
  if (documentType && REQUIRED_BY_TYPE.has(documentType)) {
    return REQUIRED_BY_TYPE.get(documentType);
  }
  if (slug && REQUIRED_BY_SLUG.has(slug)) {
    return REQUIRED_BY_SLUG.get(slug);
  }
  throw new LegalDocumentError(`Legal document ${documentType || slug || "missing"} is not supported.`, 404);
}

function legalDocumentRows(tables) {
  return tableRows(tables, "legal_documents");
}

function legalVersionRows(tables) {
  return tableRows(tables, "legal_document_versions");
}

function documentForDefinition(tables, definition) {
  const matches = legalDocumentRows(tables)
    .filter((row) => row.documentType === definition.documentType || row.slug === definition.slug);
  if (matches.length > 1) {
    throw new LegalDocumentError(`Legal document ${definition.documentType} has duplicate records.`, 409);
  }
  return matches[0] || null;
}

function versionForDocument(tables, document) {
  if (!document?.publishedVersionKey) {
    return null;
  }
  return legalVersionRows(tables).find((row) =>
    row.key === document.publishedVersionKey && row.documentKey === document.key) || null;
}

function diagnosticStatus(diagnostics) {
  if (diagnostics.some((entry) => entry.status === "FAIL")) {
    return "FAIL";
  }
  if (diagnostics.some((entry) => entry.status === "WARN")) {
    return "WARN";
  }
  return "PASS";
}

function documentSummary(tables, definition) {
  const document = documentForDefinition(tables, definition);
  if (!document) {
    return {
      document: null,
      publishedVersion: null,
      summary: {
        currentPublishedVersion: "",
        documentType: definition.documentType,
        lastUpdatedAt: "",
        ownerRoleRequired: "owner",
        route: definition.route,
        slug: definition.slug,
        status: "missing",
        title: definition.title,
      },
    };
  }
  const publishedVersion = versionForDocument(tables, document);
  return {
    document,
    publishedVersion,
    summary: {
      currentPublishedVersion: publishedVersion?.version || "",
      documentType: document.documentType,
      lastUpdatedAt: document.updatedAt || "",
      ownerRoleRequired: "owner",
      route: definition.route,
      slug: document.slug,
      status: document.status || "",
      title: document.title || definition.title,
    },
  };
}

export function readLegalDocumentCatalog(tables) {
  const diagnostics = [];
  const documents = REQUIRED_LEGAL_DOCUMENTS.map((definition) => {
    const summary = documentSummary(tables, definition);
    if (!summary.document) {
      diagnostics.push(legalDiagnostic("FAIL", definition.documentType, "Required legal document record is missing."));
      return summary.summary;
    }
    if (!summary.document.publishedVersionKey) {
      diagnostics.push(legalDiagnostic("WARN", definition.documentType, "No published legal version is available."));
    } else if (!summary.publishedVersion) {
      diagnostics.push(legalDiagnostic("FAIL", definition.documentType, "Published legal version key does not resolve."));
    }
    return summary.summary;
  });
  return {
    diagnostics,
    documents,
    ownerRoleRequired: "owner",
    sourceTables: ["legal_documents", "legal_document_versions"],
    status: diagnosticStatus(diagnostics),
  };
}

export function readPublishedLegalDocument(tables, body = {}) {
  const definition = requiredDefinition(body);
  const summary = documentSummary(tables, definition);
  if (!summary.document) {
    return {
      available: false,
      bodyMarkdown: "",
      diagnostic: `Published legal document ${definition.documentType} is not available because the document record is missing.`,
      documentType: definition.documentType,
      effectiveAt: "",
      route: definition.route,
      slug: definition.slug,
      status: "FAIL",
      title: definition.title,
    };
  }
  if (!summary.document.publishedVersionKey || summary.document.status !== "published") {
    return {
      available: false,
      bodyMarkdown: "",
      diagnostic: `Published legal document ${definition.documentType} is not available. Owner must publish approved content before public rendering.`,
      documentType: summary.document.documentType,
      effectiveAt: "",
      route: definition.route,
      slug: summary.document.slug,
      status: "WARN",
      title: summary.document.title,
    };
  }
  if (!summary.publishedVersion || !summary.publishedVersion.publishedAt) {
    return {
      available: false,
      bodyMarkdown: "",
      diagnostic: `Published legal document ${definition.documentType} does not resolve to a published version.`,
      documentType: summary.document.documentType,
      effectiveAt: "",
      route: definition.route,
      slug: summary.document.slug,
      status: "FAIL",
      title: summary.document.title,
    };
  }
  const bodyMarkdown = normalizedText(summary.publishedVersion.bodyMarkdown);
  if (!bodyMarkdown) {
    return {
      available: false,
      bodyMarkdown: "",
      diagnostic: `Published legal document ${definition.documentType} has no approved body content.`,
      documentType: summary.document.documentType,
      effectiveAt: summary.publishedVersion.effectiveAt || "",
      route: definition.route,
      slug: summary.document.slug,
      status: "FAIL",
      title: summary.document.title,
    };
  }
  return {
    available: true,
    bodyMarkdown,
    diagnostic: `Loaded published legal document ${definition.documentType}.`,
    documentType: summary.document.documentType,
    effectiveAt: summary.publishedVersion.effectiveAt || "",
    publishedAt: summary.publishedVersion.publishedAt || "",
    route: definition.route,
    slug: summary.document.slug,
    status: "PASS",
    title: summary.document.title,
    version: summary.publishedVersion.version || "",
  };
}
