import { pluginRiScTranslationRef } from '../../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { useController, UseFormReturn } from 'react-hook-form';
import { FormScenario } from '../../../utils/types';
import { RiskRadioButton } from './RiskRadioButton';
import RadioGroup from '@mui/material/RadioGroup';
import { Text, Box } from '@backstage/ui';
import styles from '../ScenarioWizardTable.module.css';
import React from 'react';

type RiskTableBaseProps = {
  formMethods: UseFormReturn<FormScenario>;
  riskType: keyof Pick<FormScenario, 'risk' | 'remainingRisk'>;
  fieldName: 'probability' | 'consequence';
  translationPrefix: 'probabilityTable' | 'consequenceTable';
  options: readonly number[];
  additionalClassName?: string;
  InfoComponent: React.ComponentType;
};

export function RiskTableBase({
  formMethods,
  riskType,
  fieldName,
  options,
  additionalClassName = '',
  translationPrefix,
  InfoComponent,
}: RiskTableBaseProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const { field } = useController({
    name: `${riskType}.${fieldName}`,
    control: formMethods.control,
  });

  function getRadioLabel(row: number) {
    /* @ts-ignore Because ts can't typecheck strings against our keys */
    return `${row}: ${t(`${translationPrefix}.rows.${row}`)}`;
  }

  function getRadioCell(row: number) {
    return (
      <RiskRadioButton
        value={options[row]}
        ref={field.ref}
        label={getRadioLabel(row + 1)}
      />
    );
  }

  const radioGroupClassName = additionalClassName
    ? `${styles.riskRow} ${additionalClassName}`
    : styles.riskRow;

  return (
    <Box className={styles.riskTable}>
      <RadioGroup {...field} className={radioGroupClassName}>
        {fieldName === 'consequence' && (
          <Box className={styles.riskLabelCell} />
        )}
        {Array.from({ length: 5 }, (_, i) => getRadioCell(i))}
      </RadioGroup>
      <InfoComponent />
    </Box>
  );
}

export function createInfoWithHeadersComponent(
  translationPrefix: 'probabilityTable' | 'consequenceTable',
  InfoComponent: React.ComponentType,
  includeLabel: boolean = false,
) {
  return function InfoWithHeaders() {
    const { t } = useTranslationRef(pluginRiScTranslationRef);

    function getRadioLabel(row: number) {
      return (
        <Text as="p" variant="body-large">
          {/* @ts-ignore Because ts can't typecheck strings against our keys */}
          {`${row}: ${t(`${translationPrefix}.rows.${row}`)}`}
        </Text>
      );
    }
    return (
      <Box className={styles.riskTable}>
        <Box className={styles.consequenceGrid}>
          {includeLabel && <Box className={styles.riskLabelCell} />}
          {Array.from({ length: 5 }, (_, i) => getRadioLabel(i))}
        </Box>
        <InfoComponent />
      </Box>
    );
  };
}
