import { pluginRiScTranslationRef } from '../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { Text, RadioGroup, Radio, Box, Switch, Flex } from '@backstage/ui';
import { CreateRiScFrom, RiScDialogStates } from './RiScDialog';
import { Divider } from '@mui/material';

interface ConfigInitialRiscProps {
  dialogState: RiScDialogStates;
  createRiScFrom: CreateRiScFrom;
  switchOn: boolean;
  setSwitchOn: (val: boolean) => void;
  handleChangeCreateRiScFrom: (value: string) => void;
}

function ConfigInitialRisc({
  dialogState,
  createRiScFrom,
  switchOn,
  setSwitchOn,
  handleChangeCreateRiScFrom,
}: ConfigInitialRiscProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <>
      <Divider />
      {dialogState === RiScDialogStates.Create && (
        <Box mt="4">
          <Box mb="4">
            <Text variant="title-small" as="h6" weight="bold">
              {t('rosDialog.initialRiscTitle')}{' '}
            </Text>
          </Box>
          <Box mb="4">
            <Text variant="body-medium" as="p">
              {t('rosDialog.initialRiscScopeDescription')}
            </Text>
            <Switch
              isSelected={switchOn}
              onChange={() => setSwitchOn(!switchOn)}
              label={switchOn ? t('dictionary.yes') : t('dictionary.no')}
            />
          </Box>
          <Flex direction="column" justify="between" mt="2" gap="2">
            <Text
              variant="body-medium"
              color={!switchOn ? 'secondary' : 'primary'}
            >
              {t('rosDialog.initialRiscApplicationType')}
            </Text>
            <RadioGroup
              value={String(createRiScFrom)}
              onChange={handleChangeCreateRiScFrom}
              // label={t('rosDialog.initialRiscApplicationType')}
              isDisabled={!switchOn}
            >
              <Radio value={String(CreateRiScFrom.Default)}>
                <Box>
                  Default
                  <br />
                  <Text>Text</Text>
                </Box>
              </Radio>
              <Radio value={String(CreateRiScFrom.Scratch)}> Scratch </Radio>
              <Radio value="2"> Custom </Radio>
            </RadioGroup>
          </Flex>
        </Box>
      )}
    </>
  );
}

export default ConfigInitialRisc;
