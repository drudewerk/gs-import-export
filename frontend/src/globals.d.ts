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

interface GoogleScriptRun {
    withSuccessHandler: <T>(callback: (result: T) => void) => GoogleScriptRun;
    withFailureHandler: <T>(callback: (error: any) => void) => GoogleScriptRun;
    importJsonFile: (uploadData: UploadData) => void;
    saveOptions: (options: UploadOptions) => void;
    getOptions: () => UploadOptions;
    // Add more backend functions as needed
    getCurrentState: () => string;
    sheetDataToArray: (selectionOnly: boolean) => void;
}

interface Google {
    script: {
        run: GoogleScriptRun;
    };
}

declare var google: Google;
