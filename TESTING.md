# Testing

## Current State

The repository does not currently have automated application tests. `npm test`
runs frontend and backend test scripts only when they are present. A successful
no-test run is not evidence that import or export behavior was verified.

## Synthetic Samples and Fixtures

- `samples/` contains synthetic JSON documents for manual import checks.
- Never add customer spreadsheets, uploaded JSON, user identifiers, or secrets.
- For future parsing tests, keep input and expected tabular or JSON output
  together under the package being tested.
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
