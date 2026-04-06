# Authoritative Injection Specification

## Purpose
Define where authoritative state enters the system.

## Design
- Inject at frame boundary
- Must not overwrite predicted directly
- Pass through reconciliation layer

## Outcome
Clean separation of authority vs prediction
