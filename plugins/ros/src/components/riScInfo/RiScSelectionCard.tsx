import { useRiScs } from '../../contexts/RiScContext.tsx';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import { Select, Flex } from '@backstage/ui';
import styles from './RiScSelectionCard.module.css';

export function RiScSelectionCard() {
  const { riScs, selectedRiSc, selectRiSc } = useRiScs();
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <Flex direction="column" gap="24px">
      <Flex direction="column">
        {riScs !== null && riScs.length !== 0 && (
          <>
            <Select
              value={selectedRiSc?.id}
              className={styles.selectTrigger}
              aria-label={t('contentHeader.multipleRiScs')}
              options={riScs.map(riSc => ({
                value: riSc.id,
                label: riSc.content.title,
              }))}
              onSelectionChange={key => {
                if (key) selectRiSc(key.toString());
              }}
              size="medium"
            />
          </>
        )}
      </Flex>
    </Flex>
  );
}
