import { randomBytes } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import {
  getActiveToolRegistry,
  getToolReleaseChannel,
  getToolReleaseChannelLabel,
  getToolRoute,
} from "../guest-seeds/tool-metadata-inventory.js";
import {
  getMockDbTableSchemas,
} from "../persistence/mock-db-store.js";
import { REQUIRED_LEGAL_DOCUMENTS } from "../legal/legal-document-service.mjs";
import { SEED_DB_KEYS } from "./seed-db-keys.mjs";

const ULID_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const SEED_SOURCE_DIRECTORY = path.join("dev", "build", "database", "seed");
const DEV_SEED_AUDIT_USER_KEY = SEED_DB_KEYS.users.admin;

function encodeBase32(value, length) {
  let remaining = BigInt(value);
  let encoded = "";
  for (let index = 0; index < length; index += 1) {
    encoded = ULID_ALPHABET[Number(remaining % 32n)] + encoded;
    remaining /= 32n;
  }
  return encoded;
}

function randomBase32(length) {
  const bytes = randomBytes(length);
  return Array.from(bytes, (byte) => ULID_ALPHABET[byte % 32]).join("");
}

function createServerUlidFactory() {
  const usedKeys = new Set();
  return function serverGeneratedUlid() {
    let key = "";
    do {
      key = `${encodeBase32(Date.now(), 10)}${randomBase32(16)}`;
    } while (usedKeys.has(key));
    usedKeys.add(key);
    return key;
  };
}

function timestamp(offsetMinutes = 0) {
  return new Date(Date.now() + offsetMinutes * 60_000).toISOString();
}

function auditFields(offsetMinutes = 0, userKey = DEV_SEED_AUDIT_USER_KEY) {
  const value = timestamp(offsetMinutes);
  return {
    createdAt: value,
    updatedAt: value,
    createdBy: userKey,
    updatedBy: userKey,
  };
}

