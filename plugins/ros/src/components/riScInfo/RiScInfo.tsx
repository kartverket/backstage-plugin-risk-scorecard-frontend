import { RiScWithMetadata } from '../../utils/types';
import { Grid } from '@material-ui/core';
import { RiScStatusComponent } from './riScStatus/RiScStatusComponent';
import { useRiScs } from '../../contexts/RiScContext';
import { RiScSelectionCard } from './RiScSelectionCard.tsx';

interface RiScInfoProps {
  riScWithMetadata: RiScWithMetadata;
  edit: () => void;
  onCreateNew: () => void;
}

export function RiScInfo({
  riScWithMetadata,
  edit,
  onCreateNew,
}: RiScInfoProps) {
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
        <RiScSelectionCard
          riScWithMetadata={riScWithMetadata}
          edit={edit}
          onCreateNew={onCreateNew}
        />
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
