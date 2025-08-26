import { RiScWithMetadata } from '../../utils/types';
import { Box, Grid, Typography } from '@material-ui/core';
import { RiScStatusComponent } from './riScStatus/RiScStatusComponent';
import { InfoCard } from '@backstage/core-components';
import EditButton from '../common/EditButton';
import { useRiScs } from '../../contexts/RiScContext';
import { Markdown } from '../common/Markdown';
import { ReactNode } from 'react';

interface RiScInfoProps {
  riScWithMetadata: RiScWithMetadata;
  edit: () => void;
  topSlot?: ReactNode;
}

export function RiScInfo({ riScWithMetadata, edit, topSlot }: RiScInfoProps) {
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
          <Box sx={{ mb: 2 }}>{topSlot}</Box>
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
