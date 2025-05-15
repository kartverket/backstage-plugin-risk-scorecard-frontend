import { RiScWithMetadata } from '../../utils/types';
import { Box, Grid, Typography } from '@material-ui/core';
import { RiScStatusComponent } from './riScStatus/RiScStatusComponent';
import { InfoCard } from '@backstage/core-components';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { useFontStyles } from '../../utils/style';
import EditButton from '../common/EditButton';
import { useRiScs } from '../../contexts/RiScContext';
import { Markdown } from '../common/Markdown';

interface RiScInfoProps {
  riScWithMetadata: RiScWithMetadata;
  edit: () => void;
}

export function RiScInfo({ riScWithMetadata, edit }: RiScInfoProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { label } = useFontStyles();

  const { approveRiSc } = useRiScs();

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
          <Typography className={label}>{t('dictionary.scope')}</Typography>
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
