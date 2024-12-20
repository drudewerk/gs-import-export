import { FC } from "react";
import { css, styled } from "styled-components";

import { ButtonProps, ButtonSize, ButtonType } from "./types";


export const Button: FC<ButtonProps> = ({
    type,
    size,
    onClick,
    disabled,
    className,
    children
}) => {
    return <GsButton
        type={type ?? ButtonType.primary}
        size={size ?? ButtonSize.medium}
        disabled={disabled}
        onClick={onClick}
        className={className}
    >
        {children}
    </GsButton>;
};

const GsButton = styled.button<Pick<ButtonProps, "type" | "disabled" | "size">>`
    cursor: pointer;
    outline: 0;
    box-shadow: none;
    box-sizing: border-box;
    border-width: 1px;
    border-style: solid;
    border-radius: 4px;
    font-family: Open Sans, Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
    font-weight: 500;
    letter-spacing: .25px;
    white-space: nowrap;

    ${p => p.type === ButtonType.primary && css`
        background-color: #188038;
        color: #ffffff;
        border-color: transparent;

        &:hover {
            background-color: #2a8947;
            border-color: #c8e7d1;
            box-shadow: 0 1px 3px 1px rgba(52, 168, 83, .15);
        }

        &:active {
            background-color: #62a877;
            border-color: transparent;
            box-shadow: 0 2px 6px 2px rgba(52, 168, 83, .15);
        }

        &:focus {
            background-color: #4f9e67;
            border-color: #bbe2c6;
            box-shadow: 0 1px 3px 1px rgba(52, 168, 83, .15);
        }
    `}

    ${p => p.type === ButtonType.secondary && css`
        background-color: #ffffff;
        color: #137333;
        border-color: #dadce0;

        &:hover {
            background-color: #f8fcf9;
            border-color: #c8e7d1;
        }

        &:active {
            background-color: #dff2e4;
            border-color: transparent;
            box-shadow: 0 2px 6px 2px rgba(60, 64, 67, .15);
        }

        &:focus {
            background-color: #e7f5eb;
            border-color: #bbe2c6;
        }
    `}

    ${p => p.size === ButtonSize.medium && css`
        font-size: 14px;
        height: 36px;
        line-height: 16px;
        padding: 9px 24px 11px;
        min-width: 72px;
    `} 

    ${p => p.size === ButtonSize.small && css`
        font-size: 12px;
        height: 24px;
        line-height: 12px;
        padding: 5px 8px;
        min-width: 50px;
    `} 

    ${p => p.disabled && css`
        opacity: .62;
        background-color: #f8f9fa;
        color: #202124;
        border-color: #f1f3f4;
        cursor: default;

        &:hover, &:active, &:focus {
            box-shadow: 0 2px 6px 2px rgba(60, 64, 67, .15);
            background-color: #f8f9fa;
            color: #202124;
            border-color: #f1f3f4;
        }
    `}
`;
