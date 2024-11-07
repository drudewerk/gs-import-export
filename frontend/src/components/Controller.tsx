import { FC, useEffect, useState } from "react";

import { Export } from "./Export/Export";
import { Import } from "./Import/Import";
import { Shimmers } from "./Shimmers";


export const Controller: FC = () => {
    const [state, setState] = useState<CurrentState | null>(null);

    useEffect(() => {
        google.script.run
            .withSuccessHandler((state: CurrentState) => {
                setState(state);
            })
            .withFailureHandler(() => {
                setState({
                    state: "error"
                });
            })
            .getCurrentState();
    }, []);

    switch (state?.state) {
        case "import":
            return <Import />;
        case "export":
            return <Export />;
        case "error":
            return <p>Error. Please try again</p>;
        default:
            return <Shimmers />;
    }
};
