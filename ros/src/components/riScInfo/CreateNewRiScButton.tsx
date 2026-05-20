import { Button } from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import styles from './CreateNewRiScButton.module.css';

type CreateNewRiScButtonProps = {
  onCreateNew: () => void;
};

export function CreateNewRiScButton(props: CreateNewRiScButtonProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  return (
    <Button
      iconStart={<i className="ri-add-circle-line" />}
      onClick={props.onCreateNew}
      className={styles.button}
    >
      {t('contentHeader.createNewButton')}
    </Button>
  );
}
