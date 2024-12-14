import { FC, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Cross2Icon } from "@radix-ui/react-icons";
import { styled } from "styled-components";

import { Button } from "../Button/Button";
import { ToastProps, ToastType } from "./types";


export const Toast: FC<ToastProps> = ({
    type,
    title,
    content,
    onClose,
    buttonProps
}) => {
    const toastType = type ?? ToastType.Info;
    const target = document.querySelector("#root");
    const [domReady, setDomReady] = useState(false);

    useEffect(() => {
        setDomReady(true);
    }, []);

    const button = useMemo(() => {
        if (!buttonProps) {
            return null;
        }

        return <Button {...buttonProps} />;
    }, [buttonProps]);

    return domReady && createPortal(
        <Container type={toastType}>
            {onClose && <Close onClick={onClose}><Cross2Icon /></Close>}
            <ContentContainer>
                <Title type={toastType}>{title}</Title>
                <span>{content}</span>
            </ContentContainer>
            {button}
        </Container>,
        target!
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
    z-index: 100000;
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    align-items: flex-end;
`;

const ContentContainer = styled.div`
    font-size: 13px;
    overflow: auto;
    overflow-wrap: break-word;
`;

const Title = styled.div<{ type: ToastType; }>`
    font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
    font-size: 14px;
    font-weight: 700;
    line-height: 20px;
    margin-bottom: 8px;
    color: ${p => getColorPerType(p.type)};
`;

const Close = styled.div`
    width: 20px;
    height: 20px;
    position: absolute;
    top: 4px;
    right: 4px;
    cursor: pointer;
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
