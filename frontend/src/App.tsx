import React, { Fragment } from "react";
import { GlobalStyles } from "./components/styles/GlobalStyles";
import { Controller } from "./components/Controller";


const App: React.FC = () => {
    return <Fragment>
        <GlobalStyles />
        <Controller />
    </Fragment>;
};

export default App;
