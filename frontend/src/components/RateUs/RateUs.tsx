import { FC, useCallback, useEffect } from "react";
import { useAtom } from "jotai";

import { ButtonSize, ButtonType } from "../../framework/Button/types";
import { Toast } from "../../framework/Toast/Toast";
import { ToastType } from "../../framework/Toast/types";
import { rateUsShowAtom } from "../../state/app";


export const RateUs: FC = () => {
    const [show, setShow] = useAtom(rateUsShowAtom);

    const setState = useCallback((state: RateUsState) => {
        google.script.run
            .withFailureHandler((error) => {
                console.error(error);
            })
            .setRateUsState(state);
    }, []);

    const dismiss = useCallback((state: RateUsState) => {
        setShow(false);
        setState(state);
    }, [setShow, setState]);

    // GM: Press Shift + Option + R to reset the state of Rate Us for testing
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.shiftKey && event.altKey && event.code === "KeyR") {
                event.preventDefault();
                setState("not_shown");
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [setState]);

    if (!show) {
        return null;
    }

    return <Toast
        type={ToastType.Success}
        title="Was the Add-On Helpful?"
        content="Your feedback helps us improve."
        buttonProps={{
            type: ButtonType.primary,
            children: "Rate Us",
            size: ButtonSize.small,
            onClick: () => {
                window.open(
                    "https://workspace.google.com/marketplace/app/json_import_export_by_drudewerk/490215435353",
                    "_blank"
                );
                dismiss("rate_clicked");
            }
        }}
        onClose={() => dismiss("dismissed")}
    />;
};
