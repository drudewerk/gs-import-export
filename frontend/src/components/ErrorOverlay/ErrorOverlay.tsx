import { FC } from "react";

import { Toast } from "../../framework/Toast/Toast";
import { ToastType } from "../../framework/Toast/types";
import { useErrorOverlay } from "./useErrorOverlay";


export const ErrorOverlay: FC = () => {
    const {
        error
    } = useErrorOverlay();

    if (!error) {
        return;
    }

    return <Toast
        type={ToastType.Error}
        title={error.error}
        content={error.errorDescription}
    />;
};
