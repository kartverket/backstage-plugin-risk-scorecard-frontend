import { Button } from '@backstage/ui';
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
      variant="secondary"
      iconStart={<i className="ri-settings-2-line" />}
      onClick={onEditEncryption}
    >
      {t('contentHeader.editEncryption')}
    </Button>
  );
}
