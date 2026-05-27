import { pluginRiScTranslationRef } from '../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { UseFormReturn } from 'react-hook-form';
import { FormScenario } from '../../../utils/types';
import { probabilityOptions } from '../../../utils/constants';
import { Box } from '@backstage/ui';
import styles from '../ScenarioWizardTable.module.css';
import { createInfoWithHeadersComponent, RiskTableBase } from './RiskTableBase';

function ProbabilityTableInfo() {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  function getContentCell(row: number) {
    return (
      <Box className={styles.riskCell}>
        {/* @ts-ignore */}
        {t(`probabilityTable.cells.${row + 1}`)}
      </Box>
    );
  }

  return (
    <Box className={styles.riskRow}>
      {Array.from({ length: 5 }, (_, i) => getContentCell(i))}
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
      translationPrefix="probabilityTable"
      InfoComponent={ProbabilityTableInfo}
    />
  );
}

export const ProbabilityTableInfoWithHeaders = createInfoWithHeadersComponent(
  'probabilityTable',
  ProbabilityTableInfo,
  false,
);
