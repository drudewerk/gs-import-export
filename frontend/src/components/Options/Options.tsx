import { FC, useState } from "react";
import styled from "styled-components";
import { ChevronUpIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { useAtom } from "jotai";
import { mergeFilesOptionAtom, sheetOptionAtom, startAtOptionAtom } from "../../state/options";
import { Checkbox } from "../../framework/Checkbox/Checkbox";
import { RadioGroup } from "../../framework/RadioGroup/RadioGroup";


const HEADER_HEIGHT = "32px";
const CONTENT_HEIGHT = "250px";

export const Options: FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [sheet, setSheet] = useAtom(sheetOptionAtom);
    const [startAt, setStartAt] = useAtom(startAtOptionAtom);
    const [mergeFiles, setMergeFiles] = useAtom(mergeFilesOptionAtom);

    const togglePanel = () => {
        setIsOpen((prev) => !prev);
    };

    return (
        <OptionsContainer isOpen={isOpen}>
            <Header onClick={togglePanel}>
                <span>Options</span>
                {isOpen ? <ChevronDownIcon /> : <ChevronUpIcon />}
            </Header>
            <Content>
                <Checkbox
                    label="Merge data from all files together"
                    checked={mergeFiles}
                    onChange={(value) => setMergeFiles(value)}
                />
                <RadioGroup
                    description="Import into"
                    options={[
                        {
                            value: "active",
                            label: "Current sheet"
                        },
                        {
                            value: "name",
                            label: "New sheet"
                        }
                    ]}
                    defaultValue={sheet}
                    onChange={(value) => setSheet(value as UploadOptions["sheet"])}
                />
                <RadioGroup
                    description="Insert data"
                    disabled={sheet !== "active"}
                    options={[
                        {
                            value: "selection",
                            label: "At selected cell"
                        },
                        {
                            value: "lastRow",
                            label: "At the end"
                        }
                    ]}
                    defaultValue={sheet !== "active" ? "lastRow" : startAt}
                    onChange={(value) => setStartAt(value as UploadOptions["startAt"])}
                />
            </Content>
        </OptionsContainer>
    );
};


const OptionsContainer = styled.div<{ isOpen: boolean; }>`
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    max-height: ${({ isOpen }) => (isOpen ? `calc(${HEADER_HEIGHT} + ${CONTENT_HEIGHT})` : HEADER_HEIGHT)};
    transition: max-height 0.2s ease-in-out;
    background-color: #ffffff;
    overflow: hidden;
`;

const Header = styled.div`
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    background-color: #f0f4f9;
    border-top-right-radius: 8px;
    border-top-left-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
`;

const Content = styled.div`
    padding: 16px;
    max-height: ${CONTENT_HEIGHT};
    overflow-y: auto;
    display: flex;
    flex-flow: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
`;
