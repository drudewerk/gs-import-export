# The JSON Import & Export Google Sheets™ Add-On by Drudewerk

The JSON Import & Export by Drudewerk Add-On is a powerful tool designed to enhance your experience with Google Sheets™ by providing import and export capabilities for JSON files. With this add-on, you can easily integrate JSON data into your spreadsheets, making data analysis and manipulation more efficient and intuitive.

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **VSCode**
- **Node.js** - v22.13.0 or later
- **npm** - v10.9.8 or later
- **Clasp authentication** for the Google account used by the Apps Script
  project. The repository installs the supported Clasp version locally.

 > Ensure that you are logged in only in one Google account in current browser session. There is a bug which prevents some Google Add-on debug features from working in sessions with multiple google accounts

## Setup Instructions

See [RUNBOOK.md](RUNBOOK.md) for prerequisites, dependency installation,
generated-output inspection, test deployment, and release steps.

## Supported JSON imports

Each JSON document must be UTF-8 text containing either:

- one JSON object, which becomes one record; or
- a non-empty top-level array of JSON objects, which becomes an ordered record
  set.

Nested objects and arrays are flattened into dot-separated field paths. Numeric
path segments identify array positions. Records may have different fields;
missing values produce blank spreadsheet cells. Top-level primitives, empty
record sets, and documents with no importable fields are rejected before any
spreadsheet rows are written.

Literal dotted keys must not collide with nested paths. For example,
`{"profile.name": "literal", "profile": {"name": "nested"}}` is rejected
instead of silently choosing one value.

When **Merge data from all files together** is enabled, all records share one
unioned header and one destination. Without merge, every file keeps its own
header. Imports into the current sheet are stacked; imports into new sheets use
one new sheet per file unless the files are merged.

Before writing, the sidebar shows the destination ranges, dimensions, overwrite
status, and any required sheet expansion. It then writes complete rows in
bounded chunks and reports read, preparation, and write progress. JSON parsing
and flattening run in a dedicated browser worker so the sidebar remains
responsive while large documents are prepared.

### Practical limits

The supported import envelope is:

- 50 MiB per JSON document;
- 100 MiB across all selected documents;
- 500,000 estimated output cells across all destination ranges, including
  headers and blank cells; and
- 25,000 cells and approximately 1 MiB per spreadsheet write chunk.

These are add-on support limits, not Google upload limits. The destination must
also fit within Google Sheets' current
[10-million-cell and 18,278-column limits](https://support.google.com/drive/answer/37603).
Existing sheets may leave less available capacity.

The 50 MiB limit assumes a current browser with Web Worker support and sufficient
memory for the parsed JSON representation. Highly nested documents or unusually
large field names can require substantially more memory than their file size and
may need to be split further.

If an import is too large, split it into smaller documents, remove fields that
are not needed, or disable merge when files have substantially different
fields.

### Interrupted imports

Chunked writes are not rolled back automatically. If an import stops, the
sidebar reports whether no rows, some rows, or all rows were written, along with
the confirmed row count and prepared sheet names. Row counts include header
rows. Review or remove the reported destination ranges before retrying so an
append import does not duplicate records.

Each confirmed import uses an expiring server-side session that binds chunks to
the reviewed sheet ranges and enforces their order. If a browser response is
lost, the same chunk can be retried without advancing or writing a second range.

## Testing

See [TESTING.md](TESTING.md) for the current automated-test status, synthetic
sample conventions, and live Apps Script verification.

Security issues should be reported according to [SECURITY.md](SECURITY.md).

## License

This project is licensed under the MIT License with the [Commons Clause](https://commonsclause.com/).

The Commons Clause restricts this software from being used in commercial products or services. For more details, see the [LICENSE](https://github.com/drudewerk/gs-import-export/blob/main/LICENSE) file.

## Contributions

We welcome and appreciate contributions from the community! If you have an idea, suggestion, or improvement, feel free to open an issue or submit a pull request.
