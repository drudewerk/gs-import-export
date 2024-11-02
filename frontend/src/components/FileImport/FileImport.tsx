import { FC, useMemo } from "react";
import styled from "styled-components";
import { Button } from "../../framework/Button/Button";
import jsonSrc from "../../assets/json.png";
import { Cross2Icon } from "@radix-ui/react-icons";


type FileImportProps = {
    file: File | undefined;
    onRemove: () => void;
};

export const FileImport: FC<FileImportProps> = ({ file, onRemove }) => {
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
                }).importJsonFile({
                    data: base64String,
                    fileName: fileName,
                    fileType: fileType,
                    options: {
                        sheet: "active",
                        sheetName: null,
                        startAt: "lastRow"
                    }
                });
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error("File upload failed", error);
            alert("Failed to upload the file");
        }
    };

    const fileSize = useMemo(() => {
        if (!file) {
            return 0;
        }

        const size = Math.round(file.size / 1048576 * 10) / 10;

        return size < 0.1 ? "<0.1 MB" : `${size} MB`;
    }, [file]);

    return <Container>
        {
            file ? <FileTile>
                <FileTileLeftPart>
                    <FileTypeImg src={jsonSrc} />
                    <FileName>{file.name}</FileName>
                </FileTileLeftPart>
                <FileTileRightPart>
                    <FileSize>{fileSize}</FileSize>
                    <FileRemove
                        onClick={onRemove}
                    >
                        <Cross2Icon />
                    </FileRemove>
                </FileTileRightPart>
            </FileTile>
                : <FileTile>
                    <FileName>No file selected</FileName>
                </FileTile>
        }
        <Button
            onClick={uploadFile}
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

const FileTile = styled.div`
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
    max-width: 160px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
`;

const FileSize = styled.span`
    justify-self: flex-end;
    flex-shrink: 0;
`;

const FileRemove = styled.div`
    display: flex;
    flex-flow: row;
    align-items: center;
    justify-content: center;
    cursor: pointer;
`;
