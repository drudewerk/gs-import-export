# Testing

## Automated Tests

`npm test` runs all three package-root test suites:

- The root suite verifies that the CI audit baseline cannot allow high-severity
  findings.
- The frontend suite renders the sidebar with a synthetic `google.script.run`
  adapter and exercises its controlled export option.
- The backend suite compiles the Apps Script module, verifies its required
  global entry points, and exercises fixture-based JSON-to-tabular-data and
  tabular-data-to-JSON conversion.

These tests protect the dependency and deployment seams. They do not replace
the live import and export checks below.

## Synthetic Samples and Fixtures

- `samples/` contains synthetic JSON documents for manual import checks.
- `backend/test/fixtures/` contains synthetic input and expected output for
  automated conversion checks.
- Never add customer spreadsheets, uploaded JSON, user identifiers, or secrets.
- Keep input and expected tabular data or record sets together in each fixture.
- Name fixtures after the behavior they demonstrate, such as
  `nested-arrays.json`, `missing-fields.json`, or `empty-record-set.json`.
- Changed parsing or mapping behavior requires a regression fixture.

## Live Apps Script Verification

Live verification writes to Google systems and requires explicit authorization.
Complete the applicable local checks in `AGENTS.md`, then use a dedicated test
spreadsheet with synthetic data:

1. Inspect `apps-script/` and run `clasp status` from that directory.
2. Push only to the configured test Apps Script project.
3. Execute an Editor add-on test deployment.
4. Import representative files from `samples/` and compare the exact destination
   range with the intended tabular data.
5. Export the whole sheet and a selection; inspect the downloaded JSON.
6. Exercise safe failures such as invalid JSON, empty data, and a missing
   selection without recording customer data in logs.
