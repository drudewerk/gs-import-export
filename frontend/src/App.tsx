import React, { Fragment } from "react";
import { GlobalStyles } from "./components/styles/GlobalStyles";
import { Controller } from "./components/Controller";
import { ErrorOverlay } from "./components/ErrorOverlay/ErrorOverlay";


const App: React.FC = () => {
    return <Fragment>
        <GlobalStyles />
        <Controller />
        <ErrorOverlay />
    </Fragment>;
};

export default App;
