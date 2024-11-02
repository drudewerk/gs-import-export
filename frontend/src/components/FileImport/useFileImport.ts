import { useCallback, useLayoutEffect } from "react";
import { importedAtom, importingAtom } from "../../state/app";
import { useAtom } from "jotai";


type FileImportOptions = {
    sheet?: "active" | "name";
    sheetName?: string;
    startAt?: "lastRow" | "selection";
};

type FileImportProps = {
    files: File[] | undefined;
    onSuccess: () => void;
    onError: (error: unknown) => void;
    options?: FileImportOptions;
};

type FileToUpload = {
    data: string;
    fileName: string;
    fileType: string;
}

export const useFileImport = ({
    files: files,
    onError,
    options
}: FileImportProps) => {
    const [imported, setImported] = useAtom(importedAtom);
    const [importing, setImporting] = useAtom(importingAtom);

    useLayoutEffect(() => {
        setImported(false);
        setImporting(false);
    }, [files, setImporting, setImported]);

    const importFiles = useCallback((files: FileToUpload[]) => {
        google.script.run.withSuccessHandler(() => {
            setImporting(false);
            setImported(true);
        }).importJsonFile({
            files,
            options: {
                ...(options ?? {})
            }
        });
    }, [options, setImporting, setImported]);

    const uploadFile = useCallback(() => {
        if (!files) {
            throw new Error("Files are undefined!");
        }

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
            console.error("File upload failed", error);
            onError(error);
        }
    }, [files, importFiles, onError, setImporting]);

    return {
        start: uploadFile,
        importing,
        imported
    };
};
