import styled from "styled-components";

export interface ButtonProps {
    /** Is this the principal call to action on the page? */
    primary?: boolean;
    /** What background color to use */
    backgroundColor?: string;
    /** How large should the button be? */
    size?: "small" | "medium" | "large";
    /** Button contents */
    label: string;
    /** Optional click handler */
    onClick?: () => void;
}

/** Primary UI component for user interaction */
export const Button = ({
    primary = false,
    size = "medium",
    backgroundColor,
    label,
    ...props
}: ButtonProps) => {
    const mode = primary ? "primary" : "secondary";
    return (
        <StorybookButton
            type="button"
            className={[`${size}`, mode].join(" ")}
            style={{ backgroundColor }}
            {...props}
        >
            {label}
        </StorybookButton>
    );
};

const StorybookButton = styled.button`
    display: inline-block;
    cursor: pointer;
    border: 0;
    border-radius: 3em;
    font-weight: 700;
    line-height: 1;
    font-family: 'Nunito Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;

    &.primary {
        background-color: #1ea7fd;
        color: white;
    }

    &.secondary {
        box-shadow: rgba(0, 0, 0, 0.15) 0px 0px 0px 1px inset;
        background-color: transparent;
        color: #333;
    }

    &.small {
        padding: 10px 16px;
        font-size: 12px;
    }

    &.medium {
        padding: 11px 20px;
        font-size: 14px;
    }

    &.large {
        padding: 12px 24px;
        font-size: 16px;
    }
`;
