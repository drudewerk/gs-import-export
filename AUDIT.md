# Dependency Audit Triage

`audit-baseline.json` contains the machine-readable findings accepted by CI.
This file records why each finding is temporarily accepted. Critical and
high-severity findings are never accepted by the baseline.

## Current Findings

Reviewed on 2026-07-23 against `@google/clasp` 3.3.0.

### UUID buffer bounds advisory

- Advisory: `GHSA-w5hq-g745-h8pq` (`1119441`)
- Dependency path: `@google/clasp` → `googleapis` / `googleapis-common` /
  `gaxios` → `uuid`
- Exposure: development and deployment tooling only. The sidebar and Apps
  Script output do not include these packages, and this repository does not
  call the affected UUID buffer-writing interface directly.
- Available remediation: npm proposes downgrading clasp to 2.5.0. That release
  predates the clasp path-traversal fix in 3.2.0 and is not an acceptable
  security trade.
- Decision: accept the moderate transitive finding until clasp's Google API
  dependencies adopt a supported UUID release.

### Hono static-file path traversal advisory

- Advisory: `GHSA-frvp-7c67-39w9` (`1124006`)
- Dependency path: `@google/clasp` → `@modelcontextprotocol/sdk` →
  `@hono/node-server`
- Exposure: development and deployment tooling only. The repository uses
  clasp's Apps Script commands and does not run the affected Hono static-file
  server.
- Available remediation: the fixed Hono major is outside the MCP SDK's current
  compatible dependency range, and `npm audit fix` produces no lockfile change.
- Decision: accept the moderate transitive finding until clasp or the MCP SDK
  adopts the fixed Hono release.

## Review Trigger

Re-run the root, frontend, and backend audits whenever clasp or its transitive
Google API or MCP dependencies change. Remove findings from both this file and
`audit-baseline.json` as soon as a compatible fix is available.
