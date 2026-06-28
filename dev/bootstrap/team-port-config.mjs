const TEAM_PORTS = Object.freeze({
  owner: Object.freeze({ apiPort: 5501, webPort: 5500 }),
  alpha: Object.freeze({ apiPort: 5511, webPort: 5510 }),
  bravo: Object.freeze({ apiPort: 5521, webPort: 5520 }),
  charlie: Object.freeze({ apiPort: 5531, webPort: 5530 }),
  gamma: Object.freeze({ apiPort: 5541, webPort: 5540 }),
  beta: Object.freeze({ apiPort: 5551, webPort: 5550 }),
});

export const DEFAULT_BOOTSTRAP_TEAM = "owner";
export const DEFAULT_BOOTSTRAP_HOST = "127.0.0.1";
export const BOOTSTRAP_TEAM_ALIASES = Object.freeze({
  default: DEFAULT_BOOTSTRAP_TEAM,
});

export const SUPPORTED_BOOTSTRAP_TEAMS = Object.freeze(Object.keys(TEAM_PORTS));

export function supportedBootstrapTeamsMessage() {
  return [...SUPPORTED_BOOTSTRAP_TEAMS, "default"].join("|");
}

export function normalizeBootstrapTeam(team = DEFAULT_BOOTSTRAP_TEAM) {
  const requestedTeam = String(team || DEFAULT_BOOTSTRAP_TEAM).trim().toLowerCase();
  return BOOTSTRAP_TEAM_ALIASES[requestedTeam] || requestedTeam;
}

export function resolveTeamPortConfig(team = DEFAULT_BOOTSTRAP_TEAM) {
  const normalizedTeam = normalizeBootstrapTeam(team);
  const ports = TEAM_PORTS[normalizedTeam];
  if (!ports) {
    throw new Error(
      `Unknown bootstrap team "${team}". Use --team ${supportedBootstrapTeamsMessage()}.`
    );
  }
  return Object.freeze({
    apiPort: ports.apiPort,
    apiUrl: `http://${DEFAULT_BOOTSTRAP_HOST}:${ports.apiPort}/api`,
    host: DEFAULT_BOOTSTRAP_HOST,
    requestedTeam: String(team || DEFAULT_BOOTSTRAP_TEAM).trim() || DEFAULT_BOOTSTRAP_TEAM,
    team: normalizedTeam,
    webPort: ports.webPort,
    webUrl: `http://${DEFAULT_BOOTSTRAP_HOST}:${ports.webPort}`,
  });
}
