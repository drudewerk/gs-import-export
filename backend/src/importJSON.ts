const MAX_IMPORT_CELLS = 500_000;
const MAX_IMPORT_COLUMNS = 18_278;
const MAX_SPREADSHEET_CELLS = 10_000_000;
const DEFAULT_SHEET_ROWS = 1_000;
const DEFAULT_SHEET_COLUMNS = 26;

function previewJsonImport(request: ImportPreviewRequest): ImportPreview {
    validateImportPreviewRequest(request);

    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const totalRows = request.tables.reduce((sum, table) => sum + table.rowCount, 0);
    const totalCells = request.tables.reduce(
        (sum, table) => sum + table.rowCount * table.columnCount,
        0
    );
    const currentWorkbookCells = spreadsheet.getSheets().reduce(
        (sum, sheet) => sum + sheet.getMaxRows() * sheet.getMaxColumns(),
        0
    );

    let workbookCellsAfter = currentWorkbookCells;
    let destinations: ImportDestinationPreview[];

    if (request.options.sheet === "new") {
        destinations = request.tables.map((table, index) => {
            const projectedRows = Math.max(DEFAULT_SHEET_ROWS, table.rowCount);
            const projectedColumns = Math.max(DEFAULT_SHEET_COLUMNS, table.columnCount);
            workbookCellsAfter += projectedRows * projectedColumns;

            return {
                tableIndex: table.tableIndex,
                target: "new",
                sheetId: null,
                sheetName: `New sheet ${index + 1}`,
                startRow: 1,
                startColumn: 1,
                rowCount: table.rowCount,
                columnCount: table.columnCount,
                rangeA1: importRangeA1(1, 1, table.rowCount, table.columnCount),
                overwritesExisting: false,
                addedRows: Math.max(0, table.rowCount - DEFAULT_SHEET_ROWS),
                addedColumns: Math.max(0, table.columnCount - DEFAULT_SHEET_COLUMNS)
            };
        });
    } else {
        const sheet = spreadsheet.getActiveSheet();
        const startCell = request.options.startAt === "selection"
            ? spreadsheet.getSelection().getCurrentCell()
            : null;

        if (request.options.startAt === "selection" && !startCell) {
            throw new Error("Select the cell where the import should begin.");
        }

        const initialRow = startCell ? startCell.getRow() : sheet.getLastRow() + 1;
        const initialColumn = startCell ? startCell.getColumn() : 1;
        let nextRow = Math.max(1, initialRow);

        destinations = request.tables.map((table) => {
            const destination = previewExistingSheetDestination(
                sheet,
                table,
                nextRow,
                initialColumn
            );
            nextRow += table.rowCount;
            return destination;
        });

        const finalRows = Math.max(
            sheet.getMaxRows(),
            ...destinations.map(destination => destination.startRow + destination.rowCount - 1)
        );
        const finalColumns = Math.max(
            sheet.getMaxColumns(),
            ...destinations.map(
                destination => destination.startColumn + destination.columnCount - 1
            )
        );
        workbookCellsAfter += finalRows * finalColumns
            - sheet.getMaxRows() * sheet.getMaxColumns();
    }

    if (workbookCellsAfter > MAX_SPREADSHEET_CELLS) {
        throw new Error(
            `This import would grow the spreadsheet to ${workbookCellsAfter.toLocaleString()} `
            + `cells, above Google Sheets' ${MAX_SPREADSHEET_CELLS.toLocaleString()}-cell limit.`
        );
    }

    const previewWithoutToken = {
        destinations,
        totalRows,
        totalCells,
        workbookCellsAfter
    };

    return {
        token: importPreviewToken(previewWithoutToken),
        ...previewWithoutToken
    };
}

function beginJsonImport(request: BeginImportRequest): BeginImportResult {
    const destinations: ConcreteImportDestination[] = [];

    try {
        return withImportLock(() => {
            const freshPreview = previewJsonImport({
                tables: request.tables,
                options: request.options
            });

            if (freshPreview.token !== request.previewToken) {
                return {
                    ok: false,
                    destinations,
                    message: "The spreadsheet changed after the preview. Review the import again."
                };
            }

            saveOptions(request.options);
            const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

            for (const preview of freshPreview.destinations) {
                const sheet = preview.target === "new"
                    ? spreadsheet.insertSheet()
                    : spreadsheet.getSheets().find(
                        candidate => candidate.getSheetId() === preview.sheetId
                    );

                if (!sheet) {
                    throw new Error("The destination sheet is no longer available.");
                }

                destinations.push({
                    ...preview,
                    sheetId: sheet.getSheetId(),
                    sheetName: sheet.getName()
                });
                expandSheetForImport(sheet, preview);
            }

            const sessionId = createImportSession(spreadsheet, destinations);

            return {
                ok: true,
                destinations,
                sessionId
            };
        });
    } catch {
        return {
            ok: false,
            destinations,
            message: "Google Sheets could not prepare the import destination. No rows were written."
        };
    }
}

