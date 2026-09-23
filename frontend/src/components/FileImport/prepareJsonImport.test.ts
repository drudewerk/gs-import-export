// @vitest-environment jsdom

import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

import { importCoverage } from "./importWorkflow";
import { prepareJsonDocument } from "./prepareJsonDocument";
import {
    ImportPreparationError,
    MAX_CHUNK_BYTES,
    MAX_FILE_BYTES,
    MAX_OUTPUT_CELLS,
    MAX_TOTAL_BYTES,
    prepareJsonImport,
    validateImportFileSizes,
    validateOutputCellCount
} from "./prepareJsonImport";


const defaultOptions: UploadOptions = {
    mergeFiles: false,
    sheet: "active",
    startAt: "end"
};

describe("import size limits", () => {
    test("accepts exact file, aggregate, and output-cell limits", () => {
        expect(() => validateImportFileSizes([
            { name: "a.json", size: MAX_FILE_BYTES },
            { name: "b.json", size: MAX_FILE_BYTES }
        ])).not.toThrow();
        expect(() => validateOutputCellCount(MAX_OUTPUT_CELLS)).not.toThrow();
    });

    test("rejects a file above the per-file limit before reading", () => {
        expect(() => validateImportFileSizes([
            { name: "large.json", size: MAX_FILE_BYTES + 1 }
        ])).toThrow(/large\.json.*50 MiB/s);
    });

    test("rejects files above the aggregate limit", () => {
        expect(() => validateImportFileSizes([
            { name: "a.json", size: MAX_TOTAL_BYTES / 3 },
            { name: "b.json", size: MAX_TOTAL_BYTES / 3 },
            { name: "c.json", size: MAX_TOTAL_BYTES / 3 + 1 }
        ])).toThrow(/combined limit.*100 MiB/s);
    });

    test("rejects output above the estimated-cell limit", () => {
        expect(() => validateOutputCellCount(MAX_OUTPUT_CELLS + 1))
            .toThrow(/500,001 cells.*500,000/s);
    });

    test("rejects a projected shape while the document is still flattening", () => {
        const bytes = new TextEncoder().encode(JSON.stringify([
            { a: 1, b: 2, c: 3 },
            { a: 4, b: 5, c: 6 }
        ]));

        expect(() => prepareJsonDocument(
            bytes.buffer,
            "wide.json",
            () => undefined,
            {
                knownFields: [],
                existingRecordCount: 0,
                reservedCells: 0,
                maxCells: 8
            }
        )).toThrow(/at least 9 cells.*limit is 8/s);
    });
});

test("classifies no, some, and all acknowledged rows", () => {
    expect(importCoverage(0, 10)).toBe("none");
    expect(importCoverage(4, 10)).toBe("some");
    expect(importCoverage(10, 10)).toBe("all");
});

