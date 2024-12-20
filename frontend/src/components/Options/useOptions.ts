import { useCallback } from "react";
import { useAtom } from "jotai";

import { mergeFilesOptionAtom, sheetOptionAtom, startAtOptionAtom } from "../../state/options";


export const useOptions = () => {
    const [sheet, setSheet] = useAtom(sheetOptionAtom);
    const [startAt, setStartAt] = useAtom(startAtOptionAtom);
    const [mergeFiles, setMergeFiles] = useAtom(mergeFilesOptionAtom);

    const setOptions = useCallback((options?: UploadOptions) => {
        if (!options) {
            return;
        }

        setSheet(options.sheet);
        setStartAt(options.startAt);
        setMergeFiles(options.mergeFiles);
    }, [setMergeFiles, setSheet, setStartAt]);

    const saveOptions = useCallback((options: UploadOptions) => {
        google.script.run
            .withFailureHandler((error) => {
                console.error(error);
            })
            .saveOptions(options);
    }, []);

    const saveSheet = useCallback((value: UploadOptions["sheet"]) => {
        setSheet(value);
        saveOptions({
            startAt,
            mergeFiles,
            sheet: value
        });
    }, [mergeFiles, saveOptions, setSheet, startAt]);

    const saveStartAt = useCallback((value: UploadOptions["startAt"]) => {
        setStartAt(value);
        saveOptions({
            startAt: value,
            mergeFiles,
            sheet
        });
    }, [mergeFiles, saveOptions, setStartAt, sheet]);

    const saveMergeFiles = useCallback((value: UploadOptions["mergeFiles"]) => {
        setMergeFiles(value);
        saveOptions({
            startAt,
            sheet,
            mergeFiles: value
        });
    }, [saveOptions, setMergeFiles, sheet, startAt]);

    return {
        setOptions,
        sheet,
        setSheet: saveSheet,
        startAt,
        setStartAt: saveStartAt,
        mergeFiles,
        setMergeFiles: saveMergeFiles
    };
};
