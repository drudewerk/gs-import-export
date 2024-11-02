import type { Meta, StoryObj } from "@storybook/react";

import { Loader } from "../framework/Loader/Loader";


const meta = {
    title: "Example/Loader",
    component: Loader,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    args: {},
} satisfies Meta<typeof Loader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
    },
};
