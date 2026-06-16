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
    user: makeSeedUlid(72),
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
});

export { makeSeedUlid };
