import {
    DocumentEstimateContext,
    DocumentPreparationProgress,
    ImportPreparationError,
    PreparedRecordSet,
    prepareJsonDocument
} from "./prepareJsonDocument";
import JsonPreparationWorker from "./prepareJsonImport.worker?worker&inline";


export { ImportPreparationError } from "./prepareJsonDocument";

export const MAX_FILE_BYTES = 50 * 1024 * 1024;
export const MAX_TOTAL_BYTES = 100 * 1024 * 1024;
export const MAX_OUTPUT_CELLS = 500_000;
export const MAX_CHUNK_CELLS = 25_000;
export const MAX_CHUNK_BYTES = 1024 * 1024;

export type ImportPreparationProgress =
    | {
        phase: "reading";
        completedBytes: number;
        totalBytes: number;
        fileNumber: number;
        totalFiles: number;
    }
    | {
        phase: "preparing";
        completedRecords: number;
        totalRecords: number;
        fileNumber: number;
        totalFiles: number;
    }
    | {
        phase: "parsing";
        fileNumber: number;
        totalFiles: number;
    };

export type PreparedImportTable = {
    tableIndex: number;
    chunks: ImportTableChunk[];
    rowCount: number;
    columnCount: number;
};

export type PreparedImport = {
    tables: PreparedImportTable[];
    totalRows: number;
    totalCells: number;
};

export type ImportTableChunk = {
    values: SheetCellValue[][];
};

type TablePlan = {
    tableIndex: number;
    sourceNames: string[];
    recordSets: PreparedRecordSet[];
    headers: string[];
    rowCount: number;
    columnCount: number;
};

export function validateImportFileSizes(files: Pick<File, "name" | "size">[]) {
    const oversizedFile = files.find(file => file.size > MAX_FILE_BYTES);
    if (oversizedFile) {
        throw new ImportPreparationError(
            `${oversizedFile.name} is ${formatMiB(oversizedFile.size)}. The supported limit `
            + `is ${formatMiB(MAX_FILE_BYTES)} per file. Split the document into smaller files.`
        );
    }

    const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
    if (totalBytes > MAX_TOTAL_BYTES) {
        throw new ImportPreparationError(
            `The selected files total ${formatMiB(totalBytes)}. The supported combined limit `
            + `is ${formatMiB(MAX_TOTAL_BYTES)}. Import fewer files at a time.`
        );
    }
}

export async function prepareJsonImport(
    files: File[],
    options: UploadOptions,
    onProgress: (progress: ImportPreparationProgress) => void
): Promise<PreparedImport> {
    if (!files.length) {
        throw new ImportPreparationError("Select at least one JSON file.");
    }

    validateImportFileSizes(files);
    const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
    let completedBytes = 0;
    const recordSets: PreparedRecordSet[] = [];

    for (let fileIndex = 0; fileIndex < files.length; fileIndex += 1) {
        const file = files[fileIndex];
        const buffer = await readFileAsBuffer(file, loadedBytes => {
            onProgress({
                phase: "reading",
                completedBytes: completedBytes + loadedBytes,
                totalBytes,
                fileNumber: fileIndex + 1,
                totalFiles: files.length
            });
        });
        completedBytes += file.size;
        onProgress({
            phase: "parsing",
            fileNumber: fileIndex + 1,
            totalFiles: files.length
        });

        const recordSet = await prepareRecordSetInWorker(
            buffer,
            file.name,
            importEstimateContext(recordSets, options.mergeFiles),
            progress => onProgress({
                phase: "preparing",
                ...progress,
                fileNumber: fileIndex + 1,
                totalFiles: files.length
            })
        );
        recordSets.push(recordSet);
    }

    const plans = createTablePlans(recordSets, options.mergeFiles);
    const totalRows = plans.reduce((sum, plan) => sum + plan.rowCount, 0);
    const totalCells = plans.reduce(
        (sum, plan) => sum + plan.rowCount * plan.columnCount,
        0
    );

    return {
        tables: plans.map(materializeTablePlan),
        totalRows,
        totalCells
    };
}

export function validateOutputCellCount(totalCells: number) {
    if (totalCells > MAX_OUTPUT_CELLS) {
        throw new ImportPreparationError(
            `This import would create ${totalCells.toLocaleString()} cells. The supported `
            + `limit is ${MAX_OUTPUT_CELLS.toLocaleString()}. Split the files, remove fields, `
            + "or turn off merge when files have different fields."
        );
    }
}

function createTablePlans(
    recordSets: PreparedRecordSet[],
    mergeFiles: boolean
): TablePlan[] {
    const plans = mergeFiles
        ? [createTablePlan(recordSets, 0)]
        : recordSets.map((recordSet, tableIndex) => createTablePlan(
            [recordSet],
            tableIndex
        ));
    const totalCells = plans.reduce(
        (sum, plan) => sum + plan.rowCount * plan.columnCount,
        0
    );
    validateOutputCellCount(totalCells);
    return plans;
}

function createTablePlan(
    recordSets: PreparedRecordSet[],
    tableIndex: number
): TablePlan {
    const headers = [...new Set(recordSets.flatMap(recordSet => (
        recordSet.fields.map(field => field.header)
    )))];
    return {
        tableIndex,
        sourceNames: recordSets.map(recordSet => recordSet.sourceName),
        recordSets,
        headers,
        rowCount: 1 + recordSets.reduce(
            (sum, recordSet) => sum + recordSet.rows.length,
            0
        ),
        columnCount: headers.length
    };
}

