import { FC, useMemo, useState } from "react";
import { useAtomValue } from "jotai";
import { styled } from "styled-components";

import {
    mergeFilesOptionAtom,
    sheetOptionAtom,
    startAtOptionAtom
} from "../../state/options";
import { FileImport } from "../FileImport/FileImport";
import { useFileImport } from "../FileImport/useFileImport";
import { FileUpload } from "../FileUpload/FileUpload";
import { Options } from "../Options/Options";


export const Import: FC = () => {
    const [files, setFiles] = useState<File[]>();
    const sheet = useAtomValue(sheetOptionAtom);
    const startAt = useAtomValue(startAtOptionAtom);
    const mergeFiles = useAtomValue(mergeFilesOptionAtom);
    const options = useMemo<UploadOptions>(() => ({
        sheet,
        startAt,
        mergeFiles
    }), [mergeFiles, sheet, startAt]);
    const importController = useFileImport({
        files,
        options
    });

    const onFileUploaded = (files: File[], replace: boolean) => {
        importController.reset();
        setFiles((oldFiles: File[] | undefined) => {
            if (oldFiles === undefined || replace) {
                return files;
            }
            return oldFiles.concat(files);
        });
    };

    const onFileRemove = (file: File) => {
        importController.reset();
        setFiles((oldFiles: File[] | undefined) => (oldFiles?.filter(f => f != file)));
    };

    return <Container>
        <FileUpload
            onUploaded={onFileUploaded}
            disabled={importController.locked}
            replaceOnUpload={importController.imported}
        />
        <FileImport
            files={files}
            onRemove={onFileRemove}
            controller={importController}
        />
        <Options disabled={importController.locked} />
    </Container>;
};

const Container = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-flow: column nowrap;
    justify-content: flex-start;
    align-items: center;
`;
