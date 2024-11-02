import { FC } from "react";
import styled from "styled-components";
import { Button } from "../../framework/Button/Button";
import { useFileImport } from "./useFileImport";
import { FileTile } from "./FileTile";
import { useAtomValue } from "jotai";
import { sheetOptionAtom, startAtOptionAtom } from "../../state/options";


type FileImportProps = {
    files: File[] | undefined;
    onRemove: (file: File) => void;
};

export const FileImport: FC<FileImportProps> = ({ files, onRemove }) => {
    const sheetOption = useAtomValue(sheetOptionAtom);
    const startAt = useAtomValue(startAtOptionAtom);
    // const mergeFiles = useAtomValue(mergeFilesOptionAtom);

    const { start, importing, imported } = useFileImport({
        files,
        onSuccess: () => null,
        onError: () => null,
        options: {
            sheet: sheetOption,
            startAt: startAt
        }
    });

    return <Container>
        {files?.map(file => (<FileTile
            file={file}
            onRemove={onRemove}
            importing={importing}
            imported={imported}
        />))}
        <Button
            onClick={start}
            disabled={!files || files.length == 0 || importing || imported}
        >
            Import
        </Button>
    </Container>;
};

const Container = styled.div`
    width: 100%;
    display: flex;
    flex-flow: column nowrap;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
    border-top: 1px solid #dadce0;
    padding: 0 16px;
    padding-top: 16px;
`;
