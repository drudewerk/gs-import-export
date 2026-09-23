/// <reference lib="webworker" />

import {
    DocumentEstimateContext,
    DocumentPreparationProgress,
    prepareJsonDocument
} from "./prepareJsonDocument";


type PrepareRequest = {
    buffer: ArrayBuffer;
    fileName: string;
    estimate: DocumentEstimateContext;
};

type PrepareResponse =
    | {
        type: "progress";
        progress: DocumentPreparationProgress;
    }
    | {
        type: "complete";
        recordSet: ReturnType<typeof prepareJsonDocument>;
    }
    | {
        type: "error";
        message: string;
    };

const workerScope = self as unknown as DedicatedWorkerGlobalScope;

workerScope.onmessage = (event: MessageEvent<PrepareRequest>) => {
    try {
        const recordSet = prepareJsonDocument(
            event.data.buffer,
            event.data.fileName,
            progress => postResponse({
                type: "progress",
                progress
            }),
            event.data.estimate
        );
        postResponse({
            type: "complete",
            recordSet
        });
    } catch (error) {
        postResponse({
            type: "error",
            message: error instanceof Error
                ? error.message
                : "The JSON document could not be prepared."
        });
    }
};

function postResponse(response: PrepareResponse) {
    workerScope.postMessage(response);
}
