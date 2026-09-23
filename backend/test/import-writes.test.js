import assert from "node:assert/strict";
import crypto from "node:crypto";
import test from "node:test";

import {
    loadAppsScriptContext,
    toHostValue,
} from "./helpers/apps-script-context.js";


test("previews, prepares, and writes an active-sheet import", () => {
    const fixture = createSpreadsheetFixture({
        currentRow: 4,
        currentColumn: 2,
        rangeIsBlank: false,
    });
    const context = loadAppsScriptContext(fixture.globals);
    const request = {
        tables: [{
            tableIndex: 0,
            rowCount: 3,
            columnCount: 2,
        }],
        options: {
            mergeFiles: false,
            sheet: "active",
            startAt: "selection",
        },
    };

    const preview = toHostValue(context.previewJsonImport(request));
    assert.equal(preview.totalRows, 3);
    assert.equal(preview.totalCells, 6);
    assert.deepEqual(preview.destinations[0], {
        addedColumns: 0,
        addedRows: 0,
        columnCount: 2,
        overwritesExisting: true,
        rangeA1: "B4:C6",
        rowCount: 3,
        sheetId: 101,
        sheetName: "Data",
        startColumn: 2,
        startRow: 4,
        tableIndex: 0,
        target: "active",
    });

    const begin = toHostValue(context.beginJsonImport({
        ...request,
        previewToken: preview.token,
    }));
    assert.equal(begin.ok, true);
    assert.equal(begin.destinations[0].sheetId, 101);

    const result = toHostValue(context.writeJsonImportChunk({
        sessionId: begin.sessionId,
        tableIndex: 0,
        chunkIndex: 0,
        values: [
            ["id", "name"],
            [1, "Ada"],
            [2, "Grace"],
        ],
    }));

    assert.deepEqual(result, {
        ok: true,
        rangeA1: "B4:C6",
        rowsWritten: 3,
    });
    assert.deepEqual(fixture.writes, [{
        columnCount: 2,
        rowCount: 3,
        startColumn: 2,
        startRow: 4,
        values: [
            ["id", "name"],
            [1, "Ada"],
            [2, "Grace"],
        ],
    }]);
    assert.deepEqual(fixture.numberFormats, [{
        columnCount: 2,
        format: "@",
        rowCount: 3,
        startColumn: 2,
        startRow: 4,
    }]);
});

test("rejects a stale preview before changing the spreadsheet", () => {
    const fixture = createSpreadsheetFixture();
    const context = loadAppsScriptContext(fixture.globals);
    const request = {
        tables: [{
            tableIndex: 0,
            rowCount: 2,
            columnCount: 1,
        }],
        options: {
            mergeFiles: false,
            sheet: "active",
            startAt: "end",
        },
    };
    const preview = context.previewJsonImport(request);
    fixture.sheet.setLastRow(20);

    const begin = toHostValue(context.beginJsonImport({
        ...request,
        previewToken: preview.token,
    }));

    assert.equal(begin.ok, false);
    assert.match(begin.message, /changed after the preview/);
    assert.equal(fixture.writes.length, 0);
});

test("rejects a preview after its destination sheet is renamed", () => {
    const fixture = createSpreadsheetFixture();
    const context = loadAppsScriptContext(fixture.globals);
    const request = {
        tables: [{ tableIndex: 0, rowCount: 2, columnCount: 1 }],
        options: { mergeFiles: false, sheet: "active", startAt: "end" },
    };
    const preview = context.previewJsonImport(request);
    fixture.sheet.setName("Renamed");

    const begin = toHostValue(context.beginJsonImport({
        ...request,
        previewToken: preview.token,
    }));

    assert.equal(begin.ok, false);
    assert.equal(fixture.writes.length, 0);
});

test("rejects invalid preview options and table indexes", () => {
    const fixture = createSpreadsheetFixture();
    const context = loadAppsScriptContext(fixture.globals);
    const request = {
        tables: [{ tableIndex: -1, rowCount: 2, columnCount: 1 }],
        options: { mergeFiles: false, sheet: "active", startAt: "end" },
    };

    assert.throws(() => context.previewJsonImport(request), /dimensions are invalid/);
    assert.throws(() => context.previewJsonImport({
        ...request,
        tables: [{ ...request.tables[0], tableIndex: 0 }],
        options: { ...request.options, sheet: "elsewhere" },
    }), /options are invalid/);
});

