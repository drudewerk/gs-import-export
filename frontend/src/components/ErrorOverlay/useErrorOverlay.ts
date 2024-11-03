import { useAtom } from "jotai";

import { errorAtom } from "../../state/app";


export const useErrorOverlay = () => {
    const [error, setError] = useAtom(errorAtom);

    const set = (error: string, description: string) => {
        console.log("error set", {
            error,
            description
        });
        setError({
            error,
            errorDescription: description ?? "Something went wrong. Try again or contact support."
        });
    };

    const reset = () => {
        setError(undefined);
    };

    return {
        error,
        setError: set,
        resetError: reset
    };
};
