import React, { useEffect, useState } from 'react';
import { Action } from '../../../utils/types';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { body2, label } from '../../common/typography';

interface ActionBoxProps {
  action: Action;
  index: number;
  saveScenario: () => void;
}

export const ActionBox = ({ action, index, saveScenario }: ActionBoxProps) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const [previousAction, setPreviousAction] = useState(action);

  useEffect(() => {
    if (previousAction !== action) {
      saveScenario();
      setPreviousAction(action);
    }
  }, [action, saveScenario, previousAction]);

  return (
    <>
      <Box>
        <Typography sx={label}>
          {t('dictionary.measure')} {index}
        </Typography>
        <Typography sx={body2}>{action.description}</Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'end',
        }}
      >
        <Box>
          <Typography sx={label}>{t('dictionary.url')}</Typography>
          {action.url ? (
            <Link
              sx={body2}
              target="_blank"
              rel="noreferrer"
              href={
                action.url.startsWith('http') ? action.url : `//${action.url}`
              }
            >
              {action.url}
            </Link>
          ) : (
            <Typography sx={body2}>{t('dictionary.emptyUrl')}</Typography>
          )}
        </Box>

        <Chip
          label={action.status}
          sx={{
            margin: 0,
            backgroundColor:
              action.status === 'Completed'
                ? { backgroundColor: '#6BC6A4' }
                : undefined,
          }}
        />
      </Box>
    </>
  );
};