const MEMBERSHIP_PLAN_DEFINITIONS = Object.freeze([
  Object.freeze({
    basePlanCode: "",
    billingInterval: "month",
    code: "FREE",
    currency: "USD",
    displayName: "Free",
    foundingMemberLimit: 0,
    isFounding: false,
    isPublic: true,
    key: SEED_DB_KEYS.membershipPlans.free,
    limitsKey: SEED_DB_KEYS.membershipLimits.free,
    monthlyPriceCents: 0,
    purchasedCreditBonusBps: 0,
    requiresInvitation: false,
    revenueShareBps: 0,
    limits: Object.freeze({
      analyticsTier: "none",
      collaborationEnabled: false,
      marketplaceBrowseEnabled: true,
      marketplaceBuyEnabled: true,
      marketplaceFreeDownloadEnabled: true,
      marketplaceSellEnabled: false,
      maxTeamMembers: 1,
      monthlyAiCredits: 0,
      publishExperienceLimit: 1,
      storageMb: 250,
    }),
  }),
  Object.freeze({
    basePlanCode: "",
    billingInterval: "month",
    code: "CREATOR",
    currency: "USD",
    displayName: "Creator",
    foundingMemberLimit: 0,
    isFounding: false,
    isPublic: true,
    key: SEED_DB_KEYS.membershipPlans.creator,
    limitsKey: SEED_DB_KEYS.membershipLimits.creator,
    monthlyPriceCents: 900,
    purchasedCreditBonusBps: 0,
    requiresInvitation: false,
    revenueShareBps: 8000,
    limits: Object.freeze({
      analyticsTier: "creator",
      collaborationEnabled: true,
      marketplaceBrowseEnabled: true,
      marketplaceBuyEnabled: true,
      marketplaceFreeDownloadEnabled: true,
      marketplaceSellEnabled: true,
      maxTeamMembers: 3,
      monthlyAiCredits: 100,
      publishExperienceLimit: null,
      storageMb: 1024,
    }),
  }),
  Object.freeze({
    basePlanCode: "",
    billingInterval: "month",
    code: "STUDIO",
    currency: "USD",
    displayName: "Studio",
    foundingMemberLimit: 0,
    isFounding: false,
    isPublic: true,
    key: SEED_DB_KEYS.membershipPlans.studio,
    limitsKey: SEED_DB_KEYS.membershipLimits.studio,
    monthlyPriceCents: 1900,
    purchasedCreditBonusBps: 1000,
    requiresInvitation: false,
    revenueShareBps: 8000,
    limits: Object.freeze({
      analyticsTier: "advanced",
      collaborationEnabled: true,
      marketplaceBrowseEnabled: true,
      marketplaceBuyEnabled: true,
      marketplaceFreeDownloadEnabled: true,
      marketplaceSellEnabled: true,
      maxTeamMembers: 10,
      monthlyAiCredits: 400,
      publishExperienceLimit: null,
      storageMb: 4096,
    }),
  }),
  Object.freeze({
    basePlanCode: "STUDIO",
    billingInterval: "month",
    code: "BETA",
    currency: "USD",
    displayName: "Beta",
    foundingMemberLimit: 0,
    isFounding: false,
    isPublic: false,
    key: SEED_DB_KEYS.membershipPlans.beta,
    limitsKey: SEED_DB_KEYS.membershipLimits.beta,
    monthlyPriceCents: 0,
    purchasedCreditBonusBps: 1000,
    requiresInvitation: true,
    revenueShareBps: 8000,
    limits: Object.freeze({
      analyticsTier: "advanced",
      collaborationEnabled: true,
      marketplaceBrowseEnabled: true,
      marketplaceBuyEnabled: true,
      marketplaceFreeDownloadEnabled: true,
      marketplaceSellEnabled: true,
      maxTeamMembers: 10,
      monthlyAiCredits: 400,
      publishExperienceLimit: null,
      storageMb: 4096,
    }),
  }),
  Object.freeze({
    basePlanCode: "CREATOR",
    billingInterval: "month",
    code: "FOUNDING_CREATOR",
    currency: "USD",
    displayName: "Founding Creator",
    foundingMemberLimit: 100,
    isFounding: true,
    isPublic: false,
    key: SEED_DB_KEYS.membershipPlans.foundingCreator,
    limitsKey: SEED_DB_KEYS.membershipLimits.foundingCreator,
    monthlyPriceCents: 500,
    purchasedCreditBonusBps: 0,
    requiresInvitation: false,
    revenueShareBps: 8000,
    limits: Object.freeze({
      analyticsTier: "creator",
      collaborationEnabled: true,
      marketplaceBrowseEnabled: true,
      marketplaceBuyEnabled: true,
      marketplaceFreeDownloadEnabled: true,
      marketplaceSellEnabled: true,
      maxTeamMembers: 3,
      monthlyAiCredits: 100,
      publishExperienceLimit: null,
      storageMb: 1024,
    }),
  }),
  Object.freeze({
    basePlanCode: "STUDIO",
    billingInterval: "month",
    code: "FOUNDING_STUDIO",
    currency: "USD",
    displayName: "Founding Studio",
    foundingMemberLimit: 100,
    isFounding: true,
    isPublic: false,
    key: SEED_DB_KEYS.membershipPlans.foundingStudio,
    limitsKey: SEED_DB_KEYS.membershipLimits.foundingStudio,
    monthlyPriceCents: 1000,
    purchasedCreditBonusBps: 1000,
    requiresInvitation: false,
    revenueShareBps: 8000,
    limits: Object.freeze({
      analyticsTier: "advanced",
      collaborationEnabled: true,
      marketplaceBrowseEnabled: true,
      marketplaceBuyEnabled: true,
      marketplaceFreeDownloadEnabled: true,
      marketplaceSellEnabled: true,
      maxTeamMembers: 10,
      monthlyAiCredits: 400,
      publishExperienceLimit: null,
      storageMb: 4096,
    }),
  }),
]);

function membershipPlanRows() {
  return MEMBERSHIP_PLAN_DEFINITIONS.map((plan, index) => ({
    active: true,
    basePlanCode: plan.basePlanCode,
    billingInterval: plan.billingInterval,
    code: plan.code,
    currency: plan.currency,
    displayName: plan.displayName,
    foundingMemberLimit: plan.foundingMemberLimit,
    isFounding: plan.isFounding,
    isPublic: plan.isPublic,
    key: plan.key,
    monthlyPriceCents: plan.monthlyPriceCents,
    purchasedCreditBonusBps: plan.purchasedCreditBonusBps,
    requiresInvitation: plan.requiresInvitation,
    revenueShareBps: plan.revenueShareBps,
    ...auditFields(90 + index),
  }));
}