function validateImportPreviewRequest(request: ImportPreviewRequest) {
    if (
        (request.options.sheet !== "active" && request.options.sheet !== "new")
        || (request.options.startAt !== "selection" && request.options.startAt !== "end")
        || typeof request.options.mergeFiles !== "boolean"
    ) {
        throw new Error("The import options are invalid.");
    }

    if (!request.tables.length) {
        throw new Error("There are no prepared tables to import.");
    }

    let totalCells = 0;
    const tableIndexes = new Set<number>();
    for (const table of request.tables) {
        if (
            !Number.isInteger(table.tableIndex)
            || table.tableIndex < 0
            || !Number.isInteger(table.rowCount)
            || !Number.isInteger(table.columnCount)
            || table.rowCount < 1
            || table.columnCount < 1
        ) {
            throw new Error("The prepared import dimensions are invalid.");
        }
        if (tableIndexes.has(table.tableIndex)) {
            throw new Error("The prepared import contains a duplicate table.");
        }
        tableIndexes.add(table.tableIndex);
        if (table.columnCount > MAX_IMPORT_COLUMNS) {
            throw new Error(
                `The import has ${table.columnCount.toLocaleString()} columns, above Google `
                + `Sheets' ${MAX_IMPORT_COLUMNS.toLocaleString()}-column limit.`
            );
        }
        totalCells += table.rowCount * table.columnCount;
    }

    if (totalCells > MAX_IMPORT_CELLS) {
        throw new Error(
            `The import contains ${totalCells.toLocaleString()} estimated cells, above the `
            + `${MAX_IMPORT_CELLS.toLocaleString()}-cell supported limit.`
        );
    }
}

function previewExistingSheetDestination(
    sheet: GoogleAppsScript.Spreadsheet.Sheet,
    table: ImportTableSummary,
    startRow: number,
    startColumn: number
): ImportDestinationPreview {
    const endRow = startRow + table.rowCount - 1;
    const endColumn = startColumn + table.columnCount - 1;

    if (endColumn > MAX_IMPORT_COLUMNS) {
        throw new Error(
            `The destination would end at column ${endColumn.toLocaleString()}, above Google `
            + `Sheets' ${MAX_IMPORT_COLUMNS.toLocaleString()}-column limit.`
        );
    }

    const existingEndRow = Math.min(endRow, sheet.getMaxRows());
    const existingEndColumn = Math.min(endColumn, sheet.getMaxColumns());
    const hasExistingIntersection = existingEndRow >= startRow
        && existingEndColumn >= startColumn;
    const overwritesExisting = hasExistingIntersection
        ? !sheet.getRange(
            startRow,
            startColumn,
            existingEndRow - startRow + 1,
            existingEndColumn - startColumn + 1
        ).isBlank()
        : false;

    return {
        tableIndex: table.tableIndex,
        target: "active",
        sheetId: sheet.getSheetId(),
        sheetName: sheet.getName(),
        startRow,
        startColumn,
        rowCount: table.rowCount,
        columnCount: table.columnCount,
        rangeA1: importRangeA1(startRow, startColumn, table.rowCount, table.columnCount),
        overwritesExisting,
        addedRows: Math.max(0, endRow - sheet.getMaxRows()),
        addedColumns: Math.max(0, endColumn - sheet.getMaxColumns())
    };
}

function expandSheetForImport(
    sheet: GoogleAppsScript.Spreadsheet.Sheet,
    destination: ImportDestinationPreview
) {
    const requiredRows = destination.startRow + destination.rowCount - 1;
    const requiredColumns = destination.startColumn + destination.columnCount - 1;

    if (requiredRows > sheet.getMaxRows()) {
        sheet.insertRowsAfter(sheet.getMaxRows(), requiredRows - sheet.getMaxRows());
    }
    if (requiredColumns > sheet.getMaxColumns()) {
        sheet.insertColumnsAfter(
            sheet.getMaxColumns(),
            requiredColumns - sheet.getMaxColumns()
        );
    }
}

function importPreviewToken(preview: Omit<ImportPreview, "token">): string {
    return Utilities.base64Encode(
        Utilities.computeDigest(
            Utilities.DigestAlgorithm.SHA_256,
            JSON.stringify(preview)
        )
    );
}

function importRangeA1(
    startRow: number,
    startColumn: number,
    rowCount: number,
    columnCount: number
): string {
    const endRow = startRow + rowCount - 1;
    const endColumn = startColumn + columnCount - 1;
    return `${importColumnToLetter(startColumn)}${startRow}:`
        + `${importColumnToLetter(endColumn)}${endRow}`;
}

function importColumnToLetter(column: number): string {
    let remaining = column;
    let result = "";

    while (remaining > 0) {
        const remainder = (remaining - 1) % 26;
        result = String.fromCharCode(65 + remainder) + result;
        remaining = Math.floor((remaining - 1) / 26);
    }

    return result;
}
