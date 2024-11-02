import { FC, useState } from "react";
import { FileUpload } from "./FileUpload/FileUpload";
import { FileImport } from "./FileImport/FileImport";
import styled from "styled-components";
import { Options } from "./Options/Options";


export const Controller: FC = () => {
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
        <UpperPart>
            <FileUpload onUploaded={onFileUploaded} />
            <FileImport files={files} onRemove={onFileRemove} />
        </UpperPart>
        <Options />
    </Container>;
};

const Container = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-flow: column nowrap;
    justify-content: space-between;
    align-items: center;
    overflow: hidden;
`;

const UpperPart = styled.div`
    display: flex;
    width: 100%;
    flex-flow: column nowrap;
    justify-content: flex-start;
    align-items: center;
    flex: 1;
    overflow: hidden;
    gap: 8px;
`;
