import { FC, useEffect, useState } from "react";
import { Import } from "./Import/Import";
import { Export } from "./Export/Export";


export const Controller: FC = () => {
    const [state, setState] = useState("none");

    useEffect(() => {
        google.script.run.withSuccessHandler((state: string) => {
            setState(state);
        }).getCurrentState();
    }, []);

    if (state == "import") {
        return <Import />;

    }
    if (state == "export") {
        return <Export />;

    }

    return <p>Loading...</p>;
};