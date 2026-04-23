import { useRiScs } from '../../contexts/RiScContext.tsx';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import { Flex } from '@backstage/ui';
import FormControl from '@mui/material/FormControl';
import ListSubheader from '@mui/material/ListSubheader';
import MenuItem from '@mui/material/MenuItem';
import MUISelect from '@mui/material/Select';
import styles from './RiScSelectionCard.module.css';

export function RiScSelectionCard() {
  const { riScs, lockedRiScs, selectedRiSc, selectedLockedRiSc, selectRiSc } =
    useRiScs();
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const hasOptions =
    (riScs !== null && riScs.length !== 0) || lockedRiScs.length !== 0;

  return (
    <Flex direction="column" gap="24px">
      {hasOptions && (
        <FormControl fullWidth size="small">
          <MUISelect
            value={selectedRiSc?.id ?? selectedLockedRiSc?.id ?? ''}
            onChange={e => selectRiSc(e.target.value)}
            inputProps={{ 'aria-label': t('contentHeader.multipleRiScs') }}
            MenuProps={{ disablePortal: true }}
            className={styles.selectTrigger}
          >
            {(riScs ?? []).map(riSc => (
              <MenuItem key={riSc.id} value={riSc.id}>
                {riSc.content.title}
              </MenuItem>
            ))}
            {lockedRiScs.length > 0 && (
              <ListSubheader
                sx={{
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  borderTop: riScs && riScs.length > 0 ? '1px solid' : 'none',
                  borderColor: 'divider',
                  mt: riScs && riScs.length > 0 ? 0.5 : 0,
                  pt: 1,
                }}
              >
                {t('contentHeader.lockedRiScsSection')}
              </ListSubheader>
            )}
            {lockedRiScs.map(riSc => (
              <MenuItem key={riSc.id} value={riSc.id}>
                🔒 {riSc.id}
              </MenuItem>
            ))}
          </MUISelect>
        </FormControl>
      )}
    </Flex>
  );
}
