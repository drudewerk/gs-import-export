/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-var */
// frontend/src/globals.d.ts

interface GoogleScriptRun {
    withSuccessHandler: <T>(callback: (result: T) => void) => GoogleScriptRun;
    withFailureHandler: <T>(callback: (error: any) => void) => GoogleScriptRun;
    getGreeting: (name: string) => void; // Example backend function
    importJsonFile: (data: string, fileType: string, fileName: string) => void;
    // Add more backend functions as needed
}

interface Google {
    script: {
        run: GoogleScriptRun;
    };
}

declare var google: Google;
