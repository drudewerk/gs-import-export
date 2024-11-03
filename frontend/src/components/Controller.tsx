import { FC, useEffect, useState } from "react";
import { Import } from "./Import/Import";
import { Export } from "./Export/Export";
import { Shimmers } from "./Shimmers";


export const Controller: FC = () => {
    const [state, setState] = useState<"none" | "import" | "export">("none");

    useEffect(() => {
        google.script.run.withSuccessHandler((state: "none" | "import" | "export") => {
            setState(state);
        }).getCurrentState();
    }, []);

    if (state == "import") {
        return <Import />;

    }
    if (state == "export") {
        return <Export />;
    }

    return <Shimmers />;
};
