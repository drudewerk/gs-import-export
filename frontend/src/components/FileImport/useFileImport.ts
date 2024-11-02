import { useCallback, useLayoutEffect, useState } from "react";
import { importingAtom } from "../../state/app";
import { useAtom } from "jotai";


type FileImportOptions = {
    sheet?: "active" | "name";
    sheetName?: string;
    startAt?: "lastRow" | "selection";
};

type FileImportProps = {
    file: File | undefined;
    onSuccess: () => void;
    onError: (error: unknown) => void;
    options?: FileImportOptions;
};

export const useFileImport = ({
    file,
    onError,
    options
}: FileImportProps) => {
    const [imported, setImported] = useState(false);
    const [importing, setImporting] = useAtom(importingAtom);

    useLayoutEffect(() => {
        setImported(false);
        setImporting(false);
    }, [file, setImporting]);

    const importFile = useCallback((data: string, fileName: string, fileType: string) => {
        google.script.run.withSuccessHandler(() => {
            setImporting(false);
            setImported(true);
        }).importJsonFile({
            data: data,
            fileName: fileName,
            fileType: fileType,
            options: {
                ...(options ?? {})
            }
        });
    }, [options, setImporting]);

    const uploadFile = useCallback(() => {
        if (!file) {
            throw new Error("File is undefined!");
        }

        setImporting(true);

        try {
            // Read the file as base64
            const reader = new FileReader();
            reader.onloadend = async () => {
                const fileType = file.type;
                const fileName = file.name;

                if (typeof reader.result != "string") {
                    setImporting(false);
                    return;
                }

                const base64String = reader.result?.split(",")[1];

                importFile(base64String, fileName, fileType);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error("File upload failed", error);
            onError(error);
        }
    }, [file, importFile, onError, setImporting]);

    return {
        start: () => uploadFile(),
        importing,
        imported
    };
};