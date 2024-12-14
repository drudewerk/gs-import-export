import React, { Fragment } from "react";

import { Controller } from "./components/Controller";
import { ErrorOverlay } from "./components/ErrorOverlay/ErrorOverlay";
import { RateUs } from "./components/RateUs/RateUs";
import { GlobalStyles } from "./components/styles/GlobalStyles";


const App: React.FC = () => {
    return <Fragment>
        <GlobalStyles />
        <Controller />
        <ErrorOverlay />
        <RateUs />
    </Fragment>;
};

export default App;
