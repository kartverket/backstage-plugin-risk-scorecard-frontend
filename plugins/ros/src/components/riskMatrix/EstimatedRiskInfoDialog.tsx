import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { Dialog } from '@material-ui/core';
import { consequenceOptions, probabilityOptions } from '../../utils/constants';
import { pluginRiScTranslationRef } from '../../utils/translations';
import {
  consequenceIndexToTranslationKeys,
  formatNOK,
  probabilityIndexToTranslationKeys,
} from '../../utils/utilityfunctions';
import { Card, CardBody, CardHeader, Flex, Text } from '@backstage/ui';

interface EstimatedRiskInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EstimatedRiskInfoDialog({
  isOpen,
  onClose,
}: EstimatedRiskInfoDialogProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="xs">
      <Card
        style={{
          padding: '16px',
          margin: 0,
        }}
      >
        <CardHeader>
          <Text variant="title-x-small" weight="bold">
            {t('infoDialog.title')}
          </Text>
        </CardHeader>
        <CardBody>
          <Flex gap="2" direction="column">
            <Text>{t('infoDialog.description')}</Text>
            <Flex direction="column" gap="0">
              <Text
                variant="body-large"
                weight="bold"
                style={{ marginTop: '8px' }}
              >
                {t('infoDialog.calculatedHowTitle')}
              </Text>
              <Text>
                {' '}
                {t('infoDialog.calculatedHow')}
                <sup>{t('infoDialog.calculatedHowExponent')}</sup>
                {t('riskMatrix.estimatedRisk.unit.nokPerYear')}.
              </Text>
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
                    <b>{index + 1}</b>: 20<sup>{index + 3}</sup> ={' '}
                    {formatNOK(option)} {t('infoDialog.consequenceUnit')} ={' '}
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
                {t('infoDialog.probabilityTitle')}
              </Text>
              <Flex direction="column" gap="1">
                {probabilityOptions.map((option, index) => (
                  <Text key={index}>
                    <b>{index + 1}</b>: 20<sup>{index - 2}</sup> = {option}{' '}
                    {t('infoDialog.probabilityUnit')} ={' '}
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
                {t('dictionary.example')}
              </Text>
              <Text>
                {t('infoDialog.example.part1')}
                <b>2</b> (20<sup>4</sup> = 160,000{' '}
                {t('infoDialog.consequenceUnit')})
                {t('infoDialog.example.part2')}
                <b>4</b> (20<sup>1</sup> = 20 {t('infoDialog.probabilityUnit')})
                {t('infoDialog.example.part3')}
                20<sup>1+4-1</sup> = 160,000{' '}
                {t('riskMatrix.estimatedRisk.unit.nokPerYear')}.
              </Text>
            </Flex>
          </Flex>
        </CardBody>
      </Card>
    </Dialog>
  );
}
