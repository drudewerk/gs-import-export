import { ImportGateway } from "./appsScriptImportGateway";
import { PreparedImport } from "./prepareJsonImport";


export type ImportWorkflowEvent =
    | {
        type: "destinations-ready";
        destinations: ConcreteImportDestination[];
    }
    | {
        type: "write-progress";
        destinations: ConcreteImportDestination[];
        rowsWritten: number;
        totalRows: number;
    };

type ExecuteImportRequest = {
    preparedImport: PreparedImport;
    preview: ImportPreview;
    options: UploadOptions;
    gateway: ImportGateway;
    onEvent: (event: ImportWorkflowEvent) => void;
};

export async function executePreparedImport({
    preparedImport,
    preview,
    options,
    gateway,
    onEvent
}: ExecuteImportRequest): Promise<ImportOutcome> {
    let rowsWritten = 0;
    const writtenRanges: ImportOutcome["writtenRanges"] = [];
    let preparedSheets: string[] = [];

    try {
        const beginResult = await gateway.begin({
            tables: preparedImport.tables.map(table => ({
                tableIndex: table.tableIndex,
                rowCount: table.rowCount,
                columnCount: table.columnCount
            })),
            options,
            previewToken: preview.token
        });
        preparedSheets = beginResult.destinations.map(
            destination => destination.sheetName
        );
        onEvent({
            type: "destinations-ready",
            destinations: beginResult.destinations
        });

        if (!beginResult.ok) {
            return failureOutcome(
                beginResult.message,
                rowsWritten,
                preparedImport.totalRows,
                writtenRanges,
                preparedSheets
            );
        }

        await yieldToBrowser();

        for (const table of preparedImport.tables) {
            const destination = beginResult.destinations.find(
                candidate => candidate.tableIndex === table.tableIndex
            );
            if (!destination) {
                return failureOutcome(
                    "The prepared destination did not match the reviewed import.",
                    rowsWritten,
                    preparedImport.totalRows,
                    writtenRanges,
                    preparedSheets
                );
            }

            for (let chunkIndex = 0; chunkIndex < table.chunks.length; chunkIndex += 1) {
                onEvent({
                    type: "write-progress",
                    destinations: beginResult.destinations,
                    rowsWritten,
                    totalRows: preparedImport.totalRows
                });
                const chunk = table.chunks[chunkIndex];
                const result = await gateway.writeChunk({
                    sessionId: beginResult.sessionId,
                    tableIndex: table.tableIndex,
                    chunkIndex,
                    values: chunk.values
                });

                rowsWritten += result.rowsWritten;
                if (result.rowsWritten > 0) {
                    writtenRanges.push({
                        sheetName: destination.sheetName,
                        rangeA1: result.rangeA1,
                        rowsWritten: result.rowsWritten
                    });
                }

                if (!result.ok) {
                    return failureOutcome(
                        result.message,
                        rowsWritten,
                        preparedImport.totalRows,
                        writtenRanges,
                        preparedSheets
                    );
                }

                if (result.rowsWritten !== chunk.values.length) {
                    return failureOutcome(
                        "Google Sheets confirmed an unexpected number of rows.",
                        rowsWritten,
                        preparedImport.totalRows,
                        writtenRanges,
                        preparedSheets
                    );
                }

                onEvent({
                    type: "write-progress",
                    destinations: beginResult.destinations,
                    rowsWritten,
                    totalRows: preparedImport.totalRows
                });
            }
        }

        if (rowsWritten !== preparedImport.totalRows) {
            return failureOutcome(
                "Google Sheets did not confirm every import row.",
                rowsWritten,
                preparedImport.totalRows,
                writtenRanges,
                preparedSheets
            );
        }

        return {
            coverage: "all",
            rowsWritten,
            totalRows: preparedImport.totalRows,
            writtenRanges: beginResult.destinations.map(destination => ({
                sheetName: destination.sheetName,
                rangeA1: destination.rangeA1,
                rowsWritten: destination.rowCount
            })),
            preparedSheets
        };
    } catch (error) {
        return failureOutcome(
            importErrorMessage(
                error,
                "The connection to Google Sheets failed during the import."
            ),
            rowsWritten,
            preparedImport.totalRows,
            writtenRanges,
            preparedSheets
        );
    }
}

function yieldToBrowser(): Promise<void> {
    return new Promise(resolve => {
        setTimeout(resolve, 0);
    });
}

export function importCoverage(
    rowsWritten: number,
    totalRows: number
): ImportCoverage {
    if (rowsWritten <= 0) {
        return "none";
    }
    if (rowsWritten >= totalRows) {
        return "all";
    }
    return "some";
}

export function failureOutcome(
    message: string,
    confirmedRows: number,
    totalRows: number,
    writtenRanges: ImportOutcome["writtenRanges"] = [],
    preparedSheets: string[] = []
): ImportOutcome {
    const coverage = importCoverage(confirmedRows, totalRows);
    const guidance = coverage === "some"
        ? `${confirmedRows.toLocaleString()} of ${totalRows.toLocaleString()} rows `
            + "were written. Review the listed ranges before retrying."
        : coverage === "all"
            ? "All rows were written, but a later import step failed."
            : "No rows were written.";

    return {
        coverage,
        rowsWritten: confirmedRows,
        totalRows,
        writtenRanges,
        preparedSheets,
        message: `${message} ${guidance}`
    };
}

function importErrorMessage(error: unknown, fallback: string): string {
    if (
        typeof error === "object"
        && error !== null
        && "message" in error
        && typeof error.message === "string"
        && error.message
    ) {
        return error.message;
    }
    return fallback;
}
