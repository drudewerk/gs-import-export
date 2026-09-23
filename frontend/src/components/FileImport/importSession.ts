import {
    ImportPreparationProgress,
    PreparedImport
} from "./prepareJsonImport";


export type ImportSessionState =
    | { phase: "idle"; }
    | ImportPreparationProgress
    | { phase: "previewing"; }
    | {
        phase: "review";
        preparedImport: PreparedImport;
        preview: ImportPreview;
    }
    | {
        phase: "preparing-destination";
        destinations: ConcreteImportDestination[];
    }
    | {
        phase: "writing";
        destinations: ConcreteImportDestination[];
        rowsWritten: number;
        totalRows: number;
    }
    | {
        phase: "succeeded";
        outcome: ImportOutcome;
    }
    | {
        phase: "failed";
        outcome: ImportOutcome;
    };

export type ImportSessionAction =
    | { type: "reset"; }
    | { type: "progress"; progress: ImportPreparationProgress; }
    | { type: "previewing"; }
    | {
        type: "review-ready";
        preparedImport: PreparedImport;
        preview: ImportPreview;
    }
    | { type: "import-started"; }
    | {
        type: "destinations-ready";
        destinations: ConcreteImportDestination[];
    }
    | {
        type: "write-progress";
        destinations: ConcreteImportDestination[];
        rowsWritten: number;
        totalRows: number;
    }
    | { type: "succeeded"; outcome: ImportOutcome; }
    | { type: "failed"; outcome: ImportOutcome; };

export const initialImportSession: ImportSessionState = { phase: "idle" };

export function importSessionReducer(
    state: ImportSessionState,
    action: ImportSessionAction
): ImportSessionState {
    switch (action.type) {
        case "reset":
            return initialImportSession;
        case "progress":
            return action.progress;
        case "previewing":
            return { phase: "previewing" };
        case "review-ready":
            return {
                phase: "review",
                preparedImport: action.preparedImport,
                preview: action.preview
            };
        case "import-started":
            return {
                phase: "preparing-destination",
                destinations: []
            };
        case "destinations-ready":
            if (
                state.phase !== "preparing-destination"
                && state.phase !== "writing"
            ) {
                return state;
            }
            return {
                phase: "preparing-destination",
                destinations: action.destinations
            };
        case "write-progress":
            if (
                state.phase !== "preparing-destination"
                && state.phase !== "writing"
            ) {
                return state;
            }
            return {
                phase: "writing",
                destinations: action.destinations,
                rowsWritten: action.rowsWritten,
                totalRows: action.totalRows
            };
        case "succeeded":
            return {
                phase: "succeeded",
                outcome: action.outcome
            };
        case "failed":
            return {
                phase: "failed",
                outcome: action.outcome
            };
    }
}

export function isImportBusy(state: ImportSessionState): boolean {
    return state.phase === "reading"
        || state.phase === "parsing"
        || state.phase === "preparing"
        || state.phase === "previewing"
        || state.phase === "preparing-destination"
        || state.phase === "writing";
}
