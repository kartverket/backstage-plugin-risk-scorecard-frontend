import { Button } from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';

type CreateNewRiScButtonProps = {
  onCreateNew: () => void;
};

export function CreateNewRiScButton(props: CreateNewRiScButtonProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  return (
    <Button
      iconStart={<i className="ri-add-circle-line" />}
      variant="tertiary"
      onClick={props.onCreateNew}
      style={{
        width: 'fit-content',
        color: '#1F5492',
        fontSize: '16px',
      }}
    >
      {t('contentHeader.createNewButton')}
    </Button>
  );
}
