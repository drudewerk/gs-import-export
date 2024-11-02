import { FC } from "react";
import styled from "styled-components";
import { Button } from "../../framework/Button/Button";
import { useFileImport } from "./useFileImport";
import { FileTile } from "./FileTile";
import { useAtomValue } from "jotai";
import { mergeFilesOptionAtom, sheetOptionAtom, startAtOptionAtom } from "../../state/options";


type FileImportProps = {
    files: File[] | undefined;
    onRemove: (file: File) => void;
};

export const FileImport: FC<FileImportProps> = ({ files, onRemove }) => {
    const sheetOption = useAtomValue(sheetOptionAtom);
    const startAt = useAtomValue(startAtOptionAtom);
    const mergeFiles = useAtomValue(mergeFilesOptionAtom);

    const { start, importing, imported } = useFileImport({
        files,
        onSuccess: () => null,
        onError: () => null,
        options: {
            sheet: sheetOption,
            startAt: startAt,
            mergeFiles: mergeFiles
        }
    });

    return <Container>
        {
            files?.length
                ? <Files>
                    {files?.map(file => (<FileTile
                        file={file}
                        onRemove={onRemove}
                        importing={importing}
                        imported={imported}
                    />))}
                </Files>
                : null
        }
        <ImportButton
            onClick={start}
            disabled={!files || files.length == 0 || importing || imported}
        >
            Import
        </ImportButton>
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
    padding: 16px;
    overflow: hidden;
`;

const Files = styled.div`
    display: flex;
    width: 100%;
    flex-flow: column nowrap;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    overflow-y: auto;
    flex: 1;
`;

const ImportButton = styled(Button)`
    flex-shrink: 0;
`;
