import assert from "node:assert/strict";
import test from "node:test";

import { loadAppsScriptContext } from "./helpers/apps-script-context.js";

test("compiled Apps Script exposes the sidebar and menu entry points", () => {
    const context = loadAppsScriptContext();

    for (const entryPoint of [
        "getCurrentState",
        "getOptions",
        "getRateUsState",
        "beginJsonImport",
        "onOpen",
        "previewJsonImport",
        "saveOptions",
        "setRateUsState",
        "sheetDataToArray",
        "writeJsonImportChunk",
    ]) {
        assert.equal(typeof context[entryPoint], "function", entryPoint);
    }
});
