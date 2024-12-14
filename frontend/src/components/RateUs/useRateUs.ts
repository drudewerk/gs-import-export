import { useCallback } from "react";
import { useSetAtom } from "jotai";

import { rateUsShowAtom } from "../../state/app";


export const useRateUs = () => {
    const setShow = useSetAtom(rateUsShowAtom);

    const promptRateUs = useCallback(() => {
        google.script.run
            .withSuccessHandler((state: RateUsState) => {
                switch (state) {
                    case "shown":
                    case "dismissed":
                    case "rate_clicked": {
                        setShow(false);
                        break;
                    }

                    case "not_shown": {
                        setShow(true);
                        break;
                    }
                }
            })
            .withFailureHandler((error) => {
                console.error(error);
            })
            .getRateUsState();
    }, [setShow]);

    return {
        promptRateUs
    };
};
