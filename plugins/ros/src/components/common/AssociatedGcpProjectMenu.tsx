import {useAuthenticatedFetch} from "../../utils/hooks";
import Box from "@mui/material/Box";
import React, {useEffect, useState} from "react";
import Typography from "@mui/material/Typography";
import {useTranslationRef} from "@backstage/core-plugin-api/alpha";
import {pluginRiScTranslationRef} from "../../utils/translations";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import {Menu, SelectChangeEvent} from "@mui/material";


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

    const [chosenGcpProject, setChosenGcpProject] = useState()
    const [associatedGcpProjects, setAssociatedGcpProjects] = useState()

    const handleChangeGcpProject = (event: SelectChangeEvent) => {
        setChosenGcpProject(event.target.value as string);
    };

    useEffect(() => {
        fetchAssociatedGcpProjects()
            .then(res => {
                setAssociatedGcpProjects(res);
                setChosenGcpProject(res[0]);
                setIsLoading(false);
            })
            .catch(err => {
                throw err;
            });
    }, []);

    {associatedGcpProjects.map((item, _) => (
        <MenuItem value={item}>
            {gcpProjectIdToReadableString(item)}
        </MenuItem>
    ))}

    return (
        <Box
            sx={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}
        >
            <Typography>
                {`${t('associatedGcpProject.description')}:`}
            </Typography>
            <Button
                aria-controls={open ? 'demo-positioned-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
            >
                Dashboard
            </Button>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >
                {associatedGcpProjects.map((item, _) => (
                    <MenuItem value={item}>
                        {gcpProjectIdToReadableString(item)}
                    </MenuItem>
                ))}

                <MenuItem onClick={handleClose}>Profile</MenuItem>
                <MenuItem onClick={handleClose}>My account</MenuItem>
                <MenuItem onClick={handleClose}>Logout</MenuItem>
            </Menu>
        </Box>
    );
}