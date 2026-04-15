# LEVEL_12_6_REMOTE_DEPLOYMENT_CANDIDATE_PREP

## Goal
Prepare a minimal implementation-ready remote deployment plan for authoritative server hosting in single-node mode.

## Single-Node Remote Target

- One remote host (VM or bare server) only.
- One containerized authoritative server process.
- One public endpoint exposed for remote client connectivity.
- No clustering, no failover, no multi-region routing.

## External Connectivity Contract

- Public hostname/IP configured by deploy operator.
- One published service port (default `4310`).
- Health endpoint externally reachable for readiness checks.
- Session endpoint reachable from internet client network.

## Minimal Deployment Steps

1. Provision single remote node with Docker/Compose runtime.
2. Deploy server container artifacts to host.
3. Start single service using remote compose file.
4. Validate health endpoint.
5. Run remote client connection/session check.
6. Stop service and confirm clean shutdown.

## Validation Checklist Targets

- remote node accepts inbound connection on configured port
- health/readiness endpoint responds
- client connects to remote server
- session activation succeeds remotely
- disconnect/shutdown leaves no active runtime residue

## Scope Guardrails

- single-node remote deployment only
- no scaling/orchestration
- no infrastructure automation expansion
- no gameplay or 3D scope change
