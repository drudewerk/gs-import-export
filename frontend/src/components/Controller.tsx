import { FC, useEffect, useState } from "react";

import { Export } from "./Export/Export";
import { Import } from "./Import/Import";
import { Shimmers } from "./Shimmers";


export const Controller: FC = () => {
    const [state, setState] = useState<"none" | "import" | "export" | "error">("none");

    useEffect(() => {
        google.script.run
            .withSuccessHandler((state: "none" | "import" | "export") => {
                setState(state);
            })
            .withFailureHandler(() => {
                setState("error");
            })
            .getCurrentState();
    }, []);

    switch (state) {
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
