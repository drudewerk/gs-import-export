import { FC, useMemo, useState } from "react";
import { FileUpload } from "./FileUpload/FileUpload";
import { FileImport } from "./FileImport/FileImport";
import styled from "styled-components";

type AppState = "upload" | "import";

export const Controller: FC = () => {
    const [file, setFile] = useState<File>();
    const [appState, setAppState] = useState<AppState>("upload");

    const onFileUploaded = (file: File) => {
        setFile(file);
        setAppState("import");
    };

    const render = useMemo(() => {
        switch (appState) {
            case "upload":
                return <FileUpload onUploaded={onFileUploaded} />;
            case "import":
                return <FileImport file={file} />;
            default:
                return <div>Bad luck!</div>;
        }
    }, [appState, file]);

    return <Container>
        {render}
    </Container>;
};

const Container = styled.div`
    width: 100%;
    height: 100%;
`;

