import { FC } from "react";

export const DownloadFile: FC = () => {
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
            }).sheetDataToArray();


            // Create a download link

        } catch (error) {
            console.error('Error downloading the file:', error);
        }
    };

    return <div>
        <a href="javascript:" onClick={handleDownload}>Download data as JSON</a>
    </div>;
};