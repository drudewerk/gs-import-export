import { MouseEventHandler, PropsWithChildren } from "react";


export enum ButtonType {
    primary = "primary",
    secondary = "secondary"
}

export enum ButtonSize {
    medium = "medium",
    small = "small"
}

export type ButtonProps = PropsWithChildren<{
    type?: ButtonType;
    size?: ButtonSize;
    disabled?: boolean;
    onClick?: MouseEventHandler<HTMLButtonElement>;
    className?: string;
}>;
