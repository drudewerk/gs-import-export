# Agent Execution Contract

## Required Reading

Read these files in order before changing the repository:

1. `CONTEXT.md` for the project language.
2. Any relevant repository skill, when one exists.
3. `SECURITY.md` before changing dependencies, logging, OAuth scopes, uploads,
   spreadsheet access, or deployment behavior.
4. `REVIEW.md` when reviewing or before handoff. Read `TESTING.md` when behavior
   changes and `RUNBOOK.md` for setup or deployment.

## Repository Map

- `frontend/src/` is the sidebar UI module. Its interface to Apps Script is the
  asynchronous `google.script.run` calls declared in `frontend/src/globals.d.ts`.
- `backend/src/` is the Apps Script module. Its global functions are the
  interface used by menus, sidebars, and triggers.
- `SpreadsheetApp` is the external Sheets adapter at the spreadsheet side-effect
  seam. Reads and writes operate on the active spreadsheet, sheet, range, or
  selection.
- `appsscript.json` is the source manifest.
- `frontend/dist/`, `backend/dist/`, and `apps-script/` are generated output.
  `copyToAppsScript.js` is the build/copy seam that assembles the deployable
  Apps Script project.

## Commands

Run commands from the repository root:

| Task | Command |
| --- | --- |
| Install all dependencies | `npm install` |
| Lint frontend and backend | `npm run lint` |
| Run package tests when present | `npm test` |
| Build frontend and backend | `npm run build` |
| Copy build output | `npm run copy` |
| Audit project and workspaces | `npm run audit` |
| Push the generated Apps Script project | `npm run push` |
| Build, copy, and push | `npm run deploy` |

`push` and `deploy` modify the configured remote Apps Script project. Run them
only when the user explicitly authorizes that write.

## Source and Scope Discipline

- Edit `frontend/src/`, `backend/src/`, root configuration, and
  `appsscript.json`. Never hand-edit `apps-script/`, frontend `dist/`, or backend
  `dist/`.
- Build and copy before inspecting generated Apps Script output.
- Preview the exact sheet, range, dimensions, and overwrite behavior before
  adding or changing a spreadsheet write. The preview must describe the same
  values that the write will use.
- Do not broaden a change into JSON-shape, sheet-layout, scope, or release-policy
  decisions that the task did not request.
- Follow the data-handling and logging policy in `SECURITY.md`.

## Apps Script Constraints

- Functions called by menus, triggers, or `google.script.run` must remain global
  entry points in generated Apps Script output.
- Sidebar calls are asynchronous. Provide success and failure handlers and do
  not assume the active selection is unchanged across separate calls.
- Apps Script executions and Google Sheets have platform limits. Batch reads and
  writes with `getValues()` and `setValues()`; avoid per-cell service calls.
- `SpreadsheetApp` calls have immediate customer-visible side effects. Create
  sheets or write ranges only after validating dimensions and destination state.
- Follow the OAuth scope policy in `SECURITY.md`.

## Required Verification

| Change | Required checks |
| --- | --- |
| Guidance or workflow only | Links, relevant commands, `git diff --check` |
| Frontend | `npm run lint --workspace frontend`, `npm run build --workspace frontend` |
| Backend or JSON mapping | `npm run lint --workspace backend`, `npm test`, `npm run build --workspace backend`, `npm run copy`; follow `TESTING.md` for live verification |
| Manifest, scopes, or dependencies | `npm run lint`, `npm test`, `npm run build`, `npm run copy`, `npm run audit`, then an authorized test deployment |
| Build/copy tooling | Clean build and copy; inspect `apps-script/` for expected files |
| Push or release | All applicable checks plus the `RUNBOOK.md` release gate |

## Guidance Maintenance

Keep repository guidance accurate in the same change that alters the behavior,
interface, command, or constraint it describes.

- `CONTEXT.md` owns domain language only.
- `AGENTS.md` owns the repository map, execution rules, commands, and
  change-specific verification.
- `REVIEW.md` owns durable, repository-specific rules for code reviewers. It is
  not a handoff checklist or a copy of CI.
- `SECURITY.md` owns public reporting and security policy.
- `TESTING.md` owns test layers, fixture conventions, and current test
  capabilities.
- `RUNBOOK.md` owns developer setup and deployment/release operations.

Update the narrowest owning file, link to it instead of duplicating policy, and
remove guidance that is no longer true.