test("appends without requiring an active selection", () => {
    const fixture = createSpreadsheetFixture({ noSelection: true });
    const context = loadAppsScriptContext(fixture.globals);
    const preview = toHostValue(context.previewJsonImport({
        tables: [{ tableIndex: 0, rowCount: 2, columnCount: 1 }],
        options: { mergeFiles: false, sheet: "active", startAt: "end" },
    }));

    assert.equal(preview.destinations[0].rangeA1, "A4:A5");
});

test("reports a failed chunk without counting rows", () => {
    const fixture = createSpreadsheetFixture({
        failWrites: true,
    });
    const context = loadAppsScriptContext(fixture.globals);

    const request = {
        tables: [{
            tableIndex: 0,
            rowCount: 2,
            columnCount: 1,
        }],
        options: {
            mergeFiles: false,
            sheet: "active",
            startAt: "end",
        },
    };
    const preview = context.previewJsonImport(request);
    const begin = toHostValue(context.beginJsonImport({
        ...request,
        previewToken: preview.token,
    }));
    const result = toHostValue(context.writeJsonImportChunk({
        sessionId: begin.sessionId,
        tableIndex: 0,
        chunkIndex: 0,
        values: [["id"], [1]],
    }));

    assert.equal(result.ok, false);
    assert.equal(result.rowsWritten, 0);
    assert.equal(fixture.writes.length, 0);
});

test("reports written rows when session progress cannot be saved", () => {
    const fixture = createSpreadsheetFixture({ failSessionSaveAfterWrite: true });
    const context = loadAppsScriptContext(fixture.globals);
    const request = {
        tables: [{ tableIndex: 0, rowCount: 2, columnCount: 1 }],
        options: { mergeFiles: false, sheet: "active", startAt: "end" },
    };
    const preview = context.previewJsonImport(request);
    const begin = toHostValue(context.beginJsonImport({
        ...request,
        previewToken: preview.token,
    }));

    const result = toHostValue(context.writeJsonImportChunk({
        sessionId: begin.sessionId,
        tableIndex: 0,
        chunkIndex: 0,
        values: [["id"], [1]],
    }));

    assert.equal(result.ok, false);
    assert.equal(result.rowsWritten, 2);
    assert.equal(result.rangeA1, "A4:A5");
    assert.equal(fixture.writes.length, 1);
});

test("creates and expands a new sheet before writing", () => {
    const fixture = createSpreadsheetFixture();
    const context = loadAppsScriptContext(fixture.globals);
    const request = {
        tables: [{
            tableIndex: 0,
            rowCount: 1_200,
            columnCount: 30,
        }],
        options: {
            mergeFiles: false,
            sheet: "new",
            startAt: "end",
        },
    };
    const preview = context.previewJsonImport(request);
    const begin = toHostValue(context.beginJsonImport({
        ...request,
        previewToken: preview.token,
    }));

    assert.equal(begin.ok, true);
    assert.equal(begin.destinations[0].sheetName, "Sheet2");
    assert.equal(fixture.createdSheets[0].getMaxRows(), 1_200);
    assert.equal(fixture.createdSheets[0].getMaxColumns(), 30);
});

test("rejects writes that do not belong to a prepared import session", () => {
    const fixture = createSpreadsheetFixture();
    const context = loadAppsScriptContext(fixture.globals);

    const result = toHostValue(context.writeJsonImportChunk({
        sessionId: "missing-session-1234",
        tableIndex: 0,
        chunkIndex: 0,
        values: [["id"], [1]],
    }));

    assert.equal(result.ok, false);
    assert.equal(result.rowsWritten, 0);
    assert.equal(fixture.writes.length, 0);
});

