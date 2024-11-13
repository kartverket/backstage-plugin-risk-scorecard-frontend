import Dialog from "@mui/material/Dialog";
import React, {useEffect, useState} from "react";
import DialogTitle from "@mui/material/DialogTitle";
import {useTranslationRef} from "@backstage/core-plugin-api/alpha";
import {pluginRiScTranslationRef} from "../../utils/translations";
import FormLabel from "@mui/material/FormLabel";
import FormHelperText from "@mui/material/FormHelperText";
import LinearProgress from "@mui/material/LinearProgress";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import {gcpProjectIdToReadableString} from "../../utils/utilityfunctions";
import {useAuthenticatedFetch} from "../../utils/hooks";

export const NewSopsConfigDialog = () => {
    const { t } = useTranslationRef(pluginRiScTranslationRef);

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

    return (
        <Dialog open={true}>
            <DialogTitle>{t('newSopsConfigDialog.title')}</DialogTitle>
            <FormLabel>{t('newSopsConfigDialog.description')}</FormLabel>
            <Select
                value={chosenGcpProject}
                required
                {...register('gcpProjectId', {
                    required: true,
                    onChange: handleChangeGcpProject,
                })}
                error={errors.gcpProjectId !== undefined}
            >
                {associatedGcpProjects.map((item, _) => (
                    <MenuItem value={item}>
                        {gcpProjectIdToReadableString(item)}
                    </MenuItem>
                ))}
            </Select>
        </Dialog>
    );
}