function materializeTablePlan(plan: TablePlan): PreparedImportTable {
    const builder = createChunkBuilder(plan.sourceNames, plan.columnCount);
    builder.add(plan.headers);
    for (const recordSet of plan.recordSets) {
        for (const row of recordSet.rows) {
            builder.add(plan.headers.map(header => row[header] ?? null));
        }
    }

    return {
        tableIndex: plan.tableIndex,
        chunks: builder.finish(),
        rowCount: plan.rowCount,
        columnCount: plan.columnCount
    };
}

function createChunkBuilder(sourceNames: string[], columnCount: number) {
    const encoder = new TextEncoder();
    const chunks: ImportTableChunk[] = [];
    let chunkRows: SheetCellValue[][] = [];
    let chunkBytes = 2;

    const flush = () => {
        if (!chunkRows.length) {
            return;
        }
        chunks.push({ values: chunkRows });
        chunkRows = [];
        chunkBytes = 2;
    };

    return {
        add(row: SheetCellValue[]) {
            const rowBytes = encoder.encode(JSON.stringify(row)).length;
            if (rowBytes + 2 > MAX_CHUNK_BYTES) {
                throw new ImportPreparationError(
                    `A row in ${sourceNames.join(", ")} is larger than the supported `
                    + `${formatMiB(MAX_CHUNK_BYTES)} write-chunk limit. Reduce the record width `
                    + "or value sizes."
                );
            }

            const nextCellCount = (chunkRows.length + 1) * columnCount;
            if (
                chunkRows.length
                && (
                    nextCellCount > MAX_CHUNK_CELLS
                    || chunkBytes + rowBytes + 1 > MAX_CHUNK_BYTES
                )
            ) {
                flush();
            }

            chunkBytes += rowBytes + (chunkRows.length ? 1 : 0);
            chunkRows.push(row);
        },
        finish() {
            flush();
            return chunks;
        }
    };
}

function prepareRecordSetInWorker(
    buffer: ArrayBuffer,
    fileName: string,
    estimate: DocumentEstimateContext,
    onProgress: (progress: DocumentPreparationProgress) => void
): Promise<PreparedRecordSet> {
    if (typeof Worker === "undefined") {
        return Promise.resolve(prepareJsonDocument(
            buffer,
            fileName,
            onProgress,
            estimate
        ));
    }

    return new Promise((resolve, reject) => {
        let worker: Worker;
        try {
            worker = new JsonPreparationWorker();
        } catch {
            reject(new ImportPreparationError(
                "The browser could not start background JSON preparation. "
                + "Update the browser or split the document into smaller files."
            ));
            return;
        }
        worker.onmessage = (event: MessageEvent<
            | {
                type: "progress";
                progress: DocumentPreparationProgress;
            }
            | {
                type: "complete";
                recordSet: PreparedRecordSet;
            }
            | {
                type: "error";
                message: string;
            }
        >) => {
            if (event.data.type === "progress") {
                onProgress(event.data.progress);
                return;
            }

            worker.terminate();
            if (event.data.type === "complete") {
                resolve(event.data.recordSet);
            } else {
                reject(new ImportPreparationError(event.data.message));
            }
        };
        worker.onerror = () => {
            worker.terminate();
            reject(new ImportPreparationError(
                `${fileName} could not be prepared in the browser. Update the browser or `
                + "split the document into smaller files."
            ));
        };
        worker.postMessage({ buffer, fileName, estimate }, [buffer]);
    });
}

function importEstimateContext(
    recordSets: PreparedRecordSet[],
    mergeFiles: boolean
): DocumentEstimateContext {
    if (mergeFiles) {
        return {
            knownFields: recordSets.flatMap(recordSet => recordSet.fields),
            existingRecordCount: recordSets.reduce(
                (sum, recordSet) => sum + recordSet.rows.length,
                0
            ),
            reservedCells: 0,
            maxCells: MAX_OUTPUT_CELLS
        };
    }

    return {
        knownFields: [],
        existingRecordCount: 0,
        reservedCells: recordSets.reduce(
            (sum, recordSet) => (
                sum + (recordSet.rows.length + 1) * recordSet.fields.length
            ),
            0
        ),
        maxCells: MAX_OUTPUT_CELLS
    };
}

function readFileAsBuffer(
    file: File,
    onProgress: (loadedBytes: number) => void
): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onprogress = event => {
            onProgress(event.loaded);
        };
        reader.onerror = () => {
            reject(new ImportPreparationError(
                `${file.name} could not be read. Select the file again and retry.`
            ));
        };
        reader.onload = () => {
            if (!(reader.result instanceof ArrayBuffer)) {
                reject(new ImportPreparationError(
                    `${file.name} could not be read as bytes.`
                ));
                return;
            }
            onProgress(file.size);
            resolve(reader.result);
        };
        reader.readAsArrayBuffer(file);
    });
}

function formatMiB(bytes: number): string {
    const value = bytes / 1024 / 1024;
    return `${Number.isInteger(value) ? value : value.toFixed(1)} MiB`;
}
