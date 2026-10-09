import { pluginRiScTranslationRef } from '../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { UseFormReturn } from 'react-hook-form';
import { FormScenario } from '../../../utils/types';
import {
  probabilityCategoryOrder,
  probabilityOptions,
} from '../../../utils/constants';
import { Text, Box } from '@backstage/ui';
import styles from '../ScenarioWizardTable.module.css';
import { createInfoWithHeadersComponent, RiskTableBase } from './RiskTableBase';

function ProbabilityTableInfo() {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  function getTextCell(resourceKey: string, row: number) {
    return (
      <Box className={styles.riskCell}>
        {/* @ts-ignore */}
        {t(`probabilityTable.cells.${resourceKey}.${row + 1}`)}
      </Box>
    );
  }

  function getRow(resourceKey: string) {
    return (
      <>
        <Box className={styles.riskLabelCell}>
          <Text as="p" variant="body-large" weight="bold">
            {/* @ts-ignore */}
            {t(`probabilityTable.columns.${resourceKey}`)}
          </Text>
        </Box>
        {Array.from({ length: 5 }, (_, i) => getTextCell(resourceKey, i))}
      </>
    );
  }

  return (
    <Box className={styles.consequenceGrid}>
      {probabilityCategoryOrder.map(key => getRow(key))}
    </Box>
  );
}

export function ProbabilityTable({
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
      fieldName="probability"
      options={probabilityOptions}
      additionalClassName={styles.consequenceRow}
      translationPrefix="probabilityTable"
      InfoComponent={ProbabilityTableInfo}
    />
  );
}

export const ProbabilityTableInfoWithHeaders = createInfoWithHeadersComponent(
  'probabilityTable',
  ProbabilityTableInfo,
  true,
);
