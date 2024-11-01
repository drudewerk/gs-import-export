import { FC } from "react";
import styled from "styled-components";
import { Button } from "../../framework/Button/Button";

type FileImportProps = {
    file: File | undefined;
};

export const FileImport: FC<FileImportProps> = ({ file }) => {
    const uploadFile = () => {
        if (!file) {
            console.error("File is undefined!");
            return;
        }

        try {
            // Read the file as base64
            const reader = new FileReader();
            reader.onloadend = async () => {
                const fileType = file.type;
                const fileName = file.name;

                if (typeof reader.result != "string") {
                    return;
                }

                const base64String = reader.result?.split(",")[1];

                google.script.run.withSuccessHandler(x => {
                    alert(`File ${x} uploaded successfully!`);
                }).importJsonFile(base64String, fileType, fileName);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error("File upload failed", error);
            alert("Failed to upload the file");
        }
    };

    if (!file) {
        return null;
    }

    return <Container>
        {file.name}
        <Button
            onClick={uploadFile}
        >
            Import
        </Button>
    </Container>;
};

const Container = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-flow: column nowrap;
    justify-content: flex-start;
    align-items: center;
    gap: 16px;
`;
