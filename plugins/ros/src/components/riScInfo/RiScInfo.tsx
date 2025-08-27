import { RiScWithMetadata } from '../../utils/types';
import {
  Box,
  Grid,
  Typography,
  Select,
  MenuItem,
  ListItemText,
} from '@material-ui/core';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import { RiScStatusComponent } from './riScStatus/RiScStatusComponent';
import { InfoCard } from '@backstage/core-components';
import EditButton from '../common/EditButton';
import { useRiScs } from '../../contexts/RiScContext';
import { Markdown } from '../common/Markdown';

interface RiScInfoProps {
  riScWithMetadata: RiScWithMetadata;
  edit: () => void;
}

export function RiScInfo({ riScWithMetadata, edit }: RiScInfoProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { approveRiSc, riScs, selectedRiSc, selectRiSc } = useRiScs();

  return (
    <Grid container>
      <Grid
        item
        xs={12}
        sm={6}
        md={6}
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <InfoCard>
          <Box sx={{ mb: 2 }}>
            {riScs !== null && riScs.length !== 0 && (
              <>
                <Typography variant="h6" style={{ fontSize: 16, marginBottom: 1 }}>
                  {t('contentHeader.multipleRiScs')}
                </Typography>
                <Select
                  variant="standard"
                  value={selectedRiSc?.id ?? ''}
                  onChange={e => selectRiSc(e.target.value as string)}
                >
                  {riScs.map(riSc => (
                    <MenuItem key={riSc.id} value={riSc.id}>
                      <ListItemText primary={riSc.content.title} />
                    </MenuItem>
                  )) ?? []}
                </Select>
              </>
            )}
          </Box>
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="h5">
              {riScWithMetadata.content.title}
            </Typography>
            <EditButton onClick={edit} />
          </Box>
          <Markdown description={riScWithMetadata.content.scope} />
        </InfoCard>
      </Grid>
      <Grid item xs={12} sm={6} md={6}>
        <RiScStatusComponent
          selectedRiSc={riScWithMetadata}
          publishRiScFn={approveRiSc}
        />
      </Grid>
    </Grid>
  );
}
