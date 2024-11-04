import { ReactNode } from "react";


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
};
