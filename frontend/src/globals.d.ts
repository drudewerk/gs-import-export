/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-var */


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

type ImportCoverage = "none" | "some" | "all";

type ImportOutcome = {
    coverage: ImportCoverage;
    rowsWritten: number;
    totalRows: number;
    writtenRanges: Array<{
        sheetName: string;
        rangeA1: string;
        rowsWritten: number;
    }>;
    preparedSheets: string[];
    message?: string;
};

type CurrentState = {
    state: "none" | "import" | "export" | "error";
    options?: UploadOptions;
};

type RateUsState = "shown" | "dismissed" | "rate_clicked" | "not_shown";

interface GoogleScriptRun {
    withSuccessHandler: <T>(callback: (result: T) => void) => GoogleScriptRun;
    withFailureHandler: (callback: (error: any) => void) => GoogleScriptRun;
    previewJsonImport: (request: ImportPreviewRequest) => void;
    beginJsonImport: (request: BeginImportRequest) => void;
    writeJsonImportChunk: (request: ImportChunkRequest) => void;
    saveOptions: (options: UploadOptions) => void;
    getOptions: () => UploadOptions;
    getCurrentState: () => CurrentState;
    sheetDataToArray: (selectionOnly: boolean) => void;
    getRateUsState: () => RateUsState;
    setRateUsState: (state: RateUsState) => void;
}

interface Google {
    script: {
        run: GoogleScriptRun;
    };
}

declare var google: Google;

declare module "react-shimmer-effects";
