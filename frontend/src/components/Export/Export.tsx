import { FC, useCallback, useState } from "react";
import { styled } from "styled-components";

import { Button } from "../../framework/Button/Button";
import { Loader } from "../../framework/Loader/Loader";
import { RadioGroup } from "../../framework/RadioGroup/RadioGroup";
import { useErrorOverlay } from "../ErrorOverlay/useErrorOverlay";
import { useRateUs } from "../RateUs/useRateUs";


export const Export: FC = () => {
    const [exporting, setExporting] = useState(false);
    const [exportFrom, setExportFrom] = useState<"sheet" | "selection">("sheet");
    const {
        setError,
        resetError
    } = useErrorOverlay();

    const { promptRateUs } = useRateUs();

    const handleDownload = useCallback(async () => {
        try {
            resetError();

            google.script.run
                .withSuccessHandler((response: { data: string; fileName: string; }) => {
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
                    setExporting(false);
                    promptRateUs();
                })
                .withFailureHandler((error) => {
                    setExporting(false);
                    setError(
                        "Failed to export file as JSON",
                        error?.message
                    );
                    console.error(error);
                })
                .sheetDataToArray(exportFrom == "selection");

            setExporting(true);
        } catch (error) {
            setExporting(false);
            setError(
                "Failed to export file as JSON",
                (error as { message: string; })?.message
            );
            console.error("Error downloading the file:", error);
        }
    }, [exportFrom, promptRateUs, resetError, setError]);

    return <Container>
        <RadioGroup
            disabled={exporting}
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
                disabled={exporting}
            >
                Export
            </Button>
            {exporting && <Loader />}
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
