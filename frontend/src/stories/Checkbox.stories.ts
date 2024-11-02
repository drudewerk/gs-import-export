import type { Meta, StoryObj } from "@storybook/react";

import { Checkbox } from "../framework/Checkbox/Checkbox";


const meta = {
    title: "Example/Checkbox",
    component: Checkbox,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    args: {},
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        checked: true,
        label: "Viewers and commenters can see the option to download, print, and copy"
    },
};

export const Unchecked: Story = {
    args: {
        checked: false,
        label: "Editors can change permissions and share"
    },
};

export const Disabled: Story = {
    args: {
        checked: false,
        disabled: true,
        label: "Disabled checkbox"
    },
};
