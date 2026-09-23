// @vitest-environment jsdom

import { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { afterEach, beforeEach, expect, test } from "vitest";

import { FileImport } from "./FileImport";
import { useFileImport } from "./useFileImport";


class ImportRunnerFake {
    private successHandler?: (result: unknown) => void;
    private failureHandler?: (error: unknown) => void;
    private transportFailureOnFirstWrite: boolean;
    private secondWriteResult: "failed" | "saved" | "written-but-untracked";
    writeCalls = 0;

    constructor({
        transportFailureOnFirstWrite = false,
        secondWriteResult = "failed"
    }: {
        transportFailureOnFirstWrite?: boolean;
        secondWriteResult?: "failed" | "saved" | "written-but-untracked";
    } = {}) {
        this.transportFailureOnFirstWrite = transportFailureOnFirstWrite;
        this.secondWriteResult = secondWriteResult;
    }

    withSuccessHandler(callback: (result: unknown) => void) {
        this.successHandler = callback;
        return this;
    }

    withFailureHandler(callback: (error: unknown) => void) {
        this.failureHandler = callback;
        return this;
    }

    previewJsonImport(request: ImportPreviewRequest) {
        const table = request.tables[0];
        this.successHandler?.({
            token: "preview-token",
            destinations: [{
                tableIndex: table.tableIndex,
                target: "active",
                sheetId: 101,
                sheetName: "Data",
                startRow: 1,
                startColumn: 1,
                rowCount: table.rowCount,
                columnCount: table.columnCount,
                rangeA1: tableRange(table),
                overwritesExisting: false,
                addedRows: 2,
                addedColumns: 0
            }],
            totalRows: table.rowCount,
            totalCells: table.rowCount * table.columnCount,
            workbookCellsAfter: 26_052
        });
    }

    beginJsonImport(request: BeginImportRequest) {
        const table = request.tables[0];
        this.successHandler?.({
            ok: true,
            sessionId: "test-session-1234",
            destinations: [{
                tableIndex: table.tableIndex,
                sheetId: 101,
                sheetName: "Data",
                startRow: 1,
                startColumn: 1,
                rowCount: table.rowCount,
                columnCount: table.columnCount,
                rangeA1: tableRange(table),
                overwritesExisting: false,
                addedRows: 2,
                addedColumns: 0
            }]
        });
    }

    writeJsonImportChunk(request: ImportChunkRequest) {
        this.writeCalls += 1;
        if (this.transportFailureOnFirstWrite && this.writeCalls === 1) {
            this.failureHandler?.(new Error("Synthetic lost response."));
            return;
        }
        if (this.transportFailureOnFirstWrite && this.writeCalls === 2) {
            this.successHandler?.({
                ok: true,
                rowsWritten: request.values.length,
                rangeA1: "A1:A2"
            });
            return;
        }
        if (this.writeCalls === 1) {
            this.successHandler?.({
                ok: true,
                rowsWritten: request.values.length,
                rangeA1: "A1:Y1000"
            });
            return;
        }

        if (this.secondWriteResult === "saved") {
            this.successHandler?.({
                ok: true,
                rowsWritten: request.values.length,
                rangeA1: "A1001:Y1002"
            });
            return;
        }

        this.successHandler?.({
            ok: false,
            rowsWritten: this.secondWriteResult === "written-but-untracked"
                ? request.values.length
                : 0,
            rangeA1: "A1001:Y1002",
            message: this.secondWriteResult === "written-but-untracked"
                ? "The rows were written, but import progress could not be saved."
                : "Synthetic write failure."
        });
    }

    getRateUsState() {
        this.successHandler?.("shown");
    }
}

let container: HTMLDivElement;
let root: Root | undefined;
let runner: ImportRunnerFake;

beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    runner = new ImportRunnerFake();
    useRunner(runner);
});