function membershipLimitRows() {
  return MEMBERSHIP_PLAN_DEFINITIONS.map((plan, index) => ({
    key: plan.limitsKey,
    planKey: plan.key,
    ...plan.limits,
    ...auditFields(100 + index),
  }));
}

function userMembershipRows() {
  const rows = [
    { key: SEED_DB_KEYS.userMemberships.user1Free, userKey: SEED_DB_KEYS.users.user1 },
    { key: SEED_DB_KEYS.userMemberships.user2Free, userKey: SEED_DB_KEYS.users.user2 },
    { key: SEED_DB_KEYS.userMemberships.user3Free, userKey: SEED_DB_KEYS.users.user3 },
    { key: SEED_DB_KEYS.userMemberships.adminFree, userKey: SEED_DB_KEYS.users.admin },
  ];
  return rows.map((row, index) => ({
    canceledAt: "",
    endedAt: "",
    externalSubscriptionId: "",
    foundingMemberKey: "",
    invitationKey: "",
    key: row.key,
    planKey: SEED_DB_KEYS.membershipPlans.free,
    renewsAt: "",
    source: "free",
    startedAt: timestamp(120 + index),
    status: "active",
    userKey: row.userKey,
    ...auditFields(120 + index),
  }));
}

function aiActionRows() {
  return [
    {
      code: "TEXT_ASSIST",
      creditCost: 10,
      displayName: "Text Assist",
      key: SEED_DB_KEYS.aiActions.textAssist,
    },
    {
      code: "IMAGE_PROMPT",
      creditCost: 25,
      displayName: "Image Prompt",
      key: SEED_DB_KEYS.aiActions.imagePrompt,
    },
  ].map((row, index) => ({
    active: true,
    ...row,
    ...auditFields(130 + index),
  }));
}

function aiCreditPackRows() {
  return [
    {
      code: "SMALL",
      credits: 100,
      displayName: "Small",
      key: SEED_DB_KEYS.aiCreditPacks.small,
      priceCents: 500,
    },
    {
      code: "MEDIUM",
      credits: 500,
      displayName: "Medium",
      key: SEED_DB_KEYS.aiCreditPacks.medium,
      priceCents: 2000,
    },
    {
      code: "LARGE",
      credits: 3000,
      displayName: "Large",
      key: SEED_DB_KEYS.aiCreditPacks.large,
      priceCents: 9900,
    },
  ].map((row, index) => ({
    active: true,
    currency: "USD",
    ...row,
    ...auditFields(140 + index),
  }));
}

