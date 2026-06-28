const TEAM_BASE_PORTS = Object.freeze({
  owner: Object.freeze({ apiPort: 5501, webPort: 5500 }),
  alfa: Object.freeze({ apiPort: 5511, webPort: 5510 }),
  bravo: Object.freeze({ apiPort: 5521, webPort: 5520 }),
  charlie: Object.freeze({ apiPort: 5531, webPort: 5530 }),
  delta: Object.freeze({ apiPort: 5541, webPort: 5540 }),
  echo: Object.freeze({ apiPort: 5551, webPort: 5550 }),
  foxtrot: Object.freeze({ apiPort: 5561, webPort: 5560 }),
  golf: Object.freeze({ apiPort: 5571, webPort: 5570 }),
  hotel: Object.freeze({ apiPort: 5581, webPort: 5580 }),
});

const ROLE_PORT_OFFSETS = Object.freeze({
  owner: 0,
  codex: 2,
});

export const DEFAULT_BOOTSTRAP_ROLE = "owner";
export const DEFAULT_BOOTSTRAP_TEAM = "owner";
export const SUPPORTED_BOOTSTRAP_ROLES = Object.freeze(Object.keys(ROLE_PORT_OFFSETS));
export const SUPPORTED_BOOTSTRAP_TEAMS = Object.freeze(Object.keys(TEAM_BASE_PORTS));

function normalizeToken(value, fallback) {
  return String(value || fallback).trim().toLowerCase();
}

export function supportedBootstrapRolesLabel() {
  return SUPPORTED_BOOTSTRAP_ROLES.join(", ");
}

export function supportedBootstrapTeamsLabel() {
  return SUPPORTED_BOOTSTRAP_TEAMS.join(", ");
}

export function resolveTeamPortConfig({
  role = DEFAULT_BOOTSTRAP_ROLE,
  team = DEFAULT_BOOTSTRAP_TEAM,
} = {}) {
  const normalizedTeam = normalizeToken(team, DEFAULT_BOOTSTRAP_TEAM);
  const normalizedRole = normalizeToken(role, DEFAULT_BOOTSTRAP_ROLE);
  const basePorts = TEAM_BASE_PORTS[normalizedTeam];
  if (!basePorts) {
    throw new Error(
      `Unknown bootstrap team "${String(team || "").trim() || "(empty)"}". Use one of: ${supportedBootstrapTeamsLabel()}.`
    );
  }
  const offset = ROLE_PORT_OFFSETS[normalizedRole];
  if (offset === undefined) {
    throw new Error(
      `Unknown bootstrap role "${String(role || "").trim() || "(empty)"}". Use one of: ${supportedBootstrapRolesLabel()}.`
    );
  }
  return Object.freeze({
    apiPort: basePorts.apiPort + offset,
    role: normalizedRole,
    team: normalizedTeam,
    webPort: basePorts.webPort + offset,
  });
}

function parseNamedArgument(args, name, fallback, supportedLabel) {
  const values = Array.from(args);
  for (let index = 0; index < values.length; index += 1) {
    const argument = values[index];
    if (argument === `--${name}`) {
      const value = values[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`Missing bootstrap ${name} after --${name}. Use one of: ${supportedLabel()}.`);
      }
      return normalizeToken(value, fallback);
    }
    if (argument.startsWith(`--${name}=`)) {
      const value = argument.slice(`--${name}=`.length);
      if (!value) {
        throw new Error(`Missing bootstrap ${name} after --${name}=. Use one of: ${supportedLabel()}.`);
      }
      return normalizeToken(value, fallback);
    }
  }
  return fallback;
}

function positionalArguments(args = []) {
  const values = Array.from(args);
  const optionsWithValues = new Set(["mode", "role", "team"]);
  const positional = [];
  for (let index = 0; index < values.length; index += 1) {
    const argument = values[index];
    if (!argument) {
      continue;
    }
    if (argument.startsWith("--")) {
      if (argument.includes("=")) {
        continue;
      }
      const optionName = argument.slice(2);
      if (optionsWithValues.has(optionName) && values[index + 1] && !values[index + 1].startsWith("--")) {
        index += 1;
      }
      continue;
    }
    positional.push(argument);
  }
  return positional;
}

export function parseRoleArgument(args = []) {
  const explicitRole = parseNamedArgument(args, "role", "", supportedBootstrapRolesLabel);
  if (explicitRole) {
    return explicitRole;
  }
  const positionalRole = positionalArguments(args).find((argument) => {
    const normalizedRole = normalizeToken(argument, "");
    return ROLE_PORT_OFFSETS[normalizedRole] !== undefined;
  });
  return normalizeToken(positionalRole, DEFAULT_BOOTSTRAP_ROLE);
}

export function parseTeamArgument(args = []) {
  const explicitTeam = parseNamedArgument(args, "team", "", supportedBootstrapTeamsLabel);
  if (explicitTeam) {
    return explicitTeam;
  }
  const positional = positionalArguments(args);
  const positionalTeam = positional.find((argument) => {
    const normalizedTeam = normalizeToken(argument, "");
    return TEAM_BASE_PORTS[normalizedTeam] !== undefined;
  });
  if (positionalTeam) {
    return normalizeToken(positionalTeam, DEFAULT_BOOTSTRAP_TEAM);
  }
  const unknownTeam = positional.find((argument) => {
    const normalizedArgument = normalizeToken(argument, "");
    return ROLE_PORT_OFFSETS[normalizedArgument] === undefined;
  });
  return normalizeToken(unknownTeam, DEFAULT_BOOTSTRAP_TEAM);
}
