import {
    ShimmerButton,
    ShimmerTitle
} from "react-shimmer-effects";
import styled from "styled-components";

export const Shimmers = () => {
    return (
        <ShimmersContainer>
            <ShimmerTitle line={3} variant="secondary" />
            <ShimmerButton size="md" />
        </ShimmersContainer>
    );
};

const ShimmersContainer = styled.div`
    padding: 0 16px;
`;
