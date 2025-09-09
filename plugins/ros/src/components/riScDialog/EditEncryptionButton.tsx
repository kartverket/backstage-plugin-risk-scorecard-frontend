import { Button } from '@mui/material';
import { Settings } from '@material-ui/icons';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { useRiScs } from '../../contexts/RiScContext';

export function EditEncryptionButton({
  onEditEncryption,
}: {
  onEditEncryption: () => void;
}) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { selectedRiSc } = useRiScs();

  if (!selectedRiSc) {
    return null;
  }

  return (
    <Button
      variant="text"
      startIcon={<Settings />}
      color="primary"
      onClick={onEditEncryption}
    >
      {t('contentHeader.editEncryption')}
    </Button>
  );
}
