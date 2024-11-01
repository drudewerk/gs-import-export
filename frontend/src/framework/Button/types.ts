import { MouseEventHandler, PropsWithChildren } from "react";


export enum ButtonType {
    primary = "primary",
    secondary = "secondary"
}

export type ButtonProps = PropsWithChildren<{
    type?: ButtonType;
    disabled?: boolean;
    onClick?: MouseEventHandler<HTMLButtonElement>;
    className?: string;
}>;
