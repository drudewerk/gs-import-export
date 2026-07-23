# Security Policy

## Supported Version

Security fixes target the latest production version published through the Google
Workspace Marketplace. Older deployments are not supported.

## Reporting a Vulnerability

Report vulnerabilities privately to
[info@drudewerk.com](mailto:info@drudewerk.com). Include affected behavior,
reproduction steps, impact, and any suggested mitigation.

Do not disclose suspected vulnerabilities, customer data, tokens, script IDs, or
spreadsheet contents in a public issue.

## Dependency Audits

Run `npm run audit` to audit the root project and both workspaces as one
dependency graph, including development dependencies.

- Critical and high-severity vulnerabilities block a production release.
- Moderate vulnerabilities require documented triage before release.
- Low-severity vulnerabilities are handled during routine dependency maintenance.

CI runs `npm run audit:ci` against `audit-baseline.json`. It fails when an
advisory or vulnerable package is new or increases in severity. Baseline changes
require explicit review of every added finding and never replace the strict
production-release audit. `AUDIT.md` records the reviewed findings and their
acceptance rationale.

Development-tool vulnerabilities matter even when the affected package is not
shipped in the sidebar: contributors and CI execute build, lint, Storybook, and
Apps Script deployment tooling against repository content and credentials.

Do not run `npm audit fix --force` without reviewing the proposed dependency and
lockfile changes.

## Apps Script and Data Handling

- Keep `appsscript.json` OAuth scopes to the minimum required for current
  behavior. Scope changes require code justification, test-deployment
  verification, and Marketplace/OAuth review.
- Never log spreadsheet contents, uploaded JSON, customer-derived filenames,
  user identifiers, OAuth tokens, script IDs, or full error objects that may
  contain those values.
- Use synthetic data in samples, fixtures, screenshots, and test spreadsheets.

## Dependency and Release Verification

Dependency updates require reviewed lockfile changes and the applicable checks
in `AGENTS.md`. Before release, follow `RUNBOOK.md`.
