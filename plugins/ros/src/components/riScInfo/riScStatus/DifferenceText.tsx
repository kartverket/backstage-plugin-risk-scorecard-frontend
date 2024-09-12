import React from 'react';
import { DifferenceFetchState } from '../../../utils/types';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations';

type DifferenceTextProps = {
  differenceFetchState: DifferenceFetchState;
};

export const DifferenceText = ({
  differenceFetchState,
}: DifferenceTextProps) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  return (
    <>
      {/* TODO: Translation og bedre tekst */}
      <Typography
        sx={{
          fontWeight: 700,
          paddingBottom: '4px',
        }}
      >
        {t('rosStatus.difference.differences.titleRemoved')}
      </Typography>
      <List
        sx={{ paddingBottom: '40px', paddingTop: 0, listStyleType: 'disc' }}
      >
        {differenceFetchState.differenceState.entriesOnLeft.length === 0 && (
          <ListItem
            sx={{
              display: 'list-item',
              marginLeft: '26px',
              paddingTop: '4px',
              paddingBottom: '4px',
            }}
          >
            <Typography>
              {t('rosStatus.difference.differences.noneRemoved')}
            </Typography>
          </ListItem>
        )}
        {differenceFetchState.differenceState.entriesOnLeft.map(item => (
          <ListItem
            key={item}
            sx={{
              display: 'list-item',
              marginLeft: '26px',
              paddingTop: '4px',
              paddingBottom: '4px',
            }}
          >
            <Typography>{item}</Typography>
          </ListItem>
        ))}
      </List>
      {/* TODO: Translation og bedre tekst */}
      <Typography
        sx={{
          fontWeight: 700,
          paddingBottom: '4px',
        }}
      >
        {t('rosStatus.difference.differences.titleExisting')}
      </Typography>
      <List
        sx={{ paddingBottom: '40px', paddingTop: 0, listStyleType: 'disc' }}
      >
        {differenceFetchState.differenceState.difference.length === 0 && (
          <ListItem
            sx={{
              display: 'list-item',
              marginLeft: '26px',
              paddingTop: '4px',
              paddingBottom: '4px',
            }}
          >
            <Typography>
              {t('rosStatus.difference.differences.noneExisting')}
            </Typography>
          </ListItem>
        )}
        {differenceFetchState.differenceState.difference.map(item => (
          <ListItem
            key={item}
            sx={{
              display: 'list-item',
              marginLeft: '26px',
              paddingTop: '4px',
              paddingBottom: '4px',
            }}
          >
            <Typography>{item}</Typography>
          </ListItem>
        ))}
      </List>
      {/* TODO: Translation og bedre tekst */}
      <Typography
        sx={{
          fontWeight: 700,
          paddingBottom: '4px',
        }}
      >
        {t('rosStatus.difference.differences.titleAdded')}
      </Typography>
      <List sx={{ listStyleType: 'disc', paddingTop: 0 }}>
        {differenceFetchState.differenceState.entriesOnRight.length === 0 && (
          <ListItem
            sx={{
              display: 'list-item',
              marginLeft: '26px',
              paddingTop: '4px',
              paddingBottom: '4px',
            }}
          >
            <Typography>
              {t('rosStatus.difference.differences.noneAdded')}
            </Typography>
          </ListItem>
        )}
        {differenceFetchState.differenceState.entriesOnRight.map(item => (
          <ListItem
            key={item}
            sx={{
              display: 'list-item',
              marginLeft: '26px',
              paddingTop: '4px',
              paddingBottom: '4px',
            }}
          >
            <Typography>{item}</Typography>
          </ListItem>
        ))}
      </List>
    </>
  );
};