describe("JSON import preparation", () => {
    test.each(readFixture<ImportCase[]>("import-cases.json"))(
        "converts fixture: $name",
        async ({ document, expectedValues }) => {
            const prepared = await prepareJsonImport([
                jsonFile("fixture.json", document)
            ], defaultOptions, () => undefined);

            expect(tableValues(prepared.tables[0])).toEqual(expectedValues);
        }
    );

    test("flattens a JSON document and reports read and preparation progress", async () => {
        const progress: string[] = [];
        const prepared = await prepareJsonImport([
            jsonFile("records.json", [
                { id: 1, profile: { name: "Ada" } },
                { id: 2 }
            ])
        ], defaultOptions, update => progress.push(update.phase));

        expect(prepared.totalRows).toBe(3);
        expect(prepared.totalCells).toBe(6);
        expect(tableValues(prepared.tables[0])).toEqual([
            ["id", "profile.name"],
            [1, "Ada"],
            [2, null]
        ]);
        expect(progress).toContain("reading");
        expect(progress).toContain("parsing");
        expect(progress).toContain("preparing");
    });

    test("merges files in selection order with one unioned header", async () => {
        const prepared = await prepareJsonImport([
            jsonFile("first.json", [{ id: 1 }]),
            jsonFile("second.json", [{ name: "Grace" }])
        ], {
            ...defaultOptions,
            mergeFiles: true
        }, () => undefined);

        expect(prepared.tables).toHaveLength(1);
        expect(tableValues(prepared.tables[0])).toEqual([
            ["id", "name"],
            [1, null],
            [null, "Grace"]
        ]);
    });

    test.each([
        ["empty record set", []],
        ["primitive", 42],
        ["array containing a primitive", [{ id: 1 }, null]],
        ["no importable fields", { nested: {} }]
    ])("rejects %s before previewing", async (_name, document) => {
        await expect(prepareJsonImport([
            jsonFile("invalid.json", document)
        ], defaultOptions, () => undefined)).rejects.toBeInstanceOf(
            ImportPreparationError
        );
    });

    test("chunks complete rows within the cell limit", async () => {
        const records = Array.from({ length: 1_000 }, (_, rowIndex) => (
            Object.fromEntries(Array.from({ length: 25 }, (_, columnIndex) => (
                [`field${columnIndex}`, `${rowIndex}-${columnIndex}`]
            )))
        ));
        const prepared = await prepareJsonImport([
            jsonFile("records.json", records)
        ], defaultOptions, () => undefined);
        const chunks = prepared.tables[0].chunks;

        expect(chunks).toHaveLength(2);
        expect(chunks[0].values).toHaveLength(1_000);
        expect(chunks[1].values).toHaveLength(1);
    });

    test("keeps a single write chunk within its serialized byte limit", async () => {
        const value = "x".repeat(MAX_CHUNK_BYTES - 6);
        const prepared = await prepareJsonImport([
            jsonFile("large-row.json", { field: value })
        ], defaultOptions, () => undefined);

        expect(prepared.tables[0].chunks).toHaveLength(2);
        expect(new TextEncoder().encode(JSON.stringify(
            prepared.tables[0].chunks[1].values
        )).length).toBe(MAX_CHUNK_BYTES);

        await expect(prepareJsonImport([
            jsonFile("oversized-row.json", { field: `${value}x` })
        ], defaultOptions, () => undefined)).rejects.toThrow(/write-chunk limit/);
    });

    test("rejects ambiguous literal and nested field paths", async () => {
        const fixture = readFixture<unknown>("ambiguous-fields.json");

        await expect(prepareJsonImport([
            jsonFile("ambiguous-fields.json", fixture)
        ], defaultOptions, () => undefined)).rejects.toThrow(
            /both flatten to "profile\.name"/
        );
    });

    test("rejects ambiguous field paths introduced by merging files", async () => {
        await expect(prepareJsonImport([
            jsonFile("literal.json", [{ "profile.name": "Ada" }]),
            jsonFile("nested.json", [{ profile: { name: "Grace" } }])
        ], {
            ...defaultOptions,
            mergeFiles: true
        }, () => undefined)).rejects.toThrow(
            /both flatten to "profile\.name"/
        );
    });

    test("rejects JSON numbers that cannot be written as finite cells", () => {
        const bytes = new TextEncoder().encode(fs.readFileSync(
            path.resolve("test/fixtures/large-number.json"),
            "utf8"
        ));

        expect(() => prepareJsonDocument(
            bytes.buffer,
            "large-number.json",
            () => undefined,
            {
                knownFields: [],
                existingRecordCount: 0,
                reservedCells: 0,
                maxCells: MAX_OUTPUT_CELLS
            }
        )).toThrow(/number too large/);
    });
});

function jsonFile(name: string, document: unknown): File {
    return new File([JSON.stringify(document)], name, {
        type: "application/json"
    });
}

type ImportCase = {
    name: string;
    document: unknown;
    expectedValues: SheetCellValue[][];
};

function readFixture<T>(name: string): T {
    return JSON.parse(fs.readFileSync(
        path.resolve("test/fixtures", name),
        "utf8"
    )) as T;
}

function tableValues(
    table: Awaited<ReturnType<typeof prepareJsonImport>>["tables"][number]
) {
    return table.chunks.flatMap(chunk => chunk.values);
}
