import React, { useEffect, useState } from 'react';
import { Action } from '../../../utils/types';
import { pluginRiScTranslationRef } from '../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { body2, label } from '../../common/typography';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import { ExpandLess, ExpandMore } from '@mui/icons-material';

interface ActionBoxProps {
  action: Action;
  index: number;
  saveScenario: () => void;
}

export const ActionBox = ({ action, index, saveScenario }: ActionBoxProps) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const [previousAction, setPreviousAction] = useState(action);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    if (previousAction !== action) {
      saveScenario();
      setPreviousAction(action);
    }
  }, [action, saveScenario, previousAction]);
  const isActionTitlePresent = action.title !== null && action.title !== '';

  return (
    <>
      <Box>
        <Button
          sx={label}
          startIcon={isExpanded ? <ExpandLess /> : <ExpandMore />}
          onClick={() => setIsExpanded(!isExpanded)}
          variant="text"
        >
          {isActionTitlePresent
            ? action.title
            : `${t('dictionary.measure')} ${index}`}
        </Button>
      </Box>
      <Collapse in={isExpanded}>
        <Typography sx={body2}>{action.description}</Typography>

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
      </Collapse>
    </>
  );
};
