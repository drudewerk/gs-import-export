import { FC } from "react";
import { createPortal } from "react-dom";
import { styled } from "styled-components";

import { ToastProps, ToastType } from "./types";


export const Toast: FC<ToastProps> = ({
    type,
    title,
    content
}) => {
    const toastType = type ?? ToastType.Info;
    const target = document.querySelector("#root");

    if (!target) {
        return null;
    }

    return createPortal(
        <Container type={toastType}>
            <Title type={toastType}>{title}</Title>
            <span>{content}</span>
        </Container>,
        target
    );
};

const Container = styled.div<{ type: ToastType; }>`
    position: absolute;
    max-height: 100px;
    padding: 12px;
    bottom: 16px;
    left: 16px;
    right: 16px;
    border-left: 4px solid ${p => getColorPerType(p.type)};
    background-color: #ffffff;
    box-shadow: 0 4px 8px 3px rgba(60,64,67,.15);
    border-radius: 4px;
    font-size: 13px;
    overflow: scroll;
    overflow-wrap: break-word;
    z-index: 100000;
`;

const Title = styled.div<{ type: ToastType; }>`
    font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
    font-size: 14px;
    font-weight: 700;
    line-height: 20px;
    margin-bottom: 8px;
    color: ${p => getColorPerType(p.type)};
`;

const getColorPerType = (type: ToastType) => {
    switch (type) {
        case ToastType.Success:
            return "#137333";
        case ToastType.Info:
            return "#0b57d0";
        case ToastType.Warn:
            return "#F6AD01";
        case ToastType.Error:
            return "#d93025";
    }
};
