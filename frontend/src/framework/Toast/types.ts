import { ReactNode } from "react";

import { ButtonProps } from "../Button/types";


export enum ToastType {
    Info,
    Warn,
    Error,
    Success
}

export type ToastProps = {
    title: string;
    content: ReactNode | string;
    type?: ToastType;
    onClose?: () => void;
    buttonProps?: ButtonProps;
};
