import Button from '@mui/material/Button';

import { pluginRiScTranslationRef } from '../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import { dialogActions } from '../../common/mixins';
import { useScenario } from '../../../contexts/ScenarioContext';
import { useRiScs } from '../../../contexts/RiScContext';
import { deleteScenario } from '../../../utils/utilityfunctions';

export function DeleteConfirmation({
  deleteConfirmationIsOpen,
  setDeleteConfirmationIsOpen,
}: {
  deleteConfirmationIsOpen: boolean;
  setDeleteConfirmationIsOpen: (deleteConfirmationIsOpen: boolean) => void;
}) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { selectedRiSc: riSc, updateRiSc } = useRiScs();
  const { scenario } = useScenario();

  return (
    <Dialog open={deleteConfirmationIsOpen}>
      <DialogTitle>
        {t('scenarioDrawer.deleteScenarioConfirmation')}
      </DialogTitle>
      <DialogActions sx={dialogActions}>
        <Button onClick={() => setDeleteConfirmationIsOpen(false)}>
          {t('dictionary.cancel')}
        </Button>
        <Button
          onClick={() => {
            setDeleteConfirmationIsOpen(false);
            deleteScenario(riSc, updateRiSc, scenario);
          }}
          variant="contained"
          color="error"
        >
          {t('scenarioDrawer.deleteScenarioButton')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
