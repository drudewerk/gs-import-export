import { RadioGroup } from "../../framework/RadioGroup/RadioGroup";
import { Button } from "../../framework/Button/Button";

import { FC, useCallback, useState } from "react";


export const Export: FC = () => {
    const [isDownloading, setIsDownloading] = useState(false);
    const [exportSelectionOnly, setExportSelectionOnly] = useState("false");

    const handleDownload = useCallback(async () => {
        try {
            await google.script.run.withSuccessHandler((response: { data: string, fileName: string }) => {
                const byteCharacters = atob(response.data);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'application/json' });

                // Create a temporary download link
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                const currentTimestamp = Date.now();
                link.download = response.fileName + "_" + currentTimestamp + '.json'; // Set the filename
                link.click(); // Trigger the download
                setIsDownloading(false);
            })
                .withFailureHandler(() => {
                    setIsDownloading(false);
                    alert("Error while generating file")
                })
                .sheetDataToArray(exportSelectionOnly == "true");
            setIsDownloading(true);
        } catch (error) {
            console.error('Error downloading the file:', error);
        }
    }, [exportSelectionOnly]);

    return <div>
        <RadioGroup
            disabled={isDownloading}
            description="Export range"
            options={[
                {
                    value: "false",
                    label: "Current sheet"
                },
                {
                    value: "true",
                    label: "Current selection"
                }
            ]}
            defaultValue={exportSelectionOnly}
            onChange={setExportSelectionOnly}
        />
        <Button
            onClick={handleDownload}
            disabled={isDownloading}
        >
            {isDownloading ? "Please wait..." : "Download data as JSON"}
        </Button>
    </div>;
};