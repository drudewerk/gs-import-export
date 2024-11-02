import { FC, useState } from "react";
import styled from "styled-components";
import { ChevronUpIcon, ChevronDownIcon } from "@radix-ui/react-icons";


const HEADER_HEIGHT = "32px";
const CONTENT_HEIGHT = "200px";

export const Options: FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    const togglePanel = () => {
        setIsOpen((prev) => !prev);
    };

    return (
        <OptionsContainer isOpen={isOpen}>
            <Header onClick={togglePanel}>
                <span>Options</span>
                {isOpen ? <ChevronDownIcon /> : <ChevronUpIcon />}
            </Header>
            <Content>
                <p>This is the content inside the panel. You can put anything you want here.</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            </Content>
        </OptionsContainer>
    );
};


const OptionsContainer = styled.div<{ isOpen: boolean; }>`
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    max-height: ${({ isOpen }) => (isOpen ? `calc(${HEADER_HEIGHT} + ${CONTENT_HEIGHT})` : HEADER_HEIGHT)};
    transition: max-height 0.2s ease-in-out;
    background-color: #ffffff;
    overflow: hidden;
`;

const Header = styled.div`
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    background-color: #f0f4f9;
    border-top-right-radius: 8px;
    border-top-left-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
`;

const Content = styled.div`
    padding: 16px;
    max-height: ${CONTENT_HEIGHT};
    overflow-y: auto;
`;
