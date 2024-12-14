/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-var */


type UploadOptions = {
    sheet?: "active" | "new";
    startAt?: "selection" | "end";
    mergeFiles?: boolean;
};

type UploadedFile = {
    data: string;
    fileType: string;
    fileName: string;
};

type UploadData = {
    files: UploadedFile[];
    options: UploadOptions;
};

type CurrentState = {
    state: "none" | "import" | "export" | "error";
    options?: UploadOptions;
};

type RateUsState = "shown" | "dismissed" | "rate_clicked" | "not_shown";

interface GoogleScriptRun {
    withSuccessHandler: <T>(callback: (result: T) => void) => GoogleScriptRun;
    withFailureHandler: (callback: (error: any) => void) => GoogleScriptRun;
    importJsonFile: (uploadData: UploadData) => void;
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
