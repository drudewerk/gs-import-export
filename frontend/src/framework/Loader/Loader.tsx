import { keyframes, styled } from "styled-components";


const ANIMATION_DURATION = "800ms";

export const Loader: React.FC = () => {
    return (
        <Spinner>
            <SpinnerLeaf />
            <SpinnerLeaf />
            <SpinnerLeaf />
            <SpinnerLeaf />
            <SpinnerLeaf />
            <SpinnerLeaf />
            <SpinnerLeaf />
            <SpinnerLeaf />
        </Spinner>
    );
};

const Spinner = styled.span`
    display: inline-block;
    position: relative;
    opacity: 0.65;
    width: 16px;
    height: 16px;
`;

const leafKf = keyframes`
    from {
        opacity: 1;
    }
    to {
        opacity: 0.25;
    }
`;

const SpinnerLeaf = styled.span`
    position: absolute;
    top: 0;
    left: calc(50% - 12.5% / 2);
    width: 12.5%;
    height: 100%;
    animation: ${leafKf} ${ANIMATION_DURATION} linear infinite;

    &::before {
        content: '';
        display: block;
        width: 100%;
        height: 30%;
        border-radius: 3px;
        background-color: currentColor;
    }

    &:where(:nth-child(1)) {
        transform: rotate(0deg);
        animation-delay: calc(-8 / 8 * ${ANIMATION_DURATION});
    }
    &:where(:nth-child(2)) {
        transform: rotate(45deg);
        animation-delay: calc(-7 / 8 * ${ANIMATION_DURATION});
    }
    &:where(:nth-child(3)) {
        transform: rotate(90deg);
        animation-delay: calc(-6 / 8 * ${ANIMATION_DURATION});
    }
    &:where(:nth-child(4)) {
        transform: rotate(135deg);
        animation-delay: calc(-5 / 8 * ${ANIMATION_DURATION});
    }
    &:where(:nth-child(5)) {
        transform: rotate(180deg);
        animation-delay: calc(-4 / 8 * ${ANIMATION_DURATION});
    }
    &:where(:nth-child(6)) {
        transform: rotate(225deg);
        animation-delay: calc(-3 / 8 * ${ANIMATION_DURATION});
    }
    &:where(:nth-child(7)) {
        transform: rotate(270deg);
        animation-delay: calc(-2 / 8 * ${ANIMATION_DURATION});
    }
    &:where(:nth-child(8)) {
        transform: rotate(315deg);
        animation-delay: calc(-1 / 8 * ${ANIMATION_DURATION});
    }
`;
