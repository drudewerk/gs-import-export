import { FC } from "react";
import { styled } from "styled-components";

import { Button } from "../../framework/Button/Button";
import { ButtonType } from "../../framework/Button/types";
import { FileTile } from "./FileTile";
import { useFileImport } from "./useFileImport";


type FileImportProps = {
    files: File[] | undefined;
    onRemove: (file: File) => void;
    controller: ReturnType<typeof useFileImport>;
};

export const FileImport: FC<FileImportProps> = ({
    files,
    onRemove,
    controller
}) => {
    const {
        review,
        confirm,
        cancelReview,
        importing,
        imported,
        uiState
    } = controller;

    return <Container>
        {
            files?.length
                ? <Files>
                    {
                        files?.map(file => (
                            <FileTile
                                key={`${file.name}-${file.size}-${file.lastModified}`}
                                file={file}
                                onRemove={onRemove}
                                importing={importing}
                                imported={imported}
                                locked={uiState.phase === "review"}
                            />
                        ))
                    }
                </Files>
                : null
        }
        <ImportStatus uiState={uiState} />
        {
            uiState.phase === "review"
                ? <PreviewPanel role="status" aria-live="polite">
                    <PreviewTitle>Review import</PreviewTitle>
                    <PreviewSummary>
                        {uiState.preview.totalRows.toLocaleString()} rows ·{" "}
                        {uiState.preview.totalCells.toLocaleString()} cells
                    </PreviewSummary>
                    {uiState.preview.destinations.map(destination => (
                        <Destination key={destination.tableIndex}>
                            <span>
                                {destination.sheetName}: {destination.rangeA1}
                            </span>
                            <DestinationDetail $warning={destination.overwritesExisting}>
                                {destination.overwritesExisting
                                    ? "Overwrites existing cells"
                                    : "Does not overwrite existing cells"}
                                {destination.addedRows || destination.addedColumns
                                    ? ` · expands by ${destination.addedRows} rows and `
                                        + `${destination.addedColumns} columns`
                                    : ""}
                            </DestinationDetail>
                        </Destination>
                    ))}
                </PreviewPanel>
                : null
        }
        {
            (
                uiState.phase === "preparing-destination"
                || uiState.phase === "writing"
            )
                ? <PreviewPanel role="status" aria-live="polite">
                    <PreviewTitle>Import destinations</PreviewTitle>
                    {uiState.destinations.map(destination => (
                        <Destination key={destination.tableIndex}>
                            {destination.sheetName}: {destination.rangeA1}
                        </Destination>
                    ))}
                </PreviewPanel>
                : null
        }
        {
            (uiState.phase === "succeeded" || uiState.phase === "failed")
                ? <OutcomePanel role="status" aria-live="polite" $succeeded={uiState.phase === "succeeded"}>
                    <PreviewTitle>
                        {uiState.phase === "succeeded"
                            ? "Import complete"
                            : uiState.outcome.coverage === "all"
                                ? "Import stopped after writing all rows"
                                : uiState.outcome.coverage === "some"
                                ? "Import partially complete"
                                : "No rows imported"}
                    </PreviewTitle>
                    <span>
                        {uiState.outcome.rowsWritten.toLocaleString()} of{" "}
                        {uiState.outcome.totalRows.toLocaleString()} rows written
                    </span>
                    {uiState.phase === "failed" && uiState.outcome.preparedSheets.length
                        ? <span>Sheets: {uiState.outcome.preparedSheets.join(", ")}</span>
                        : null}
                    {uiState.outcome.writtenRanges.map((range, index) => (
                        <span key={`${range.sheetName}-${range.rangeA1}-${index}`}>
                            {uiState.phase === "succeeded" ? "Written" : "Confirmed"}:{" "}
                            {range.sheetName} {range.rangeA1}
                        </span>
                    ))}
                </OutcomePanel>
                : null
        }
        <Actions>
            {
                uiState.phase === "review"
                    ? <>
                        <Button
                            type={ButtonType.secondary}
                            onClick={cancelReview}
                        >
                            Cancel
                        </Button>
                        <ImportButton onClick={confirm}>
                            Confirm import
                        </ImportButton>
                    </>
                    : (
                        <ImportButton
                            onClick={review}
                            disabled={!files || files.length === 0 || importing || imported}
                        >
                            Review import
                        </ImportButton>
                    )
            }
        </Actions>
    </Container>;
};

