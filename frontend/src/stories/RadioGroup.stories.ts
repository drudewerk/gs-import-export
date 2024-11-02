import type { Meta, StoryObj } from "@storybook/react";
import { RadioGroup } from "../framework/RadioGroup/RadioGroup";


const meta = {
    title: "Example/RadioGroup",
    component: RadioGroup,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    args: {},
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        description: "Notify me at drudewerk@gmail.com when...",
        defaultValue: "3",
        options: [
            {
                value: "1",
                label: "Any changes are made",
            },
            {
                value: "2",
                label: "A user submits a form"
            },
            {
                value: "3",
                label: "Never",
            }
        ]
    },
};

export const Disabled: Story = {
    args: {
        disabled: true,
        description: "Notify me with...",
        options: [
            {
                value: "1",
                label: "Email - daily digest"
            },
            {
                value: "2",
                label: "Email - daily digest"
            }
        ]
    },
};
