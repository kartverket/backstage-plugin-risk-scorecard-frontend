import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { consequenceOptions, probabilityOptions } from '../../utils/constants';
import { pluginRiScTranslationRef } from '../../utils/translations';
import {
  consequenceIndexToTranslationKeys,
  formatNOK,
  probabilityIndexToTranslationKeys,
} from '../../utils/utilityfunctions';
import { Flex, Text } from '@backstage/ui';
import styles from './Tabs.module.css';
import DialogComponent from '../dialog/DialogComponent';
import { RiskMatrixTabs } from './utils';

interface EstimatedRiskInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  riskTab?: RiskMatrixTabs;
}

function formatProbability(probability: number): string {
  return probability.toString();
}

export function EstimatedRiskInfoDialog({
  isOpen,
  onClose,
  riskTab,
}: EstimatedRiskInfoDialogProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const exampleProbabilityLevel = 4;
  const exampleConsequenceLevel = 2;
  const exampleProbability = probabilityOptions[exampleProbabilityLevel - 1];
  const exampleConsequence = consequenceOptions[exampleConsequenceLevel - 1];
  const exampleEstimatedRisk = exampleProbability * exampleConsequence;

  return (
    <DialogComponent
      isOpen={isOpen}
      onClick={onClose}
      className={styles.riskMatrixDialog}
      header={t('infoDialog.title')}
    >
      <Flex gap="2" direction="column">
        <Text>{t('infoDialog.description')}</Text>
        {riskTab !== RiskMatrixTabs.currentRisk ? (
          <>
            <Flex direction="column" gap="0">
              <Text
                variant="body-large"
                weight="bold"
                style={{ marginTop: '8px' }}
              >
                {t('infoDialog.calculatedHowTitle')}
              </Text>
              <Text>{t('infoDialog.calculatedHow')}</Text>
              <Text>
                <strong>
                  {t('infoDialog.riskSymbol')} ={' '}
                  {t('infoDialog.probabilitySymbol')}
                  <sub>{t('infoDialog.probabilityUnit')}</sub> ×{' '}
                  {t('infoDialog.consequenceSymbol')}
                  <sub>{t('infoDialog.consequenceUnit')}</sub>
                </strong>
              </Text>
            </Flex>
            <Flex direction="column" gap="0">
              <Text
                variant="body-large"
                weight="bold"
                style={{ marginTop: '8px' }}
              >
                {t('infoDialog.probabilityTitle')}
              </Text>
              <Flex direction="column" gap="1">
                {probabilityOptions.map((option, index) => (
                  <Text key={index}>
                    <b>{index + 1}</b>: {formatProbability(option)}{' '}
                    {t('infoDialog.probabilityUnit')} —{' '}
                    <b>
                      {t(probabilityIndexToTranslationKeys[index] as any, {})}
                    </b>
                    <br />
                  </Text>
                ))}
              </Flex>
            </Flex>
            <Flex direction="column" gap="0">
              <Text
                variant="body-large"
                weight="bold"
                style={{ marginTop: '8px' }}
              >
                {t('infoDialog.consequenceTitle')}
              </Text>
              <Flex direction="column" gap="1">
                {consequenceOptions.map((option, index) => (
                  <Text key={index}>
                    <b>{index + 1}</b>: {formatNOK(option)}{' '}
                    {t('infoDialog.consequenceUnit')} —{' '}
                    <b>
                      {t(consequenceIndexToTranslationKeys[index] as any, {})}
                    </b>
                  </Text>
                ))}
              </Flex>
            </Flex>
            <Flex direction="column" gap="0">
              <Text
                variant="body-large"
                weight="bold"
                style={{ marginTop: '8px' }}
              >
                {t('dictionary.example')}
              </Text>
              <Text>
                {t('infoDialog.example.part1')}
                <b>{exampleProbabilityLevel}</b> (
                {formatProbability(exampleProbability)}{' '}
                {t('infoDialog.probabilityUnit')})
                {t('infoDialog.example.part2')}
                <b>{exampleConsequenceLevel}</b> (
                {formatNOK(exampleConsequence)}{' '}
                {t('infoDialog.consequenceUnit')})
                {t('infoDialog.example.part3')}
                <b>
                  {formatNOK(exampleEstimatedRisk)}{' '}
                  {t('riskMatrix.estimatedRisk.unit.nokPerYear')}
                </b>
                .
              </Text>
            </Flex>
          </>
        ) : (
          <Flex direction="column" gap="2">
            <Text as="h3" variant="body-large" weight="bold">
              {t('infoDialog.currentRisk.title')}
            </Text>
            <Flex direction="column" gap="2">
              <Text>{t('infoDialog.currentRisk.description')}:</Text>
              <Text>
                <strong>
                  R<sub>initial</sub> = P<sub>start</sub> * C<sub>start</sub>
                </strong>
              </Text>
              <Text>
                {t('infoDialog.currentRisk.remainingRiskCost')}:
                <br />
                <strong>
                  R<sub>remaining</sub> = P<sub>end</sub> * C<sub>end</sub>
                </strong>
              </Text>
              <Text>{t('infoDialog.currentRisk.actionRatio')}</Text>
              <Text>
                {t('infoDialog.currentRisk.currentRiskCost')}:
                <br />
                <strong>
                  R<sub>current</sub> = R<sub>initial</sub> + (R
                  <sub>remaining</sub> − R<sub>initial</sub>) * ratio
                </strong>
              </Text>
              <Text>
                {t('infoDialog.currentRisk.aggregated')} R<sub>current</sub>{' '}
                {t('infoDialog.currentRisk.aggregatedSums')}
              </Text>
            </Flex>
          </Flex>
        )}
      </Flex>
    </DialogComponent>
  );
}
