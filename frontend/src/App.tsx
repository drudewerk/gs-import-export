import React, { Fragment } from "react";
import { GlobalStyles } from "./components/styles/GlobalStyles";
import { Controller } from "./components/Controller";
import { DownloadFile } from "./components/DownloadFile/DownloadFile";


const App: React.FC = () => {

  return <Fragment>
    <GlobalStyles />
    <Controller />
    <DownloadFile />
  </Fragment>;
};

export default App;
