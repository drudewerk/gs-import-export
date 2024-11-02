import { FC } from "react";
import styled from "styled-components";
import { Button } from "../../framework/Button/Button";
import { useFileImport } from "./useFileImport";
import { FileTile } from "./FileTile";


type FileImportProps = {
    file: File | undefined;
    onRemove: () => void;
};

export const FileImport: FC<FileImportProps> = ({ file, onRemove }) => {
    const { start, importing, imported } = useFileImport({
        file: file,
        onSuccess: () => null,
        onError: () => null,
        options: {
            sheet: "active",
            sheetName: undefined,
            startAt: "lastRow"
        }
    });

    return <Container>
        <FileTile
            file={file}
            onRemove={onRemove}
            importing={importing}
            imported={imported}
        />
        <Button
            onClick={start}
            disabled={!file}
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
