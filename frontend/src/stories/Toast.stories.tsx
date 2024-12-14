import { Fragment } from "react/jsx-runtime";
import type { Meta, StoryObj } from "@storybook/react";

import { ButtonSize, ButtonType } from "../framework/Button/types";
import { Toast } from "../framework/Toast/Toast";
import { ToastType } from "../framework/Toast/types";


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
                    <div id={"root"} style={{ width: "300px", height: "100px" }}>
                        <Story />
                    </div>
                </Fragment>
            );
        },
    ],
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Error: Story = {
    args: {
        type: ToastType.Success,
        title: "Was the Add-On Helpful?",
        content: "Your feedback helps us improve.",
        buttonProps: {
            type: ButtonType.primary,
            children: <span>Rate Us</span>,
            size: ButtonSize.small,
            onClick: () => alert("Rate Us")
        }
    },
};
