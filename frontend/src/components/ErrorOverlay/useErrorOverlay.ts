import { useCallback } from "react";
import { useAtom } from "jotai";

import { errorAtom } from "../../state/app";


export const useErrorOverlay = () => {
    const [error, setError] = useAtom(errorAtom);

    const set = useCallback((error: string, description: string) => {
        setError({
            error,
            errorDescription: description ?? "Something went wrong. Try again or contact support."
        });
    }, [setError]);

    const reset = useCallback(() => {
        setError(undefined);
    }, [setError]);

    return {
        error,
        setError: set,
        resetError: reset
    };
};
