# Testing

## Automated Tests

`npm test` runs all three package-root test suites:

- The root suite verifies that the CI audit baseline cannot allow high-severity
  findings.
- The frontend suite renders the sidebar with a synthetic `google.script.run`
  adapter, exercises its controlled export option, and verifies import size
  limits, JSON preparation, ambiguous-path rejection, progress, merge behavior,
  chunk boundaries, and retry behavior.
- The backend suite compiles the Apps Script module, verifies its required
  global entry points, exercises fixture-based tabular-data-to-JSON conversion,
  and verifies import destination previews, stale-preview rejection, sheet
  expansion, chunk writes, and write failures.

These tests protect the dependency and deployment seams. They do not replace
the live import and export checks below.

## Synthetic Samples and Fixtures

- `samples/` contains synthetic JSON documents for manual import checks.
- `backend/test/fixtures/` contains synthetic input and expected output for
  automated conversion checks.
- `frontend/test/fixtures/` contains synthetic browser-import regression inputs.
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
5. Generate synthetic JSON locally and exercise imports near 50 MiB and 500,000
   output cells. Confirm that read and write progress advances, the preview
   matches the written ranges, and no Apps Script execution exceeds its limit.
6. Import enough rows or wide records to require multiple chunks; confirm all
   rows are contiguous and headers occur only where the selected merge behavior
   requires them.
7. While a large document is parsing, interact with the sidebar and confirm its
   progress animation remains responsive.
8. Export the whole sheet and a selection; inspect the downloaded JSON.
9. Exercise safe failures such as an oversized file, oversized estimated output,
   invalid JSON, empty data, a stale destination preview, and a missing
   selection without recording customer data in logs.
10. Use the automated sheet adapter to inject a middle-chunk write failure and
   verify later chunks are not attempted and the reported confirmed-row count is
   exact. Do not induce failures in a customer spreadsheet.
