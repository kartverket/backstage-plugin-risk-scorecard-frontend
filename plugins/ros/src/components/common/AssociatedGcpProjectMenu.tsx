import React from 'react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { styled } from '@mui/material';
import { gcpProjectIdToReadableString } from '../../utils/utilityfunctions';
import EditButton from './EditButton';

export const AssociatedGcpProjectMenu = () => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
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
      {`${t(
        'associatedGcpProject.description',
      )}: ${gcpProjectIdToReadableString(chosenGcpProject)}`}
      <EditButton />
    </ButtonStyledDiv>
  );
};