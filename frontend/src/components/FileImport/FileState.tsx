import { FC } from "react";
import { CheckCircledIcon, Cross2Icon } from "@radix-ui/react-icons";
import { styled } from "styled-components";

import { Loader } from "../../framework/Loader/Loader";


type FileStateProps = {
    importing: boolean;
    imported: boolean;
    locked: boolean;
    onRemove: () => void;
};

export const FileState: FC<FileStateProps> = ({
    importing,
    imported,
    locked,
    onRemove
}) => {
    if (!importing && !imported) {
        return <FileRemove
            onClick={onRemove}
            disabled={locked}
        >
            <Cross2Icon />
        </FileRemove>;
    }

    if (importing) {
        return <FileStateIcon>
            <Loader />
        </FileStateIcon>;
    }

    if (imported) {
        return <FileStateIcon>
            <CheckCircledIcon color="#188038" />
        </FileStateIcon>;
    }

    return null;
};

const FileStateIcon = styled.div`
    width: 20px;
    height: 20px;
    display: flex;
    flex-flow: row;
    align-items: center;
    justify-content: center;
`;

const FileRemove = styled.button`
    width: 20px;
    height: 20px;
    display: flex;
    flex-flow: row;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border: 0;
    padding: 0;
    background: transparent;

    &:disabled {
        cursor: default;
        opacity: .35;
    }
`;
