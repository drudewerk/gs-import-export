import { FC, useEffect, useState } from "react";

import { Export } from "./Export/Export";
import { Import } from "./Import/Import";
import { useOptions } from "./Options/useOptions";
import { Shimmers } from "./Shimmers";


export const Controller: FC = () => {
    const [state, setState] = useState<CurrentState | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const {
        setOptions
    } = useOptions();

    useEffect(() => {
        google.script.run
            .withSuccessHandler((state: CurrentState) => {
                setState(state);
                setOptions(state.options);
            })
            .withFailureHandler((error: { message?: unknown; }) => {
                setErrorMessage(
                    typeof error?.message === "string"
                        ? error.message
                        : "The add-on could not load its initial state."
                );
                setState({
                    state: "error"
                });
            })
            .getCurrentState();
    }, [setOptions]);

    switch (state?.state) {
        case "import":
            return <Import />;
        case "export":
            return <Export />;
        case "error":
            return <p>{errorMessage}</p>;
        default:
            return <Shimmers />;
    }
};
