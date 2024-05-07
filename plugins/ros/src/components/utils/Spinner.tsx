import { CircularProgress } from '@material-ui/core';
import React from 'react';
import { useSpinnerStyles } from './style';

export const Spinner = ({ size }: { size?: string | number }) => {
  const { container, spinner } = useSpinnerStyles();

  return (
    <div className={container}>
      <CircularProgress className={spinner} size={size} />
    </div>
  );
};
