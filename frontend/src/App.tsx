import React, { Fragment } from "react";
import { Greet } from "./components/Greet";
import { GlobalStyles } from "./components/styles/GlobalStyles";


const App: React.FC = () => {
    return <Fragment>
        <GlobalStyles />
        <Greet />
    </Fragment>;
};

export default App;
