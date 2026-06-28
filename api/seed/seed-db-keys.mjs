function makeSeedUlid(sequence) {
  return `01K2GFSJ0Y${String(sequence).padStart(16, "0")}`;
}

export const SEED_DB_KEYS = Object.freeze({
  users: Object.freeze({
    forgeBot: makeSeedUlid(54),
    user1: makeSeedUlid(51),
    user2: makeSeedUlid(52),
    user3: makeSeedUlid(53),
    admin: makeSeedUlid(54),
    designer: makeSeedUlid(51),
    producer: makeSeedUlid(52),
  }),
  roles: Object.freeze({
    admin: makeSeedUlid(73),
    system: makeSeedUlid(74),
    beta: makeSeedUlid(75),
    creator: makeSeedUlid(76),
    guest: makeSeedUlid(77),
    owner: makeSeedUlid(78),
  }),
  userRoles: Object.freeze({
    user1User: makeSeedUlid(82),
    user2User: makeSeedUlid(83),
    user3User: makeSeedUlid(84),
    adminUser: makeSeedUlid(85),
    adminAdmin: makeSeedUlid(86),
    forgeBotSystem: makeSeedUlid(87),
    user2Beta: makeSeedUlid(88),
    adminOwner: makeSeedUlid(89),
  }),
  membershipPlans: Object.freeze({
    free: makeSeedUlid(101),
    creator: makeSeedUlid(102),
    studio: makeSeedUlid(103),
    beta: makeSeedUlid(104),
    foundingCreator: makeSeedUlid(105),
    foundingStudio: makeSeedUlid(106),
  }),
  membershipLimits: Object.freeze({
    free: makeSeedUlid(111),
    creator: makeSeedUlid(112),
    studio: makeSeedUlid(113),
    beta: makeSeedUlid(114),
    foundingCreator: makeSeedUlid(115),
    foundingStudio: makeSeedUlid(116),
  }),
  userMemberships: Object.freeze({
    user1Free: makeSeedUlid(121),
    user2Free: makeSeedUlid(122),
    user3Free: makeSeedUlid(123),
    adminFree: makeSeedUlid(124),
  }),
  aiActions: Object.freeze({
    textAssist: makeSeedUlid(131),
    imagePrompt: makeSeedUlid(132),
  }),
  aiCreditPacks: Object.freeze({
    small: makeSeedUlid(141),
    medium: makeSeedUlid(142),
    large: makeSeedUlid(143),
  }),
  marketplaceCategories: Object.freeze({
    assets: makeSeedUlid(151),
    audio: makeSeedUlid(152),
    games: makeSeedUlid(153),
    music: makeSeedUlid(154),
    templates: makeSeedUlid(155),
    tutorials: makeSeedUlid(156),
    worlds: makeSeedUlid(157),
  }),
  legalDocuments: Object.freeze({
    termsOfService: makeSeedUlid(161),
    privacyPolicy: makeSeedUlid(162),
    cookiesPolicy: makeSeedUlid(163),
    communityGuidelines: makeSeedUlid(164),
    copyrightPolicy: makeSeedUlid(165),
    dmcaPolicy: makeSeedUlid(166),
  }),
  legalDocumentVersions: Object.freeze({
    termsOfServiceDraft: makeSeedUlid(171),
    privacyPolicyDraft: makeSeedUlid(172),
    cookiesPolicyDraft: makeSeedUlid(173),
    communityGuidelinesDraft: makeSeedUlid(174),
    copyrightPolicyDraft: makeSeedUlid(175),
    dmcaPolicyDraft: makeSeedUlid(176),
  }),
});

export { makeSeedUlid };
