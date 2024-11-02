import * as CheckboxRadix from "@radix-ui/react-checkbox";
import styled, { css } from "styled-components";
import { CheckboxProps } from "./type";
import { CheckIcon } from "@radix-ui/react-icons";
import { useCallback, useState } from "react";


export const Checkbox: React.FC<CheckboxProps> = ({ label, checked, disabled, onChange }) => {
    const [checkedValue, setCheckedValue] = useState(checked);

    const onChangeInternal = useCallback((value: boolean) => {
        onChange?.(value);
        setCheckedValue(value);
    }, [onChange]);

    return <CheckboxContainer
        checked={checkedValue}
        disabled={disabled}
        onCheckedChange={onChangeInternal}
    >
        <CheckboxOuter $checked={checkedValue}>
            <CheckboxIndicator>
                <CheckIcon width={18} height={18} color={"#ffffff"} />
            </CheckboxIndicator>
        </CheckboxOuter>
        <Label>{label}</Label>
    </CheckboxContainer>;
};

const CheckboxContainer = styled(CheckboxRadix.Root)`
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: flex-start;
    gap: 8px;
    cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
    background: none;
    border: none;
    outline: none;
    border-radius: 4px;
    padding: 0;
`;

const CheckboxOuter = styled.div<{ $checked: boolean; }>`
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 2px;
    background-color: #ffffff;
    border: 2px solid #444746;
    width: 14px;
    height: 14px;
    ${p => p.$checked && css`
        border-color: #188038;
        background-color: #188038;
    `}
`;

const CheckboxIndicator = styled(CheckboxRadix.Indicator)`
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: center;
`;

const Label = styled.span`
    color: #3c4043;
    font-size: 14px;
    font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
`;
