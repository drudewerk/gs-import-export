export type RadioOptionProps = {
    value: string;
    label: string;
    disabled?: boolean;
};

export type RadioGroupProps = {
    description: string;
    options: RadioOptionProps[];
    disabled?: boolean;
    onChange?: (value: string) => void;
};
