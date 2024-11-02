import { RadioGroup } from "../../framework/RadioGroup/RadioGroup";
import { Button } from "../../framework/Button/Button";

import { FC, useCallback, useState } from "react";
import styled from "styled-components";
import { Loader } from "../../framework/Loader/Loader";


export const Export: FC = () => {
    const [downloading, setDownloading] = useState(false);
    const [exportFrom, setExportFrom] = useState<"sheet" | "selection">("sheet");

    const handleDownload = useCallback(async () => {
        try {
            google.script.run.withSuccessHandler((response: { data: string, fileName: string; }) => {
                const byteCharacters = atob(response.data);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: "application/json" });

                // Create a temporary download link
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                const currentTimestamp = Date.now();
                link.download = response.fileName + "_" + currentTimestamp + ".json"; // Set the filename
                link.click(); // Trigger the download
                setDownloading(false);
            })
                .withFailureHandler(() => {
                    setDownloading(false);
                    alert("Error while generating file");
                })
                .sheetDataToArray(exportFrom == "selection");
            setDownloading(true);
        } catch (error) {
            console.error("Error downloading the file:", error);
        }
    }, [exportFrom]);

    return <Container>
        <RadioGroup
            disabled={downloading}
            description="Export from"
            options={[
                {
                    value: "sheet",
                    label: "Current sheet"
                },
                {
                    value: "selection",
                    label: "Current selection"
                }
            ]}
            defaultValue={exportFrom}
            onChange={(value) => setExportFrom(value as "sheet" | "selection")}
        />
        <ButtonContainer>
            <Button
                onClick={handleDownload}
                disabled={downloading}
            >
                Export
            </Button>
            {downloading && <Loader />}
        </ButtonContainer>
    </Container>;
};


const Container = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-flow: column nowrap;
    justify-content: flex-start;
    gap: 16px;
    padding: 16px;
    padding-top: 0px;
`;

const ButtonContainer = styled.div`
    display: flex;
    flex-flow: row nowrap;
    justify-content: flex-start;
    align-items: center;
    gap: 16px;
`;
