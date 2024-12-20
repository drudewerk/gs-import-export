import { FC, useState } from "react";
import { styled } from "styled-components";

import { FileImport } from "../FileImport/FileImport";
import { FileUpload } from "../FileUpload/FileUpload";
import { Options } from "../Options/Options";


export const Import: FC = () => {
    const [files, setFiles] = useState<File[]>();

    const onFileUploaded = (files: File[], replace: boolean) => {
        setFiles((oldFiles: File[] | undefined) => {
            if (oldFiles === undefined || replace) {
                return files;
            }
            return oldFiles.concat(files);
        });
    };

    const onFileRemove = (file: File) => {
        setFiles((oldFiles: File[] | undefined) => (oldFiles?.filter(f => f != file)));
    };

    return <Container>
        <FileUpload onUploaded={onFileUploaded} />
        <FileImport files={files} onRemove={onFileRemove} />
        <Options />
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
