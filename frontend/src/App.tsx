import React, { Fragment } from "react";

import { Controller } from "./components/Controller";
import { ErrorOverlay } from "./components/ErrorOverlay/ErrorOverlay";
import { GlobalStyles } from "./components/styles/GlobalStyles";


const App: React.FC = () => {
    return <Fragment>
        <GlobalStyles />
        <Controller />
        <ErrorOverlay />
    </Fragment>;
};

export default App;
