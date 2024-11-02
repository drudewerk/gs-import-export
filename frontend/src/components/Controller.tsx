import { FC, useEffect, useState } from "react";
import { Import } from "./Import/Import";
import { Export } from "./Export/Export";


export const Controller: FC = () => {
    const [state, setState] = useState("none");

    useEffect(() => {
        google.script.run.withSuccessHandler((state: string) => {
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
            return <p>Loading...</p>;
    }
};
