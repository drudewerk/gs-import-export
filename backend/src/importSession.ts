const MAX_IMPORT_CHUNK_CELLS = 25_000;
const MAX_IMPORT_CHUNK_BYTES = 1_048_576;
const IMPORT_SESSION_PREFIX = "json_import_session:";
const IMPORT_SESSION_TTL_MS = 6 * 60 * 60 * 1_000;
const IMPORT_LOCK_TIMEOUT_MS = 5_000;

function createImportSession(
    spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet,
    destinations: ConcreteImportDestination[]
): string {
    const props = PropertiesService.getUserProperties();
    cleanupExpiredImportSessions(props);
    const sessionId = Utilities.getUuid();
    const expiresAt = Date.now() + IMPORT_SESSION_TTL_MS;
    const storedKeys: string[] = [];

    try {
        for (const destination of destinations) {
            const key = importSessionKey(sessionId, destination.tableIndex);
            const session: StoredImportTableSession = {
                version: 1,
                spreadsheetId: spreadsheet.getId(),
                expiresAt,
                destination,
                nextChunkIndex: 0,
                nextRowOffset: 0
            };
            props.setProperty(key, JSON.stringify(session));
            storedKeys.push(key);
        }
    } catch (error) {
        for (const key of storedKeys) {
            props.deleteProperty(key);
        }
        throw error;
    }

    return sessionId;
}

function writeJsonImportChunk(request: ImportChunkRequest): ImportChunkResult {
    let rangeA1 = "";
    let rowsWritten = 0;

    try {
        return withImportLock(() => {
            validateImportChunkIdentity(request);
            const props = PropertiesService.getUserProperties();
            const key = importSessionKey(request.sessionId, request.tableIndex);
            const serializedSession = props.getProperty(key);
            if (!serializedSession) {
                throw new Error("The import session is unavailable.");
            }

            const session = JSON.parse(serializedSession) as StoredImportTableSession;
            if (session.version !== 1 || session.expiresAt <= Date.now()) {
                props.deleteProperty(key);
                throw new Error("The import session expired.");
            }

            const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
            if (session.spreadsheetId !== spreadsheet.getId()) {
                throw new Error("The import session belongs to another spreadsheet.");
            }

            const digest = importChunkDigest(request.values);
            if (request.chunkIndex < session.nextChunkIndex) {
                if (
                    session.lastChunk?.chunkIndex === request.chunkIndex
                    && session.lastChunk.digest === digest
                ) {
                    return session.lastChunk.result;
                }
                throw new Error("The import chunk has already been completed.");
            }
            if (request.chunkIndex !== session.nextChunkIndex) {
                throw new Error("The import chunks are out of order.");
            }

            validateImportChunk(request.values, session);
            const destination = session.destination;
            const sheet = spreadsheet.getSheets().find(
                candidate => candidate.getSheetId() === destination.sheetId
            );

            if (!sheet) {
                throw new Error("The destination sheet is no longer available.");
            }

            const startRow = destination.startRow + session.nextRowOffset;
            rangeA1 = importRangeA1(
                startRow,
                destination.startColumn,
                request.values.length,
                destination.columnCount
            );
            const range = sheet.getRange(
                startRow,
                destination.startColumn,
                request.values.length,
                destination.columnCount
            );
            range.setNumberFormat("@");
            range.setValues(request.values);
            rowsWritten = request.values.length;

            const result: ImportChunkResult = {
                ok: true,
                rowsWritten,
                rangeA1
            };
            session.nextChunkIndex += 1;
            session.nextRowOffset += rowsWritten;
            session.lastChunk = {
                chunkIndex: request.chunkIndex,
                digest,
                result
            };
            props.setProperty(key, JSON.stringify(session));

            return result;
        });
    } catch {
        return {
            ok: false,
            rowsWritten,
            rangeA1,
            message: rowsWritten > 0
                ? "The rows were written, but import progress could not be saved."
                : "Google Sheets could not write this part of the import."
        };
    }
}

function validateImportChunkIdentity(request: ImportChunkRequest) {
    if (
        typeof request.sessionId !== "string"
        || !/^[a-zA-Z0-9-]{10,100}$/.test(request.sessionId)
        || !Number.isInteger(request.tableIndex)
        || request.tableIndex < 0
        || !Number.isInteger(request.chunkIndex)
        || request.chunkIndex < 0
    ) {
        throw new Error("The import chunk identity is invalid.");
    }
}

function validateImportChunk(
    values: SheetCellValue[][],
    session: StoredImportTableSession
) {
    if (
        !values.length
        || session.nextRowOffset + values.length > session.destination.rowCount
    ) {
        throw new Error("The chunk row count is invalid.");
    }

    const columnCount = session.destination.columnCount;
    if (
        columnCount < 1
        || values.some(row => row.length !== columnCount)
    ) {
        throw new Error("The chunk is not rectangular.");
    }
    if (values.some(row => row.some(value => (
        value !== null
        && typeof value !== "string"
        && typeof value !== "boolean"
        && (
            typeof value !== "number"
            || !Number.isFinite(value)
        )
    )))) {
        throw new Error("The chunk contains an unsupported cell value.");
    }

    const cellCount = values.length * columnCount;
    if (cellCount > MAX_IMPORT_CHUNK_CELLS) {
        throw new Error("The chunk contains too many cells.");
    }

    const serializedValues = JSON.stringify(values);
    if (
        Utilities.newBlob(serializedValues).getBytes().length
        > MAX_IMPORT_CHUNK_BYTES
    ) {
        throw new Error("The chunk contains too much data.");
    }
}

function withImportLock<T>(callback: () => T): T {
    const lock = LockService.getUserLock();
    lock.waitLock(IMPORT_LOCK_TIMEOUT_MS);
    try {
        return callback();
    } finally {
        lock.releaseLock();
    }
}

function importSessionKey(sessionId: string, tableIndex: number): string {
    return `${IMPORT_SESSION_PREFIX}${sessionId}:${tableIndex}`;
}

function importChunkDigest(values: SheetCellValue[][]): string {
    return Utilities.base64Encode(
        Utilities.computeDigest(
            Utilities.DigestAlgorithm.SHA_256,
            JSON.stringify(values)
        )
    );
}

function cleanupExpiredImportSessions(
    props: GoogleAppsScript.Properties.Properties
) {
    const now = Date.now();
    const properties = props.getProperties();
    for (const key of Object.keys(properties)) {
        if (!key.startsWith(IMPORT_SESSION_PREFIX)) {
            continue;
        }

        try {
            const session = JSON.parse(properties[key]) as StoredImportTableSession;
            if (session.version !== 1 || session.expiresAt <= now) {
                props.deleteProperty(key);
            }
        } catch {
            props.deleteProperty(key);
        }
    }
}