const ImportStatus: FC<{
    uiState: ReturnType<typeof useFileImport>["uiState"];
}> = ({ uiState }) => {
    let label: string | undefined;
    let value: number | undefined;

    switch (uiState.phase) {
        case "reading":
            label = `Reading file ${uiState.fileNumber} of ${uiState.totalFiles}`;
            value = uiState.totalBytes
                ? uiState.completedBytes / uiState.totalBytes * 100
                : 0;
            break;
        case "preparing":
            label = `Preparing file ${uiState.fileNumber} of ${uiState.totalFiles}: `
                + `${uiState.completedRecords.toLocaleString()} of `
                + `${uiState.totalRecords.toLocaleString()} records`;
            value = uiState.totalRecords
                ? uiState.completedRecords / uiState.totalRecords * 100
                : 0;
            break;
        case "parsing":
            label = `Parsing file ${uiState.fileNumber} of ${uiState.totalFiles}`;
            break;
        case "previewing":
            label = "Checking the destination";
            break;
        case "preparing-destination":
            label = "Preparing the destination";
            break;
        case "writing":
            label = `Writing ${uiState.rowsWritten.toLocaleString()} of `
                + `${uiState.totalRows.toLocaleString()} rows`;
            value = uiState.totalRows
                ? uiState.rowsWritten / uiState.totalRows * 100
                : 0;
            break;
        default:
            return null;
    }

    return <ProgressPanel role="status" aria-live="polite">
        <span>{label}</span>
        {
            value === undefined
                ? <IndeterminateBar />
                : <ProgressBar max={100} value={Math.min(100, value)} />
        }
    </ProgressPanel>;
};

const Container = styled.div`
    width: 100%;
    display: flex;
    flex-flow: column nowrap;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
    border-top: 1px solid #dadce0;
    padding: 16px;
`;

const Files = styled.div`
    display: flex;
    width: 100%;
    flex-flow: column nowrap;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
`;

const Actions = styled.div`
    display: flex;
    gap: 8px;
`;

const ImportButton = styled(Button)`
    flex-shrink: 0;
`;

const ProgressPanel = styled.div`
    display: flex;
    width: 100%;
    flex-flow: column nowrap;
    gap: 6px;
    color: #3c4043;
    font-size: 13px;
`;

const ProgressBar = styled.progress`
    width: 100%;
    height: 8px;
    accent-color: #188038;
`;

const IndeterminateBar = styled.div`
    width: 100%;
    height: 8px;
    border-radius: 4px;
    background: linear-gradient(90deg, #e6f4ea 0%, #188038 50%, #e6f4ea 100%);
    background-size: 200% 100%;
    animation: import-progress 1.2s linear infinite;

    @keyframes import-progress {
        from {
            background-position: 100% 0;
        }
        to {
            background-position: -100% 0;
        }
    }
`;

const PreviewPanel = styled.div`
    display: flex;
    width: 100%;
    flex-flow: column nowrap;
    gap: 8px;
    padding: 12px;
    border: 1px solid #dadce0;
    border-radius: 8px;
    font-size: 13px;
`;

const PreviewTitle = styled.strong`
    font-size: 14px;
`;

const PreviewSummary = styled.span`
    color: #5f6368;
`;

const Destination = styled.div`
    display: flex;
    flex-flow: column nowrap;
    gap: 2px;
`;

const DestinationDetail = styled.span<{ $warning: boolean; }>`
    color: ${({ $warning }) => ($warning ? "#b06000" : "#5f6368")};
`;

const OutcomePanel = styled(PreviewPanel)<{ $succeeded: boolean; }>`
    border-color: ${({ $succeeded }) => (
        $succeeded ? "#a8dab5" : "#f4b400"
    )};
`;
