export type Theme = {
    theme: "light";
    colors: {
        background: {
            accent: string;
            primary: string;
            secondary: string;
            background: string;
            surface: string;
            error: string;
            disabled: string;
        };
        foreground: {
            primary: string;
            secondary: string;
            error: string;
            onPrimary: string;
            onSecondary: string;
            onSurface: string;
            onDisabled: string;
        };
        border: {
            default: string;
            hover: string;
            active: string;
            error: string;
        };
    };
    borderRadius: {
        small: string;
        medium: string;
        large: string;
    };
};
