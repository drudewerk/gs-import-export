import type { Meta, StoryObj } from "@storybook/react";

import { Toast } from "../framework/Toast/Toast";
import { ToastType } from "../framework/Toast/types";
import { Fragment } from "react/jsx-runtime";


const meta = {
    title: "Example/Toast",
    component: Toast,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    args: {},
    decorators: [
        (Story) => {
            return (
                <Fragment>
                    <div id={"root"} style={{ width: "300px", height: "100px" }} />
                    <Story />
                </Fragment>
            );
        },
    ],
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Error: Story = {
    args: {
        type: ToastType.Error,
        title: "Error",
        content: "Toast with error information"
    },
};
