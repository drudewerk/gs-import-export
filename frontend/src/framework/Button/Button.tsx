import { FC } from "react";
import { css, styled } from "styled-components";

import { ButtonProps, ButtonType } from "./types";


export const Button: FC<ButtonProps> = ({
    type,
    onClick,
    disabled,
    className,
    children
}) => {
    return <GsButton
        type={type ?? ButtonType.primary}
        disabled={disabled}
        onClick={onClick}
        className={className}
    >
        {children}
    </GsButton>;
};

const GsButton = styled.button<Pick<ButtonProps, "type" | "disabled">>`
    cursor: pointer;
    outline: 0;
    box-shadow: none;
    box-sizing: border-box;
    min-width: 72px;
    border-width: 1px;
    border-style: solid;
    border-radius: 4px;
    font-family: Open Sans, Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
    font-weight: 500;
    font-size: 14px;
    height: 36px;
    letter-spacing: .25px;
    line-height: 16px;
    padding: 9px 24px 11px;

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
