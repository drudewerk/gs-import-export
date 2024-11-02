import { Cross2Icon, CheckCircledIcon } from "@radix-ui/react-icons";
import { FC } from "react";
import styled from "styled-components";
import { Loader } from "../../framework/Loader/Loader";


type FileStateProps = {
    importing: boolean;
    imported: boolean;
    onRemove: () => void;
};

export const FileState: FC<FileStateProps> = ({ importing, imported, onRemove }) => {
    if (!importing && !imported) {
        return <FileRemove
            onClick={onRemove}
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

const FileRemove = styled(FileStateIcon)`
    display: flex;
    flex-flow: row;
    align-items: center;
    justify-content: center;
    cursor: pointer;
`;
