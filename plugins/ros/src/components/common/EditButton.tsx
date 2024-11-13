import React from 'react';
import {
  IconButton,
  IconButtonProps,
  makeStyles,
  Theme,
} from '@material-ui/core';
import EditIcon from '@mui/icons-material/Edit';

const useEditButtonStyle = makeStyles((theme: Theme) => ({
  icon: {
    color: theme.palette.type === 'dark' ? '#fff' : 'rgba(0, 0, 0, 0.54)',
  },
}));

const EditButton = (props: IconButtonProps) => {
  const { icon } = useEditButtonStyle();

  return (
    <IconButton size="small" {...props}>
      <EditIcon className={icon} aria-label="Edit" />
    </IconButton>
  );
};

export default EditButton;
