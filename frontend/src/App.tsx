import React from "react";
import { Greet } from "./components/Greet";
import { ThemeProvider } from "styled-components";
import { lightTheme } from "./framework/theme/lightTheme";
import { GlobalStyles } from "./components/styles/GlobalStyles";




const App: React.FC = () => {
    return <ThemeProvider theme={lightTheme}>
        <GlobalStyles />
        <Greet />
    </ThemeProvider>;
};

export default App;
