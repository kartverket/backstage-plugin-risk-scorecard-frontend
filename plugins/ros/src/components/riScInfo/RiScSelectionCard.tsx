import { useRiScs } from '../../contexts/RiScContext.tsx';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import { Select, Flex } from '@backstage/ui';
import styles from './RiScSelectionCard.module.css';

export function RiScSelectionCard() {
  const { riScs, lockedRiScs, selectedRiSc, selectedLockedRiSc, selectRiSc } =
    useRiScs();
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const hasOptions =
    (riScs !== null && riScs.length !== 0) || lockedRiScs.length !== 0;

  return (
    <Flex direction="column" gap="24px">
      {hasOptions && (
        <Select
          value={selectedRiSc?.id ?? selectedLockedRiSc?.id}
          className={styles.selectTrigger}
          aria-label={t('contentHeader.multipleRiScs')}
          options={[
            ...(riScs ?? []).map(riSc => ({
              value: riSc.id,
              label: riSc.content.title,
            })),
            ...lockedRiScs.map(riSc => ({
              value: riSc.id,
              label: `🔒 ${riSc.id}`,
            })),
          ]}
          onSelectionChange={key => {
            if (key) selectRiSc(key.toString());
          }}
          size="medium"
        />
      )}
    </Flex>
  );
}
