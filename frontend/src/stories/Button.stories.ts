import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import { Button } from "../framework/Button/Button";
import { ButtonType } from "../framework/Button/types";


const meta = {
    title: "Example/Button",
    component: Button,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    args: { onClick: fn() },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
    args: {
        type: ButtonType.primary,
        children: "Save"
    },
};

export const Secondary: Story = {
    args: {
        type: ButtonType.secondary,
        children: "Cancel",
    },
};

export const Disabled: Story = {
    args: {
        disabled: true,
        children: "Disabled"
    },
};
