import { FC, useMemo } from "react";
import { styled } from "styled-components";

import jsonSrc from "../../assets/json.png";
import { FileState } from "./FileState";


export type FileTileProps = {
    file: File | undefined;
    onRemove: (file: File) => void;
    importing: boolean;
    imported: boolean;
};

export const FileTile: FC<FileTileProps> = ({ file, onRemove, importing, imported }) => {
    const fileSize = useMemo(() => {
        if (!file) {
            return 0;
        }

        const size = Math.round(file.size / 1048576 * 10) / 10;

        return size < 0.1 ? "<0.1 MB" : `${size} MB`;
    }, [file]);

    if (!file) {
        return <FileTileContainer>
            <FileName>No file selected</FileName>
        </FileTileContainer>;
    }

    return <FileTileContainer>
        <FileTileLeftPart>
            <FileTypeImg src={jsonSrc} />
            <FileName>{file.name}</FileName>
        </FileTileLeftPart>
        <FileTileRightPart>
            <FileSize>{fileSize}</FileSize>
            <FileState
                imported={imported}
                importing={importing}
                onRemove={() => onRemove(file)}
            />
        </FileTileRightPart>
    </FileTileContainer>;
};


const FileTileContainer = styled.div`
    background-color: #f0f4f9;
    width: 100%;
    height: 32px;
    padding: 3px 8px;
    border-radius: 8px;
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
`;

const FileTileLeftPart = styled.div`
    display: flex;
    flex-flow: row nowrap;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
`;

const FileTileRightPart = styled.div`
    display: flex;
    flex-flow: row nowrap;
    justify-content: flex-end;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
`;

const FileTypeImg = styled.img`
    width: 24px;
    height: 24px;
`;

const FileName = styled.span`
    max-width: 130px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
`;

const FileSize = styled.span`
    justify-self: flex-end;
    flex-shrink: 0;
`;
