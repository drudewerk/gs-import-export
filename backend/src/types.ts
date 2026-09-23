type UploadOptions = {
    sheet: "active" | "new";
    startAt: "selection" | "end";
    mergeFiles: boolean;
};

type SheetCellValue = string | number | boolean | null;

type ImportTableSummary = {
    tableIndex: number;
    rowCount: number;
    columnCount: number;
};

type ImportPreviewRequest = {
    tables: ImportTableSummary[];
    options: UploadOptions;
};

type ImportDestinationPreview = {
    tableIndex: number;
    target: "active" | "new";
    sheetId: number | null;
    sheetName: string;
    startRow: number;
    startColumn: number;
    rowCount: number;
    columnCount: number;
    rangeA1: string;
    overwritesExisting: boolean;
    addedRows: number;
    addedColumns: number;
};

type ImportPreview = {
    token: string;
    destinations: ImportDestinationPreview[];
    totalRows: number;
    totalCells: number;
    workbookCellsAfter: number;
};

type BeginImportRequest = ImportPreviewRequest & {
    previewToken: string;
};

type ConcreteImportDestination = Omit<ImportDestinationPreview, "target"> & {
    sheetId: number;
};

type BeginImportResult =
    | {
        ok: true;
        destinations: ConcreteImportDestination[];
        sessionId: string;
    }
    | {
        ok: false;
        destinations: ConcreteImportDestination[];
        message: string;
    };

type ImportChunkRequest = {
    sessionId: string;
    tableIndex: number;
    chunkIndex: number;
    values: SheetCellValue[][];
};

type ImportChunkResult =
    | {
        ok: true;
        rowsWritten: number;
        rangeA1: string;
    }
    | {
        ok: false;
        rowsWritten: number;
        rangeA1: string;
        message: string;
    };

type StoredImportChunk = {
    chunkIndex: number;
    digest: string;
    result: ImportChunkResult;
};

type StoredImportTableSession = {
    version: 1;
    spreadsheetId: string;
    expiresAt: number;
    destination: ConcreteImportDestination;
    nextChunkIndex: number;
    nextRowOffset: number;
    lastChunk?: StoredImportChunk;
};

type RateUsState = "shown" | "dismissed" | "rate_clicked" | "not_shown";
