import { useCallback, useEffect, useState } from "react";
import { useDropzone } from 'react-dropzone';
import styled from "styled-components";
import { Button } from "../framework/Button/Button";
import { ButtonType } from "../framework/Button/types";


export const Upload: React.FC = () => {

    const [file, setFile] = useState<File | null>(null);
    const [uploadState, setUploadState] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFile(acceptedFiles[0]);
    }, [])
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

    useEffect(() => {
        if (file == null) {
            return;
        }
        setUploadState(file.name);

    }, [file]);

    const uploadFile = () => {
        if (!file) {
            alert('Please select a file to upload.');
            return;
        }

        try {
            // Read the file as base64
            const reader = new FileReader();
            reader.onloadend = async () => {
                const fileType = file.type;
                const fileName = file.name;
                console.log(reader.result);
                if (typeof reader.result != "string") {
                    return;
                }
                const base64String = reader.result?.split(',')[1];

                google.script.run.withSuccessHandler(x => {
                    setUploadState("Uploaded!");
                    alert(`File ${x} uploaded successfully!`);
                }).importJsonFile(base64String, fileType, fileName);
            };
            setUploadState("Uploading...");
            reader.readAsDataURL(file);
        } catch (error) {
            setUploadState(null);
            console.error('File upload failed', error);
            alert('Failed to upload the file');
        }
    }

    return <div>
        <div {...getRootProps()}>
            <input {...getInputProps()} />
            {
                isDragActive ?
                    <p>Drop the files here ...</p> :
                    <p>Drag 'n' drop some files here, or click to select files</p>
            }
            {uploadState !== null && <p>{uploadState}</p>}
        </div>
        <GreetButton
            type={ButtonType.primary}
            onClick={uploadFile}
            disabled={file === null}
        >
            Import
        </GreetButton>
    </div>
}


const GreetButton = styled(Button)`
    margin-left: 10px;
`;