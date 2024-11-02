import * as RadioGroupRadix from "@radix-ui/react-radio-group";
import styled from "styled-components";
import React, { useCallback, useLayoutEffect, useState } from "react";
import { RadioGroupProps, RadioOptionProps } from "./types";


const RadioOption: React.FC<RadioOptionProps> = ({ value, label, disabled }) => (
    <RadioItem value={value} disabled={disabled}>
        <IndicatorWrapper>
            <Indicator />
        </IndicatorWrapper>
        <Label>{label}</Label>
    </RadioItem>
);

export const RadioGroup: React.FC<RadioGroupProps> = ({
    description,
    options,
    defaultValue,
    disabled,
    onChange
}) => {
    const [checkedValue, setCheckedValue] = useState(defaultValue);

    useLayoutEffect(() => {
        setCheckedValue(defaultValue);
    }, [defaultValue]);

    const onChangeInternal = useCallback((value: string) => {
        onChange?.(value);
        setCheckedValue(value);
    }, [onChange]);

    return (
        <RadioGroupContainer
            disabled={disabled}
            onValueChange={onChangeInternal}
            value={checkedValue}
        >
            <Description>{description}</Description>
            {options.map((option) => (
                <RadioOption
                    key={option.value}
                    value={option.value}
                    label={option.label}
                    disabled={disabled}
                />
            ))}
        </RadioGroupContainer>
    );
};

const RadioGroupContainer = styled(RadioGroupRadix.Root) <{ disabled?: boolean; }>`
    display: flex;
    flex-direction: column;
    opacity: ${({ disabled }) => (disabled ? 0.7 : 1)};
    pointer-events: ${({ disabled }) => (disabled ? "not-allowed" : "auto")};
    gap: 5px;
`;

const RadioItem = styled(RadioGroupRadix.Item) <{ disabled?: boolean; }>`
    display: flex;
    align-items: center;
    gap: 7px;
    cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
    padding: 5px 0;
    border-radius: 4px;
    border: none;
    outline: none;
    background: none;
`;

const IndicatorWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border: 1px solid #c6c6c6;
    border-radius: 50%;
    background-color: #ffffff;

    ${RadioItem}:hover & {
        box-shadow: inset 0 1px 1px rgba(0, 0, 0, .1);
        border-color: #b6b6b6;
    }

    ${RadioItem}[data-state="checked"] & {
        border-color: #188038;
    }
`;

const Indicator = styled(RadioGroupRadix.Indicator)`
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #188038;
`;

const Description = styled.div`
    font-size: 14px;
    font-weight: 500;
    color: #3c4043;
    font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
`;

const Label = styled.span`
    color: #3c4043;
    font-size: 14px;
    font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
`;
