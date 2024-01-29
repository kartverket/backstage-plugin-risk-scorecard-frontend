import React from 'react';
import { IconButton } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';

interface ButtonProps {
  onClick: () => void;
}

export const EditButton = ({ onClick }: ButtonProps) => {
  return (
    <IconButton aria-label="edit" onClick={onClick}>
      <EditIcon />
    </IconButton>
  );
};

export const DeleteButton = ({ onClick }: ButtonProps) => {
  return (
    <IconButton aria-label="delete" onClick={onClick}>
      <DeleteIcon />
    </IconButton>
  );
};
