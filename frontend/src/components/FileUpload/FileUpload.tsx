import { FC, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useAtom, useAtomValue } from "jotai";
import { css, styled } from "styled-components";

import uploadBackgroundSrc from "../../assets/upload_background.png";
import { Button } from "../../framework/Button/Button";
import { ButtonType } from "../../framework/Button/types";
import { importedAtom, importingAtom } from "../../state/app";


type FileUploadProps = {
    onUploaded: (file: File[], replace: boolean) => void;
};

export const FileUpload: FC<FileUploadProps> = ({ onUploaded }) => {
    const importing = useAtomValue(importingAtom);
    const [imported, setImported] = useAtom(importedAtom);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        onUploaded(acceptedFiles, imported);
        if (imported) {
            setImported(false);
        }
    }, [imported, onUploaded, setImported]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        disabled: importing,
        accept: {
            "json": [".json"]
        },
        multiple: true
    });

    return <Container {...getRootProps()} $dragActive={isDragActive}>
        <input {...getInputProps()} />
        <UploadBackgroundImg src={uploadBackgroundSrc} />
        <Button
            type={ButtonType.primary}
            disabled={importing}
        >
            Browse
        </Button>
        <DragText>
            or drag files here
        </DragText>
    </Container>;
};

const Container = styled.div<{ $dragActive: boolean; }>`
    width: 100%;
    height: 205px;
    display: flex;
    flex-flow: column nowrap;
    justify-content: flex-start;
    align-items: center;
    gap: 16px;
    border-width: 5px;
    border-style: dashed;
    border-color: transparent;
    flex-shrink: 0;
    ${p => p.$dragActive && css`border-color: #dadce0;`}
    padding: 0 16px;
`;

const UploadBackgroundImg = styled.img`
    width: 165px;
    height: 100px;
`;

const DragText = styled.span`
    color: rgb(128, 134, 139);
    font-size: 20px;
`;