test("retries the same session chunk after a lost response", async () => {
    runner = new ImportRunnerFake({
        transportFailureOnFirstWrite: true
    });
    useRunner(runner);
    const file = new File([
        JSON.stringify([{ id: 1 }])
    ], "records.json", {
        type: "application/json"
    });

    await act(async () => {
        root?.render(<FileImportHarness file={file} />);
    });

    await clickButton("Review import");
    await waitForText("Confirm import");
    await clickButton("Confirm import");
    await waitForText("Import complete");

    expect(runner.writeCalls).toBe(2);
    expect(container.textContent).toContain("2 of 2 rows written");
});

afterEach(async () => {
    if (root) {
        await act(async () => {
            root?.unmount();
        });
    }
    container.remove();
});

test("stops after a failed chunk and reports acknowledged rows", async () => {
    const file = wideJsonFile();

    await act(async () => {
        root?.render(<FileImportHarness file={file} />);
    });

    await clickButton("Review import");
    await waitForText("Confirm import");
    await clickButton("Confirm import");
    await waitForText("Import partially complete");

    expect(runner.writeCalls).toBe(2);
    expect(container.textContent).toContain("1,000 of 1,002 rows written");
    expect(container.textContent).toContain("Confirmed: Data A1:Y1000");
});

test("shows one destination range after all chunks succeed", async () => {
    runner = new ImportRunnerFake({ secondWriteResult: "saved" });
    useRunner(runner);
    const file = wideJsonFile();

    await act(async () => {
        root?.render(<FileImportHarness file={file} />);
    });

    await clickButton("Review import");
    await waitForText("Confirm import");
    await clickButton("Confirm import");
    await waitForText("Import complete");

    expect(runner.writeCalls).toBe(2);
    expect(container.textContent).toContain("1,002 of 1,002 rows written");
    expect(container.textContent).toContain("Written: Data A1:Y1002");
    expect(container.textContent).not.toContain("A1:Y1000");
    expect(container.textContent).not.toContain("A1001:Y1002");
});

test("shows confirmed ranges when the final write cannot save progress", async () => {
    runner = new ImportRunnerFake({ secondWriteResult: "written-but-untracked" });
    useRunner(runner);
    const file = wideJsonFile();

    await act(async () => {
        root?.render(<FileImportHarness file={file} />);
    });

    await clickButton("Review import");
    await waitForText("Confirm import");
    await clickButton("Confirm import");
    await waitForText("Import stopped after writing all rows");

    expect(runner.writeCalls).toBe(2);
    expect(container.textContent).toContain("1,002 of 1,002 rows written");
    expect(container.textContent).toContain("Confirmed: Data A1:Y1000");
    expect(container.textContent).toContain("Confirmed: Data A1001:Y1002");
    expect(container.textContent).not.toContain("Written: Data A1:Y1002");
});

function tableRange(table: ImportTableSummary): string {
    return `A1:${String.fromCharCode(64 + table.columnCount)}${table.rowCount}`;
}

function useRunner(value: ImportRunnerFake) {
    Object.defineProperty(globalThis, "google", {
        configurable: true,
        value: { script: { run: value } }
    });
}

function wideJsonFile(): File {
    const records = Array.from({ length: 1_001 }, (_, rowIndex) => (
        Object.fromEntries(Array.from({ length: 25 }, (_, columnIndex) => (
            [`field${columnIndex}`, `${rowIndex}-${columnIndex}`]
        )))
    ));
    return new File([JSON.stringify(records)], "records.json", {
        type: "application/json"
    });
}

const FileImportHarness = ({ file }: { file: File; }) => {
    const controller = useFileImport({
        files: [file],
        options: {
            mergeFiles: false,
            sheet: "active",
            startAt: "end"
        }
    });

    return <FileImport
        files={[file]}
        onRemove={() => undefined}
        controller={controller}
    />;
};

async function clickButton(label: string) {
    const button = [...container.querySelectorAll("button")].find(
        candidate => candidate.textContent?.trim() === label
    );
    expect(button).toBeDefined();
    await act(async () => {
        button?.click();
    });
}

async function waitForText(text: string) {
    for (let attempt = 0; attempt < 40; attempt += 1) {
        if (container.textContent?.includes(text)) {
            return;
        }
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 10));
        });
    }
    throw new Error(`Timed out waiting for "${text}"`);
}
