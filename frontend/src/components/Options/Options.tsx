import { FC } from "react";
import { styled } from "styled-components";

import { Checkbox } from "../../framework/Checkbox/Checkbox";
import { RadioGroup } from "../../framework/RadioGroup/RadioGroup";
import { useOptions } from "./useOptions";


export const Options: FC = () => {
    const {
        sheet,
        setSheet,
        startAt,
        setStartAt,
        mergeFiles,
        setMergeFiles
    } = useOptions();

    return (
        <OptionsContainer>
            <Header>
                <span>Options</span>
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


const OptionsContainer = styled.div`
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
    overflow-y: auto;
    display: flex;
    flex-flow: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
`;
