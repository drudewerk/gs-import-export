import { FC, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";
import { styled } from "styled-components";

import { Checkbox } from "../../framework/Checkbox/Checkbox";
import { RadioGroup } from "../../framework/RadioGroup/RadioGroup";
import { useOptions } from "./useOptions";


const HEADER_HEIGHT = "32px";
const CONTENT_HEIGHT = "250px";

export const Options: FC = () => {
    const [isOpen, setIsOpen] = useState(true);
    const {
        sheet,
        setSheet,
        startAt,
        setStartAt,
        mergeFiles,
        setMergeFiles
    } = useOptions();

    const togglePanel = () => {
        setIsOpen((prev) => !prev);
    };

    return (
        <OptionsContainer $isOpen={isOpen}>
            <Header onClick={togglePanel}>
                <span>Options</span>
                {isOpen ? <ChevronDownIcon /> : <ChevronUpIcon />}
            </Header>
            <Content>
                <Checkbox
                    label="Merge data from all files together"
                    checked={mergeFiles ?? false}
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
                            value: "new",
                            label: "New sheet"
                        }
                    ]}
                    defaultValue={sheet}
                    onChange={(value) => setSheet(value as UploadOptions["sheet"])}
                />
                {
                    sheet === "active" && <RadioGroup
                        description="Insert data"
                        options={[
                            {
                                value: "selection",
                                label: "At selected cell"
                            },
                            {
                                value: "end",
                                label: "At the end"
                            }
                        ]}
                        defaultValue={startAt}
                        onChange={(value) => setStartAt(value as UploadOptions["startAt"])}
                    />
                }
            </Content>
        </OptionsContainer>
    );
};


const OptionsContainer = styled.div<{ $isOpen: boolean; }>`
    max-height: ${({ $isOpen }) => ($isOpen ? `calc(${HEADER_HEIGHT} + ${CONTENT_HEIGHT})` : HEADER_HEIGHT)};
    transition: max-height 0.2s ease-in-out;
    background-color: #ffffff;
    flex-shrink: 0;
    width: 100%;
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
    width: 100%;
    padding: 16px;
    max-height: ${CONTENT_HEIGHT};
    overflow-y: auto;
    display: flex;
    flex-flow: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
`;
