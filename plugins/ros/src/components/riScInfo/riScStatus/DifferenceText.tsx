import React from 'react';
import { DifferenceFetchState } from '../../../utils/types';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations';

function renderListItems(
  items: string[],
  _processItem: (item: string) => Record<string, any> | string,
) {
  const processedItems = items.reduce(
    (acc: Record<string, any>, entry) => {
      const [path, value] = entry.split(': ');
      const keys = path.split('/');
      keys.shift();
      let current: Record<string, any> = acc;

      keys.forEach((key, index) => {
        if (!current[key]) {
          current[key] = index === keys.length - 1 ? JSON.parse(value) : {};
        }
        current = current[key];
      });

      return acc;
    },
    {} as Record<string, any>,
  );

  return Object.entries(processedItems).map(([key, value]) => (
    <ListItem
      key={key}
      sx={{
        display: 'block',
        marginLeft: '26px',
        paddingTop: '4px',
        paddingBottom: '4px',
      }}
    >
      <Typography sx={{ marginBottom: '4px' }}>
        {key}:{' '}
        {typeof value === 'object' ? (
          <br />
        ) : (
          String(value).replace(/[{}"]/g, '')
        )}
      </Typography>
      {typeof value === 'object' && value
        ? Object.entries(value).map(([subKey, subValue]) => (
            <Typography
              key={subKey}
              sx={{ marginLeft: '16px', marginBottom: '4px' }}
            >
              <strong>{subKey}:</strong>{' '}
              {typeof subValue === 'object' && subValue !== null
                ? JSON.stringify(subValue, null, 2)
                    .replace(/[{}"]/g, '')
                    .replace(/,/g, '\n')
                    .split('\n')
                    .map((line, index) => (
                      <React.Fragment key={index}>
                        {line}
                        <br />
                      </React.Fragment>
                    ))
                : String(subValue).replace(/[{}"]/g, '')}
            </Typography>
          ))
        : null}
    </ListItem>
  ));
}

type DifferenceTextProps = {
  differenceFetchState: DifferenceFetchState;
};

export function DifferenceText({ differenceFetchState }: DifferenceTextProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <>
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
        {renderListItems(
          differenceFetchState.differenceState.entriesOnLeft,
          item => item,
        )}
      </List>
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
        {renderListItems(
          differenceFetchState.differenceState.entriesOnRight,
          entry => entry,
        )}
      </List>
    </>
  );
}
