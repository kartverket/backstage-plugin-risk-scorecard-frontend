import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { DifferenceFetchState } from '../../utils/types';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { RiScDifferenceDialog } from './riScStatus/RiScDifferenceDialog';
import styles from './RiScSelectionCard.module.css';
import { ConfirmationDialogWithCheckbox } from '../common/ConfirmationDialog';

interface RiScPublishDialogProps {
  openDialog: boolean;
  isDeletion: boolean;
  handleCancel: () => void;
  handlePublish: () => void;
  differenceFetchState: DifferenceFetchState;
}

export const RiScPublishDialog = ({
  openDialog,
  isDeletion,
  handleCancel,
  handlePublish,
  differenceFetchState,
}: RiScPublishDialogProps): React.ReactElement<any> => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <ConfirmationDialogWithCheckbox
      isOpen={openDialog}
      onCancel={handleCancel}
      onConfirm={handlePublish}
      title={
        isDeletion
          ? t('publishDialog.titleDelete')
          : t('publishDialog.titleUpdate')
      }
      checkboxLabel={
        isDeletion
          ? t('publishDialog.checkboxLabelDelete')
          : t('publishDialog.checkboxLabelUpdate')
      }
      className={styles.riScInfoDialog}
    >
      {!isDeletion && (
        <RiScDifferenceDialog differenceFetchState={differenceFetchState} />
      )}
    </ConfirmationDialogWithCheckbox>
  );
};
