import { useCallback, useReducer } from "react";

import { useErrorOverlay } from "../ErrorOverlay/useErrorOverlay";
import { useRateUs } from "../RateUs/useRateUs";
import { appsScriptImportGateway } from "./appsScriptImportGateway";
import {
    importSessionReducer,
    initialImportSession,
    isImportBusy
} from "./importSession";
import {
    executePreparedImport,
    failureOutcome
} from "./importWorkflow";
import {
    ImportPreparationError,
    prepareJsonImport
} from "./prepareJsonImport";


type FileImportProps = {
    files: File[] | undefined;
    options: UploadOptions;
};

export const useFileImport = ({
    files,
    options
}: FileImportProps) => {
    const [state, dispatch] = useReducer(importSessionReducer, initialImportSession);
    const {
        setError,
        resetError
    } = useErrorOverlay();
    const { promptRateUs } = useRateUs();

    const reset = useCallback(() => {
        dispatch({ type: "reset" });
        resetError();
    }, [resetError]);

    const review = useCallback(async () => {
        if (!files?.length) {
            setError("No files selected", "Select at least one JSON file.");
            return;
        }

        resetError();
        dispatch({
            type: "progress",
            progress: {
                phase: "reading",
                completedBytes: 0,
                totalBytes: files.reduce((sum, file) => sum + file.size, 0),
                fileNumber: 1,
                totalFiles: files.length
            }
        });

        try {
            const preparedImport = await prepareJsonImport(
                files,
                options,
                progress => dispatch({ type: "progress", progress })
            );
            dispatch({ type: "previewing" });
            const preview = await appsScriptImportGateway.preview({
                tables: preparedImport.tables.map(table => ({
                    tableIndex: table.tableIndex,
                    rowCount: table.rowCount,
                    columnCount: table.columnCount
                })),
                options
            });

            dispatch({
                type: "review-ready",
                preparedImport,
                preview
            });
        } catch (error) {
            const message = importErrorMessage(
                error,
                "The files could not be prepared. Check their size and JSON structure."
            );
            const outcome = failureOutcome(message, 0, 0);
            dispatch({ type: "failed", outcome });
            setError("Import could not be prepared", message);
        }
    }, [
        files,
        options,
        resetError,
        setError
    ]);

    const confirm = useCallback(async () => {
        if (state.phase !== "review") {
            return;
        }

        const {
            preparedImport,
            preview
        } = state;
        resetError();
        dispatch({ type: "import-started" });

        const outcome = await executePreparedImport({
            preparedImport,
            preview,
            options,
            gateway: appsScriptImportGateway,
            onEvent: dispatch
        });

        if (outcome.coverage === "all" && !outcome.message) {
            dispatch({ type: "succeeded", outcome });
            promptRateUs();
            return;
        }

        dispatch({ type: "failed", outcome });
        setError(
            "Import stopped",
            outcome.message ?? "The import stopped before all rows were written."
        );
    }, [
        options,
        promptRateUs,
        resetError,
        setError,
        state
    ]);

    const importing = isImportBusy(state);
    const imported = state.phase === "succeeded";
    const locked = importing || state.phase === "review";

    return {
        review,
        confirm,
        reset,
        cancelReview: reset,
        importing,
        imported,
        locked,
        uiState: state
    };
};

function importErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof ImportPreparationError) {
        return error.message;
    }
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
