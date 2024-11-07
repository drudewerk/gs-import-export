import { createGlobalStyle } from "styled-components";


export const GlobalStyles = createGlobalStyle`
    :root {
        font-synthesis: none;
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }

    * {
        box-sizing: border-box;
    }

    html, body, #root {
        width: 100%;
        height: 100%;
    }

    body {
        margin: 0;
        padding: 0;
        color: #000;
        font-weight: 400;
        font-size: 13px;
        font-family: Open Sans, Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
        display: flex;
        flex-flow: row nowrap;
        justify-content: center;
        align-items: flex-start;
    }

    #root {
        width: 320px;
        padding-top: 16px;
    }
`;
