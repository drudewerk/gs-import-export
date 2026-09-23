import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
    loadAppsScriptContext,
    toHostValue,
} from "./helpers/apps-script-context.js";


const testDir = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.join(testDir, "fixtures");

function readJsonFixture(fileName) {
    return JSON.parse(fs.readFileSync(path.join(fixturesDir, fileName), "utf8"));
}

const exportContext = loadAppsScriptContext();

for (const fixture of readJsonFixture("export-cases.json")) {
    test(`export converts ${fixture.name}`, () => {
        const records = exportContext.arrayToJson(
            fixture.tabularData,
            fixture.startingColumnNumber,
        );

        assert.deepEqual(toHostValue(records), fixture.expectedRecords);
    });
}
