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

function createImportContext() {
    const writes = [];
    const userProperties = new Map();
    const context = loadAppsScriptContext({
        PropertiesService: {
            getUserProperties: () => ({
                getProperty: (key) => userProperties.get(key) ?? null,
                setProperty: (key, value) => userProperties.set(key, value),
            }),
        },
        SpreadsheetApp: {
            getActiveSpreadsheet: () => ({
                getActiveSheet: () => ({
                    getSelection: () => ({
                        getCurrentCell: () => ({
                            getColumn: () => 2,
                            getRow: () => 4,
                        }),
                    }),
                }),
            }),
        },
        Utilities: {
            base64Decode: (data) => Buffer.from(data, "base64"),
            newBlob: (data) => ({
                getDataAsString: () => Buffer.from(data).toString("utf8"),
            }),
        },
    });

    context.insertDataToSheet = (tabularData, _options, importDestination) => {
        writes.push({
            importDestination: toHostValue(importDestination),
            tabularData: toHostValue(tabularData),
        });
    };

    return {
        context,
        writes,
    };
}

function importDocument(context, documentText, fileName = "fixture.json") {
    context.importJsonFile({
        files: [{
            data: Buffer.from(documentText).toString("base64"),
            fileName,
            fileType: "application/json",
        }],
        options: {
            mergeFiles: false,
            sheet: "active",
            startAt: "selection",
        },
    });
}

for (const fixture of readJsonFixture("import-cases.json")) {
    test(`import converts ${fixture.name}`, () => {
        const { context, writes } = createImportContext();

        importDocument(context, JSON.stringify(fixture.document));

        assert.equal(writes.length, 1);
        assert.deepEqual(writes[0].tabularData, fixture.expectedTabularData);
        assert.deepEqual(writes[0].importDestination, {
            startColumn: 2,
            startRow: 4,
        });
    });
}

test("import rejects invalid JSON before writing tabular data", () => {
    const { context, writes } = createImportContext();
    const invalidJson = fs.readFileSync(
        path.join(fixturesDir, "invalid-json.input.json"),
        "utf8",
    );

    assert.throws(
        () => importDocument(context, invalidJson, "invalid-json.input.json"),
        (error) => error?.name === "SyntaxError",
    );
    assert.equal(writes.length, 0);
});

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
