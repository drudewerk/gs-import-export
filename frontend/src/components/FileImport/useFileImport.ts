import { useCallback, useLayoutEffect } from "react";
import { useAtom } from "jotai";

import { importedAtom, importingAtom } from "../../state/app";
import { useErrorOverlay } from "../ErrorOverlay/useErrorOverlay";
import { useRateUs } from "../RateUs/useRateUs";


type FileImportOptions = {
    sheet?: UploadOptions["sheet"];
    startAt?: UploadOptions["startAt"];
    mergeFiles?: UploadOptions["mergeFiles"];
};

type FileImportProps = {
    files: File[] | undefined;
    options?: FileImportOptions;
};

type FileToUpload = {
    data: string;
    fileName: string;
    fileType: string;
};

export const useFileImport = ({
    files: files,
    options
}: FileImportProps) => {
    const [imported, setImported] = useAtom(importedAtom);
    const [importing, setImporting] = useAtom(importingAtom);
    const {
        setError,
        resetError
    } = useErrorOverlay();

    const { promptRateUs } = useRateUs();

    useLayoutEffect(() => {
        setImported(false);
        setImporting(false);
    }, [files, setImporting, setImported]);

    const importFiles = useCallback((files: FileToUpload[]) => {
        resetError();
        google.script.run
            .withSuccessHandler(() => {
                setImporting(false);
                setImported(true);
                promptRateUs();
            })
            .withFailureHandler((error) => {
                setImported(false);
                setImporting(false);
                setError(
                    "Failed to import files",
                    error.message
                );
                console.error(error);
            })
            .importJsonFile({
                files,
                options: {
                    ...(options ?? {})
                }
            });
    }, [resetError, options, setImporting, setImported, promptRateUs, setError]);

    const uploadFile = useCallback(() => {
        if (!files) {
            throw new Error("Files are undefined!");
        }

        resetError();
        setImporting(true);

        try {
            const fileDataList: FileToUpload[] = [];

            // Process each file
            files.forEach((file, i) => {
                const reader = new FileReader();
                reader.onload = async () => {
                    const fileType = file.type;
                    const fileName = file.name;

                    if (typeof reader.result != "string") {
                        setImporting(false);
                        return;
                    }

                    const base64String = reader.result?.split(",")[1];
                    fileDataList.push({
                        fileType,
                        fileName,
                        data: base64String
                    });

                    // Once all files are processed, send them to the backend
                    if (i === files.length - 1) {
                        importFiles(fileDataList);
                    }
                };
                reader.readAsDataURL(file);
            });
        } catch (error) {
            setImporting(false);
            setImported(false);
            setError(
                "Failed to upload files",
                (error as { message: string; })?.message
            );
            console.error("File upload failed", error);
        }
    }, [files, importFiles, resetError, setError, setImported, setImporting]);

    return {
        start: uploadFile,
        importing,
        imported
    };
};
