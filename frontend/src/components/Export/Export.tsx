import { FC, useState } from "react";


export const Export: FC = () => {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
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
            }).sheetDataToArray();
            setIsDownloading(true);
        } catch (error) {
            console.error('Error downloading the file:', error);
        }
    };

    if (isDownloading) {
        return <p>
            Please wait...
        </p>
    }
    else {
        return <p>
            <a href="javascript:" onClick={handleDownload}>Download data as JSON</a>
        </p>;
    }
};