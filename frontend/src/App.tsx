import React, { Fragment } from "react";
import { GlobalStyles } from "./components/styles/GlobalStyles";
import { FileUpload } from "./components/FileUpload/FileUpload";


const App: React.FC = () => {
    return <Fragment>
        <GlobalStyles />
        <FileUpload />
    </Fragment>;
};

export default App;
