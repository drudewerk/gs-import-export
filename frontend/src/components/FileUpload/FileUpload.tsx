import { FC, useCallback } from "react";
import styled, { css } from "styled-components";
import { Button } from "../../framework/Button/Button";
import { useDropzone } from "react-dropzone";
import { ButtonType } from "../../framework/Button/types";
import uploadBackgroundSrc from "../../assets/upload_background.png";


type FileUploadProps = {
    onUploaded: (file: File) => void;
};

export const FileUpload: FC<FileUploadProps> = ({ onUploaded }) => {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        onUploaded(acceptedFiles[0]);
    }, [onUploaded]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "json": [".json"]
        }
    });

    return <Container {...getRootProps()} $dragActive={isDragActive}>
        <input {...getInputProps()} />
        <UploadBackgroundImg src={uploadBackgroundSrc} />
        <Button
            type={ButtonType.primary}
        >
            Browse
        </Button>
        <DragText>
            or drag file here
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
