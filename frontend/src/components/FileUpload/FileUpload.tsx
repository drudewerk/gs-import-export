import { FC, useState } from "react";


export const FileUpload: FC = () => {
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || !event.target.files[0]) {
            return;
        }

        setFile(event.target.files[0]);
    };

    const uploadFile = () => {
        if (!file) {
            alert("Please select a file to upload.");
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

    return <div>
        Upload file to import
        <input type="file" onChange={handleFileChange} />
        <button onClick={uploadFile}>Import</button>
    </div>;
};
