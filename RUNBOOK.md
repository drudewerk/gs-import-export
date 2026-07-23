# Development and Release Runbook

## Prerequisites

- Node.js 22 or later
- npm 10.9 or later
- `clasp` authenticated to the intended Google account
- Access to a dedicated test spreadsheet and the configured Apps Script project

Use one Google account in the browser while testing the add-on.

## Setup

```bash
npm run install-deps
```

Root `.clasp.json` and generated `apps-script/` output are local
configuration or build artifacts and must not be committed.

## Verify and Preview

Run the change-specific checks in `AGENTS.md`. Inspect the generated files and
run `clasp status` from `apps-script/` before any remote write.

## Push and Test Deployment

`npm run push` updates the configured Apps Script project. `npm run deploy`
builds, copies, and performs that same push; it does not publish a Marketplace
release. Run either command only with explicit authorization.

After pushing:

1. Open the Apps Script project.
2. Create or update an Editor add-on test deployment using the latest code.
3. Run the import and export checks in `TESTING.md` against a synthetic test
   spreadsheet.
4. Review Apps Script executions for failures without adding customer-data
   logging.

## Marketplace Release

Before publishing:

- Review the release changes against `REVIEW.md`.
- Resolve release-blocking audit findings.
- Confirm generated output comes from the reviewed source revision.
- Review `appsscript.json` scopes and any OAuth consent implications.
- Verify listing copy, screenshots, support links, and privacy/security links.
- Create or select the intended versioned Apps Script deployment.
- Record the source revision and deployment version used for the release.

Production release and Marketplace listing changes are manual, approval-gated
operations.

## Post-Release Check

Install or update the production add-on in a clean test spreadsheet. Verify the
menu, import, whole-sheet export, selection export, and safe error handling with
synthetic data. If verification fails, stop rollout and restore the previous
versioned deployment.
