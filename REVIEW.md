# Code Review Rules

Use these repository-specific rules in addition to normal correctness review.

## Always Flag

- An import preview and its write path derive different values, dimensions,
  destination ranges, or overwrite behavior.
- An ambiguous JSON shape is resolved automatically when the choice changes the
  resulting records, field paths, or sheet layout.
- A spreadsheet mutation can create, clear, or overwrite cells outside the
  destination presented to the user.
- Changed parsing or mapping behavior has no representative synthetic fixture.
- A menu, trigger, or sidebar call targets an Apps Script function that will not
  remain a global entry point in generated output.
- Changed code violates `SECURITY.md`.

## Review Boundaries

- Do not review `frontend/dist/`, `backend/dist/`, or `apps-script/` as source.
  Trace findings to the source or build/copy seam that produced them.
- Do not request formatting changes already enforced by the configured linters.
- Do not restate CI results or operational handoff steps in review findings.
