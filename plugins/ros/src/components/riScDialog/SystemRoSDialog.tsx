import { useState } from 'react';
import { Button, Text } from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import { useRiScs } from '../../contexts/RiScContext.tsx';
import dialogStyles from './RiScDialog.module.css';
import styles from './SystemRoSDialog.module.css';
import DialogComponent from '../dialog/DialogComponent.tsx';

export function SystemRoSDialog() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { selectedRiSc } = useRiScs();

  if (!selectedRiSc) {
    return null;
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="secondary"
        iconStart={<i className="ri-question-line" />}
      >
        {t('systemRoSDialog.title')}
      </Button>
      <DialogComponent
        isOpen={open}
        onClick={() => setOpen(false)}
        header={t('systemRoSDialog.title')}
        className={dialogStyles.createRiscDialog}
      >
        <div className={styles.systemRoSBody}>
          <Text>{t('systemRoSDialog.body')}</Text>
        </div>
      </DialogComponent>
    </>
  );
}