function activeToolRows() {
  return getActiveToolRegistry().map((tool) => {
    const toolKey = tool.id || tool.key || tool.slug || tool.name || "tool";
    return {
      route: getToolRoute(tool) || "toolbox/index.html",
      tool,
      toolKey,
      toolName: tool.displayName || tool.name || tool.label || tool.title || toolKey,
    };
  });
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

export function readGroupedSeedManifests(rootDirectory = process.cwd()) {
  const seedDirectory = path.join(rootDirectory, SEED_SOURCE_DIRECTORY);
  return readdirSync(seedDirectory)
    .filter((fileName) => fileName.endsWith(".json"))
    .sort()
    .map((fileName) => {
      const filePath = path.join(seedDirectory, fileName);
      return {
        ...readJson(filePath),
        source: path.join(SEED_SOURCE_DIRECTORY, fileName).replaceAll(path.sep, "/"),
      };
    });
}

function emptyTables() {
  return Object.fromEntries(
    Object.keys(getMockDbTableSchemas()).map((tableName) => [tableName, []]),
  );
}

function userRows() {
  return [
    {
      key: SEED_DB_KEYS.users.user1,
      displayName: "User 1",
      email: "user1@example.invalid",
      authProvider: "supabase-auth",
      authProviderUserId: "user-1",
      isActive: true,
      ...auditFields(1),
    },
    {
      key: SEED_DB_KEYS.users.user2,
      displayName: "User 2",
      email: "user2@example.invalid",
      authProvider: "supabase-auth",
      authProviderUserId: "user-2",
      isActive: true,
      ...auditFields(2),
    },
    {
      key: SEED_DB_KEYS.users.user3,
      displayName: "User 3",
      email: "user3@example.invalid",
      authProvider: "supabase-auth",
      authProviderUserId: "user-3",
      isActive: true,
      ...auditFields(3),
    },
    {
      key: SEED_DB_KEYS.users.admin,
      displayName: "DavidQ",
      email: "qbytes.dq@gmail.com",
      authProvider: "supabase-auth",
      authProviderUserId: "davidq",
      isActive: true,
      ...auditFields(4),
    },
  ];
}

function roleRows(generateKey) {
  return [
    {
      key: generateKey(),
      roleSlug: "admin",
      name: "Admin",
      description: "Administrative user.",
      isSystemRole: false,
      isActive: true,
      ...auditFields(6),
    },
    {
      key: generateKey(),
      roleSlug: "owner",
      name: "Owner",
      description: "Owner account with platform-level stewardship access.",
      isSystemRole: false,
      isActive: true,
      ...auditFields(7),
    },
    {
      key: generateKey(),
      roleSlug: "creator",
      name: "Creator",
      description: "Authenticated game creator.",
      isSystemRole: false,
      isActive: true,
      ...auditFields(8),
    },
    {
      key: generateKey(),
      roleSlug: "guest",
      name: "Guest",
      description: "Unauthenticated visitor and starter flow role.",
      isSystemRole: false,
      isActive: true,
      ...auditFields(9),
    },
  ];
}

function userRoleRows(roles) {
  const roleBySlug = new Map(roles.map((role) => [role.roleSlug, role.key]));
  return [
    { key: SEED_DB_KEYS.userRoles.user1User, userKey: SEED_DB_KEYS.users.user1, roleKey: roleBySlug.get("creator") },
    { key: SEED_DB_KEYS.userRoles.user2User, userKey: SEED_DB_KEYS.users.user2, roleKey: roleBySlug.get("creator") },
    { key: SEED_DB_KEYS.userRoles.user3User, userKey: SEED_DB_KEYS.users.user3, roleKey: roleBySlug.get("creator") },
    { key: SEED_DB_KEYS.userRoles.adminUser, userKey: SEED_DB_KEYS.users.admin, roleKey: roleBySlug.get("creator") },
    { key: SEED_DB_KEYS.userRoles.adminAdmin, userKey: SEED_DB_KEYS.users.admin, roleKey: roleBySlug.get("admin") },
    { key: SEED_DB_KEYS.userRoles.adminOwner, userKey: SEED_DB_KEYS.users.admin, roleKey: roleBySlug.get("owner") },
  ].map((row, index) => ({
    ...row,
    ...auditFields(10 + index),
  }));
}

function toolboxToolMetadataRows(generateKey) {
  return activeToolRows().map(({ tool, toolKey, toolName }, index) => {
    const releaseChannel = getToolReleaseChannel(tool);
    return {
      key: generateKey(),
      toolKey,
      toolName,
      shortLabel: tool.shortLabel || toolName,
      shortDescription: tool.shortDescription || tool.description || "",
      description: tool.description || tool.shortDescription || "",
      group: tool.category || "Platform",
      category: tool.category || "Platform",
      colorGroup: tool.colorGroup || "",
      toolboxGroup: tool.toolboxGroup || "",
      subgroup: tool.subgroup || "",
      path: getToolRoute(tool) || "",
      order: Math.max(1, Math.round(Number(tool.order) || index + 1)),
      status: releaseChannel,
      badge: tool.badge || "",
      toolImage: tool.tool || "",
      active: tool.active !== false,
      adminOnly: tool.adminOnly === true,
      hidden: tool.hidden === true,
      deferred: tool.deferred === true,
      visibleInToolsList: tool.visibleInToolsList === true,
      capabilityLabel: tool.capabilityLabel || "",
      childCapabilities: Array.isArray(tool.childCapabilities) ? [...tool.childCapabilities] : [],
      requiredRole: typeof tool.requiredRole === "string" ? tool.requiredRole : "",
      statusDiagnostic: tool.statusDiagnostic || "",
      toolId: toolKey,
      releaseChannel,
      releaseChannelLabel: getToolReleaseChannelLabel(releaseChannel),
      ...auditFields(60 + index),
    };
  });
}

function toolboxToolPlanningRows(generateKey) {
  return activeToolRows().map(({ tool, toolKey }, index) => ({
    key: generateKey(),
    toolKey,
    readiness: tool.readiness || "",
    requiredForPlayable: tool.requiredForPlayable === true,
    requiredForTestable: tool.requiredForTestable === true,
    requiredForPublish: tool.requiredForPublish === true,
    requires: Array.isArray(tool.requires) ? [...tool.requires] : [],
    progressChecklist: Array.isArray(tool.progressChecklist) ? [...tool.progressChecklist] : [],
    ...auditFields(90 + index),
  }));
}

function platformSettingRows(generateKey) {
  return [
    {
      key: generateKey(),
      settingKey: "platform.banner.enabled",
      settingValue: "false",
      settingType: "boolean",
      description: "Controls whether the platform banner renders.",
      isActive: true,
      ...auditFields(121),
    },
    {
      key: generateKey(),
      settingKey: "platform.banner.message",
      settingValue: "",
      settingType: "string",
      description: "Platform banner message text.",
      isActive: true,
      ...auditFields(122),
    },
    {
      key: generateKey(),
      settingKey: "platform.banner.tone",
      settingValue: "info",
      settingType: "string",
      description: "Platform banner visual tone.",
      isActive: true,
      ...auditFields(123),
    },
  ];
}

function supportCategoryRows(generateKey) {
  return [
    {
      key: generateKey(),
      categorySlug: "general-help",
      name: "General Help",
      description: "Starter support category for creator questions.",
      isActive: true,
      sortOrder: 1,
      ...auditFields(130),
    },
  ];
}

function marketplaceCategoryRows() {
  return [
    { code: "assets", displayName: "Assets", key: SEED_DB_KEYS.marketplaceCategories.assets },
    { code: "audio", displayName: "Audio", key: SEED_DB_KEYS.marketplaceCategories.audio },
    { code: "games", displayName: "Games", key: SEED_DB_KEYS.marketplaceCategories.games },
    { code: "music", displayName: "Music", key: SEED_DB_KEYS.marketplaceCategories.music },
    { code: "templates", displayName: "Templates", key: SEED_DB_KEYS.marketplaceCategories.templates },
    { code: "tutorials", displayName: "Tutorials", key: SEED_DB_KEYS.marketplaceCategories.tutorials },
    { code: "worlds", displayName: "Worlds", key: SEED_DB_KEYS.marketplaceCategories.worlds },
  ].map((category, index) => ({
    active: true,
    code: category.code,
    displayName: category.displayName,
    key: category.key,
    sortName: category.displayName.toLowerCase(),
    ...auditFields(150 + index),
  }));
}

function legalDocumentDefinitions() {
  const seedKeys = {
    community_guidelines: {
      documentKey: SEED_DB_KEYS.legalDocuments.communityGuidelines,
      versionKey: SEED_DB_KEYS.legalDocumentVersions.communityGuidelinesDraft,
    },
    cookies_policy: {
      documentKey: SEED_DB_KEYS.legalDocuments.cookiesPolicy,
      versionKey: SEED_DB_KEYS.legalDocumentVersions.cookiesPolicyDraft,
    },
    copyright_policy: {
      documentKey: SEED_DB_KEYS.legalDocuments.copyrightPolicy,
      versionKey: SEED_DB_KEYS.legalDocumentVersions.copyrightPolicyDraft,
    },
    dmca_policy: {
      documentKey: SEED_DB_KEYS.legalDocuments.dmcaPolicy,
      versionKey: SEED_DB_KEYS.legalDocumentVersions.dmcaPolicyDraft,
    },
    privacy_policy: {
      documentKey: SEED_DB_KEYS.legalDocuments.privacyPolicy,
      versionKey: SEED_DB_KEYS.legalDocumentVersions.privacyPolicyDraft,
    },
    terms_of_service: {
      documentKey: SEED_DB_KEYS.legalDocuments.termsOfService,
      versionKey: SEED_DB_KEYS.legalDocumentVersions.termsOfServiceDraft,
    },
  };
  return REQUIRED_LEGAL_DOCUMENTS.map((document) => ({
    ...document,
    ...seedKeys[document.documentType],
  }));
}

function legalDocumentRows() {
  return legalDocumentDefinitions().map((document, index) => ({
    documentType: document.documentType,
    key: document.documentKey,
    publishedVersionKey: "",
    slug: document.slug,
    status: "draft",
    title: document.title,
    ...auditFields(160 + index),
  }));
}

function legalDocumentVersionRows() {
  return legalDocumentDefinitions().map((document, index) => ({
    bodyMarkdown: "",
    documentKey: document.documentKey,
    effectiveAt: "",
    key: document.versionKey,
    publishedAt: "",
    publishedBy: "",
    version: "1",
    ...auditFields(170 + index),
  }));
}

function humanToolStateSampleRows(generateKey) {
  const tools = activeToolRows();
  const toolByKey = new Map(tools.map((tool) => [tool.toolKey, tool]));
  const users = [
    { displayName: "User 1", toolKey: "game-journey", userKey: SEED_DB_KEYS.users.user1 },
    { displayName: "User 2", toolKey: "palette", userKey: SEED_DB_KEYS.users.user2 },
    { displayName: "User 3", toolKey: "asset", userKey: SEED_DB_KEYS.users.user3 },
    { displayName: "DavidQ", toolKey: "game-hub", userKey: SEED_DB_KEYS.users.admin },
  ];
  return users.map((user, index) => {
    const tool = toolByKey.get(user.toolKey) || tools[index] || {
      route: "toolbox/index.html",
      toolKey: user.toolKey,
      toolName: user.toolKey,
    };
    const gameKey = generateKey();
    const toolStateKey = generateKey();
    return {
      key: generateKey(),
      audience: "user",
      userKey: user.userKey,
      displayName: user.displayName,
      toolKey: tool.toolKey,
      toolName: tool.toolName,
      route: tool.route,
      gameKey,
      toolStateKey,
      manifestPath: `local-seeds/${user.displayName.toLowerCase().replaceAll(" ", "-")}/${tool.toolKey}.manifest.json`,
      sampleLabel: `${user.displayName} ${tool.toolName} seed`,
      sampleKind: "toolState",
      loadablePath: `${tool.route}?toolState=${toolStateKey}`,
      toolStatePayload: {
        audience: "user",
        ownerUserKey: user.userKey,
        gameKey,
        toolKey: tool.toolKey,
        toolStateKey,
      },
      ...auditFields(30 + index, user.userKey),
    };
  });
}

export function createServerSeedTables(options = {}) {
  const generateKey = options.generateKey || createServerUlidFactory();
  readGroupedSeedManifests(options.rootDirectory || process.cwd());
  const tables = emptyTables();
  const roles = roleRows(generateKey);
  tables.users = userRows();
  tables.roles = roles;
  tables.user_roles = userRoleRows(roles);
  tables.membership_plans = membershipPlanRows();
  tables.membership_limits = membershipLimitRows();
  tables.founding_members = [];
  tables.user_memberships = userMembershipRows();
  tables.ai_actions = aiActionRows();
  tables.ai_credit_packs = aiCreditPackRows();
  tables.user_ai_credits = [];
  tables.ai_usage_log = [];
  tables.marketplace_categories = marketplaceCategoryRows();
  tables.legal_documents = legalDocumentRows();
  tables.legal_document_versions = legalDocumentVersionRows();
  tables.toolbox_tool_metadata = toolboxToolMetadataRows(generateKey);
  tables.toolbox_tool_planning = toolboxToolPlanningRows(generateKey);
  tables.toolbox_votes = [];
  tables.platform_settings = platformSettingRows(generateKey);
  tables.support_categories = supportCategoryRows(generateKey);
  tables.tool_state_samples = humanToolStateSampleRows(generateKey);
  return tables;
}
