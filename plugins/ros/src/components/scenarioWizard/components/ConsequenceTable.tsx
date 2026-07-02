import { pluginRiScTranslationRef } from '../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { UseFormReturn } from 'react-hook-form';
import { FormScenario } from '../../../utils/types';
import {
  consequenceCategoryOrder,
  consequenceOptions,
} from '../../../utils/constants';
import { Text, Box } from '@backstage/ui';
import styles from '../ScenarioWizardTable.module.css';
import { createInfoWithHeadersComponent, RiskTableBase } from './RiskTableBase';

function ConsequenceTableInfo() {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  function getTextCell(resourceKey: string, row: number) {
    return (
      <Box className={styles.riskCell}>
        {/* @ts-ignore */}
        {t(`consequenceTable.cells.${resourceKey}.${row + 1}`)}
      </Box>
    );
  }

  function getRow(resourceKey: string) {
    return (
      <>
        <Box className={styles.riskLabelCell}>
          <Text as="p" variant="body-large" weight="bold">
            {/* @ts-ignore */}
            {t(`consequenceTable.columns.${resourceKey}`)}
          </Text>
        </Box>
        {Array.from({ length: 5 }, (_, i) => getTextCell(resourceKey, i))}
      </>
    );
  }

  return (
    <Box className={styles.consequenceGrid}>
      {consequenceCategoryOrder.map(key => getRow(key))}
    </Box>
  );
}

export function ConsequenceTable({
  formMethods,
  riskType,
}: {
  formMethods: UseFormReturn<FormScenario>;
  riskType: keyof Pick<FormScenario, 'risk' | 'remainingRisk'>;
}) {
  return (
    <RiskTableBase
      formMethods={formMethods}
      riskType={riskType}
      fieldName="consequence"
      options={consequenceOptions}
      additionalClassName={styles.consequenceRow}
      translationPrefix="consequenceTable"
      InfoComponent={ConsequenceTableInfo}
    />
  );
}

export const ConsequenceTableInfoWithHeaders = createInfoWithHeadersComponent(
  'consequenceTable',
  ConsequenceTableInfo,
  true,
);
