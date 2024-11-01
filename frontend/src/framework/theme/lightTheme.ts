import { Theme } from "./Theme";

export const lightTheme: Theme = {
    theme: "light",
    colors: {
        background: {
            primary: "#188038",
            secondary: "#ffffff",
            background: "#ffffff",
            surface: "#f0f4f9",
            error: "",
            accent: "#0b57d0",
            disabled: "#f8f9fa"
        },
        foreground: {
            primary: "#202124",
            secondary: "#5f6368",
            error: "#d93025",
            onPrimary: "#ffffff",
            onSecondary: "#137333",
            onSurface: "#333333",
            onDisabled: "#202124"
        },
        border: {
            default: "#dadce0",
            hover: "#747775",
            active: "#0b57d0",
            error: "#d93025"
        }
    },
    borderRadius: {
        small: "4px",
        medium: "8px",
        large: "12px"
    }
};
