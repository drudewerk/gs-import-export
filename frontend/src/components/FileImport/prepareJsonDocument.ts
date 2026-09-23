export type PreparedField = {
    header: string;
    segments: string[];
};

export type PreparedRecordSet = {
    sourceName: string;
    rows: Record<string, SheetCellValue>[];
    fields: PreparedField[];
};

export type DocumentPreparationProgress = {
    completedRecords: number;
    totalRecords: number;
};

export type DocumentEstimateContext = {
    knownFields: PreparedField[];
    existingRecordCount: number;
    reservedCells: number;
    maxCells: number;
};

const PROGRESS_BATCH_SIZE = 250;

export class ImportPreparationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ImportPreparationError";
    }
}

export function prepareJsonDocument(
    buffer: ArrayBuffer,
    fileName: string,
    onProgress: (progress: DocumentPreparationProgress) => void,
    estimate: DocumentEstimateContext
): PreparedRecordSet {
    let text: string;
    try {
        text = new TextDecoder("utf-8", { fatal: true }).decode(buffer);
    } catch {
        throw new ImportPreparationError(
            `${fileName} is not valid UTF-8 text. Save it as UTF-8 and try again.`
        );
    }

    let document: unknown;
    try {
        document = JSON.parse(text);
    } catch {
        throw new ImportPreparationError(
            `${fileName} is not valid JSON. Correct the document and try again.`
        );
    }

    const records = normalizeDocumentRecords(document, fileName);
    const fields = new Map<string, string[]>();
    for (const field of estimate.knownFields) {
        registerFieldPath(fields, field.header, field.segments, fileName);
    }
    const documentFieldHeaders = new Set<string>();
    const rows: Record<string, SheetCellValue>[] = [];

    for (let recordIndex = 0; recordIndex < records.length; recordIndex += 1) {
        rows.push(flattenRecord(
            records[recordIndex],
            fields,
            documentFieldHeaders,
            fileName
        ));
        validateProjectedCellCount(
            fields.size,
            estimate.existingRecordCount + records.length,
            estimate.reservedCells,
            estimate.maxCells
        );
        const completedRecords = recordIndex + 1;
        if (
            completedRecords === records.length
            || completedRecords % PROGRESS_BATCH_SIZE === 0
        ) {
            onProgress({
                completedRecords,
                totalRecords: records.length
            });
        }
    }

    if (!documentFieldHeaders.size) {
        throw new ImportPreparationError(
            `${fileName} does not contain any importable fields.`
        );
    }

    return {
        sourceName: fileName,
        rows,
        fields: [...documentFieldHeaders].map(header => ({
            header,
            segments: fields.get(header)!
        }))
    };
}

function normalizeDocumentRecords(document: unknown, fileName: string): object[] {
    const records = Array.isArray(document) ? document : [document];

    if (!records.length) {
        throw new ImportPreparationError(
            `${fileName} contains an empty record set. Add at least one record.`
        );
    }
    if (records.some(record => !isRecord(record))) {
        throw new ImportPreparationError(
            `${fileName} must contain one JSON object or an array of JSON objects.`
        );
    }

    return records;
}

function isRecord(value: unknown): value is object {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function flattenRecord(
    record: object,
    fields: Map<string, string[]>,
    documentFieldHeaders: Set<string>,
    fileName: string,
    parentSegments: string[] = [],
    flattened: Record<string, SheetCellValue> = Object.create(null)
): Record<string, SheetCellValue> {
    for (const [key, value] of Object.entries(record)) {
        const segments = [...parentSegments, key];
        const fieldPath = segments.join(".");

        if (typeof value === "object" && value !== null) {
            flattenRecord(
                value,
                fields,
                documentFieldHeaders,
                fileName,
                segments,
                flattened
            );
            continue;
        }

        if (typeof value === "number" && !Number.isFinite(value)) {
            throw new ImportPreparationError(
                `${fileName} contains a number too large for a spreadsheet cell.`
            );
        }

        registerFieldPath(fields, fieldPath, segments, fileName);
        documentFieldHeaders.add(fieldPath);
        flattened[fieldPath] = value as SheetCellValue;
    }

    return flattened;
}

function validateProjectedCellCount(
    columnCount: number,
    recordCount: number,
    reservedCells: number,
    maxCells: number
) {
    const projectedCells = reservedCells + (recordCount + 1) * columnCount;
    if (projectedCells > maxCells) {
        throw new ImportPreparationError(
            `This import would create at least ${projectedCells.toLocaleString()} cells. `
            + `The supported limit is ${maxCells.toLocaleString()}. Split the files, remove `
            + "fields, or turn off merge when files have different fields."
        );
    }
}

function registerFieldPath(
    fields: Map<string, string[]>,
    fieldPath: string,
    segments: string[],
    fileName: string
) {
    const existingSegments = fields.get(fieldPath);
    if (
        existingSegments
        && (
            existingSegments.length !== segments.length
            || existingSegments.some((segment, index) => segment !== segments[index])
        )
    ) {
        throw new ImportPreparationError(
            `${fileName} contains ambiguous fields that both flatten to "${fieldPath}". `
            + "Rename the literal dotted key or the nested field."
        );
    }

    if (!existingSegments) {
        fields.set(fieldPath, segments);
    }
}
