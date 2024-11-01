import { FC, useState } from "react";
import { FileUpload } from "./FileUpload/FileUpload";
import { FileImport } from "./FileImport/FileImport";
import styled from "styled-components";


export const Controller: FC = () => {
    const [file, setFile] = useState<File>();

    const onFileUploaded = (file: File) => {
        setFile(file);
    };

    const onFileRemove = () => {
        setFile(undefined);
    };

    return <Container>
        <FileUpload onUploaded={onFileUploaded} />
        <FileImport file={file} onRemove={onFileRemove} />
    </Container>;
};

const Container = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    justify-content: flex-start;
    gap: 8px;
`;

