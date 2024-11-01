import React, { Fragment } from "react";
import { GlobalStyles } from "./components/styles/GlobalStyles";
import { Upload } from "./components/Upload";


const App: React.FC = () => {

  return <Fragment>
    <GlobalStyles />
    <Upload />
  </Fragment>;
};

export default App;
