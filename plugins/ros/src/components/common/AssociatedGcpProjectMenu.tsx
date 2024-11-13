import {useAuthenticatedFetch} from "../../utils/hooks";
import Box from "@mui/material/Box";
import React, {useEffect, useState} from "react";
import Typography from "@mui/material/Typography";
import {useTranslationRef} from "@backstage/core-plugin-api/alpha";
import {pluginRiScTranslationRef} from "../../utils/translations";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import {Menu, SelectChangeEvent, styled} from "@mui/material";
import {gcpProjectIdToReadableString} from "../../utils/utilityfunctions";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {EnhancedEncryptionOutlined} from "@material-ui/icons";
import EditButton from "./EditButton";


export const AssociatedGcpProjectMenu = () => {
    const {t} = useTranslationRef(pluginRiScTranslationRef)
    const {
        fetchAssociatedGcpProjects
    } = useAuthenticatedFetch()

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const [associatedGcpProjects, setAssociatedGcpProjects] = useState<string[]>(
        [],
    );
    const [chosenGcpProject, setChosenGcpProject] = useState<string>('');

    const handleChangeGcpProject = (item: string) => {
        setChosenGcpProject(item);
        handleClose()
    };

    useEffect(() => {
        fetchAssociatedGcpProjects()
            .then(res => {
                setAssociatedGcpProjects(res);
                setChosenGcpProject(res[0]);
            })
            .catch(err => {
                throw err;
            });
    }, []);

    const ButtonStyledDiv = styled('div')(({ theme }) => ({
        ...theme.typography.button,
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(1),
    }));

    return (
        <ButtonStyledDiv
            sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 1,
            }}
        >
                {`${t('associatedGcpProject.description')}: ${gcpProjectIdToReadableString(chosenGcpProject)}`}
            <EditButton />
        </ButtonStyledDiv>
    );
}

// <Menu
//     anchorEl={anchorEl}
//     open={open}
//     onClose={handleClose}
//     anchorOrigin={{
//         vertical: 'top',
//         horizontal: 'left',
//     }}
//     transformOrigin={{
//         vertical: 'top',
//         horizontal: 'left',
//     }}
// >
//     {associatedGcpProjects.map((item, _) => (
//         <MenuItem
//             value={item}
//             onClick={() => handleChangeGcpProject(item)}
//         >
//             {gcpProjectIdToReadableString(item)}
//         </MenuItem>
//     ))}
// </Menu>