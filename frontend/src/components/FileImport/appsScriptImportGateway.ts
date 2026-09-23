export type ImportGateway = {
    preview: (request: ImportPreviewRequest) => Promise<ImportPreview>;
    begin: (request: BeginImportRequest) => Promise<BeginImportResult>;
    writeChunk: (request: ImportChunkRequest) => Promise<ImportChunkResult>;
};

export const appsScriptImportGateway: ImportGateway = {
    preview: request => callAppsScript(runner => runner.previewJsonImport(request)),
    begin: request => callAppsScript(runner => runner.beginJsonImport(request)),
    async writeChunk(request) {
        try {
            return await callAppsScript(
                runner => runner.writeJsonImportChunk(request)
            );
        } catch {
            // The backend session makes an identical retry idempotent when the
            // first response is lost after setValues() succeeds.
            return callAppsScript(
                runner => runner.writeJsonImportChunk(request)
            );
        }
    }
};

function callAppsScript<T>(
    invoke: (runner: GoogleScriptRun) => void
): Promise<T> {
    return new Promise((resolve, reject) => {
        const runner = google.script.run
            .withSuccessHandler<T>(resolve)
            .withFailureHandler(reject);
        invoke(runner);
    });
}
