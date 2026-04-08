/*
Toolbox Aid
David Quesenberry
04/05/2026
contractVersioning.js
*/

import { cloneJson } from '../../src/shared/utils/jsonUtils.js';

function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function parseVersionParts(value) {
  const normalized = sanitizeText(value).replace(/^v/i, "");
  if (!normalized) {
    return null;
  }

  const segments = normalized.split(".");
  if (segments.length > 3) {
    return null;
  }

  const numbers = [];
  for (let index = 0; index < segments.length; index += 1) {
    const segment = sanitizeText(segments[index]);
    if (!/^\d+$/.test(segment)) {
      return null;
    }
    numbers.push(Number(segment));
  }

  while (numbers.length < 3) {
    numbers.push(0);
  }

  return {
    major: numbers[0],
    minor: numbers[1],
    patch: numbers[2]
  };
}

function toSemver(parts) {
  if (!parts) {
    return "";
  }
  return `${parts.major}.${parts.minor}.${parts.patch}`;
}

function uniqueSemvers(values) {
  const seen = new Set();
  const ordered = [];
  const source = Array.isArray(values) ? values : [];
  source.forEach((value) => {
    const normalized = normalizeContractVersion(value);
    if (!normalized || seen.has(normalized)) {
      return;
    }
    seen.add(normalized);
    ordered.push(normalized);
  });
  return ordered;
}

export function normalizeContractVersion(value) {
  return toSemver(parseVersionParts(value));
}

export function compareContractVersion(left, right) {
  const leftParts = parseVersionParts(left);
  const rightParts = parseVersionParts(right);
  if (!leftParts || !rightParts) {
    return 0;
  }

  if (leftParts.major !== rightParts.major) {
    return leftParts.major - rightParts.major;
  }
  if (leftParts.minor !== rightParts.minor) {
    return leftParts.minor - rightParts.minor;
  }
  return leftParts.patch - rightParts.patch;
}

export function createVersionedContractPolicy(options = {}) {
  const contractId = sanitizeText(options.contractId);
  const currentVersion = normalizeContractVersion(options.currentVersion);
  const supportedVersions = uniqueSemvers(options.supportedVersions || [currentVersion]);
  const deprecatedVersions = uniqueSemvers(options.deprecatedVersions || []);

  if (currentVersion && !supportedVersions.includes(currentVersion)) {
    supportedVersions.unshift(currentVersion);
  }

  return Object.freeze({
    contractId,
    currentVersion,
    supportedVersions: Object.freeze(supportedVersions.slice()),
    deprecatedVersions: Object.freeze(deprecatedVersions.slice())
  });
}

export function evaluateContractVersion(inputVersion, policyInput) {
  const policy = createVersionedContractPolicy(policyInput || {});
  const normalizedVersion = normalizeContractVersion(inputVersion);

  if (!normalizedVersion) {
    return {
      status: "failed",
      code: "INVALID_CONTRACT_VERSION",
      message: `Expected contractVersion ${policy.supportedVersions.join(", ")}.`,
      details: {
        contractId: policy.contractId,
        inputVersion: sanitizeText(inputVersion),
        supportedVersions: policy.supportedVersions.slice()
      }
    };
  }

  if (!policy.supportedVersions.includes(normalizedVersion)) {
    return {
      status: "failed",
      code: "UNSUPPORTED_CONTRACT_VERSION",
      message: `Expected contractVersion ${policy.supportedVersions.join(", ")}.`,
      details: {
        contractId: policy.contractId,
        inputVersion: normalizedVersion,
        supportedVersions: policy.supportedVersions.slice()
      }
    };
  }

  return {
    status: "ready",
    code: policy.deprecatedVersions.includes(normalizedVersion)
      ? "SUPPORTED_CONTRACT_VERSION_DEPRECATED"
      : "SUPPORTED_CONTRACT_VERSION",
    message: policy.deprecatedVersions.includes(normalizedVersion)
      ? `contractVersion ${normalizedVersion} is supported but deprecated.`
      : `contractVersion ${normalizedVersion} is supported.`,
    details: {
      contractId: policy.contractId,
      inputVersion: normalizedVersion,
      supportedVersions: policy.supportedVersions.slice(),
      deprecatedVersions: policy.deprecatedVersions.slice(),
      currentVersion: policy.currentVersion
    }
  };
}

export function createVersionedContractMetadata(policyInput) {
  const policy = createVersionedContractPolicy(policyInput || {});
  return cloneJson({
    contractId: policy.contractId,
    currentVersion: policy.currentVersion,
    supportedVersions: policy.supportedVersions.slice(),
    deprecatedVersions: policy.deprecatedVersions.slice()
  });
}