test("enforces chunk order and makes an identical retry idempotent", () => {
    const fixture = createSpreadsheetFixture();
    const context = loadAppsScriptContext(fixture.globals);
    const request = {
        tables: [{
            tableIndex: 0,
            rowCount: 4,
            columnCount: 1,
        }],
        options: {
            mergeFiles: false,
            sheet: "active",
            startAt: "end",
        },
    };
    const preview = context.previewJsonImport(request);
    const begin = toHostValue(context.beginJsonImport({
        ...request,
        previewToken: preview.token,
    }));

    const skipped = toHostValue(context.writeJsonImportChunk({
        sessionId: begin.sessionId,
        tableIndex: 0,
        chunkIndex: 1,
        values: [[2], [3]],
    }));
    assert.equal(skipped.ok, false);
    assert.equal(fixture.writes.length, 0);

    const firstRequest = {
        sessionId: begin.sessionId,
        tableIndex: 0,
        chunkIndex: 0,
        values: [["id"], [1]],
    };
    const first = toHostValue(context.writeJsonImportChunk(firstRequest));
    const retry = toHostValue(context.writeJsonImportChunk(firstRequest));

    assert.equal(first.ok, true);
    assert.deepEqual(retry, first);
    assert.equal(fixture.writes.length, 1);

    const changedRetry = toHostValue(context.writeJsonImportChunk({
        ...firstRequest,
        values: [["id"], [999]],
    }));
    assert.equal(changedRetry.ok, false);
    assert.equal(fixture.writes.length, 1);
});

function createSpreadsheetFixture({
    currentRow = 1,
    currentColumn = 1,
    rangeIsBlank = true,
    failWrites = false,
    failSessionSaveAfterWrite = false,
    noSelection = false,
} = {}) {
    const writes = [];
    const numberFormats = [];
    const createdSheets = [];
    const userProperties = new Map();
    let uuidCounter = 0;
    const sheets = [];

    function createSheet(id, name) {
        let sheetName = name;
        let maxRows = 1_000;
        let maxColumns = 26;
        let lastRow = 3;
        const sheet = {
            getSheetId: () => id,
            getName: () => sheetName,
            setName: value => {
                sheetName = value;
            },
            getMaxRows: () => maxRows,
            getMaxColumns: () => maxColumns,
            getLastRow: () => lastRow,
            setLastRow: value => {
                lastRow = value;
            },
            insertRowsAfter: (_after, count) => {
                maxRows += count;
            },
            insertColumnsAfter: (_after, count) => {
                maxColumns += count;
            },
            getRange: (startRow, startColumn, rowCount, columnCount) => ({
                isBlank: () => rangeIsBlank,
                setNumberFormat: format => {
                    numberFormats.push({
                        startRow,
                        startColumn,
                        rowCount,
                        columnCount,
                        format,
                    });
                },
                setValues: values => {
                    if (failWrites) {
                        throw new Error("synthetic write failure");
                    }
                    writes.push({
                        startRow,
                        startColumn,
                        rowCount,
                        columnCount,
                        values: structuredClone(values),
                    });
                },
            }),
        };
        sheets.push(sheet);
        return sheet;
    }

    const sheet = createSheet(101, "Data");
    const spreadsheet = {
        getId: () => "spreadsheet-123",
        getSheets: () => sheets,
        getActiveSheet: () => sheet,
        getSelection: () => noSelection ? null : ({
            getCurrentCell: () => ({
                getColumn: () => currentColumn,
                getRow: () => currentRow,
            }),
        }),
        insertSheet: () => {
            const created = createSheet(101 + sheets.length, `Sheet${sheets.length + 1}`);
            createdSheets.push(created);
            return created;
        },
    };

    return {
        createdSheets,
        numberFormats,
        sheet,
        writes,
        globals: {
            LockService: {
                getUserLock: () => ({
                    releaseLock: () => undefined,
                    waitLock: () => undefined,
                }),
            },
            PropertiesService: {
                getUserProperties: () => ({
                    deleteProperty: key => userProperties.delete(key),
                    getProperty: key => userProperties.get(key) ?? null,
                    getProperties: () => Object.fromEntries(userProperties),
                    setProperty: (key, value) => {
                        if (
                            failSessionSaveAfterWrite
                            && key.startsWith("json_import_session:")
                            && JSON.parse(value).nextChunkIndex > 0
                        ) {
                            throw new Error("synthetic session persistence failure");
                        }
                        userProperties.set(key, value);
                    },
                }),
            },
            SpreadsheetApp: {
                getActiveSpreadsheet: () => spreadsheet,
            },
            Utilities: {
                DigestAlgorithm: {
                    SHA_256: "SHA_256",
                },
                base64Encode: bytes => Buffer.from(bytes).toString("base64"),
                computeDigest: (_algorithm, value) => (
                    [...crypto.createHash("sha256").update(value).digest()]
                ),
                getUuid: () => {
                    uuidCounter += 1;
                    return `test-session-${uuidCounter.toString().padStart(4, "0")}`;
                },
                newBlob: value => ({
                    getBytes: () => [...Buffer.from(value)],
                }),
            },
        },
    };
}
