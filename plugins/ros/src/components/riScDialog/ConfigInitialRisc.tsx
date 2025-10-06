import { pluginRiScTranslationRef } from '../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { Text, RadioGroup, Radio, Box, Switch, Flex } from '@backstage/ui';
import { CreateRiScFrom, RiScDialogStates } from './RiScDialog';
import { Divider } from '@mui/material';

type RadioOptionProps = {
  value: string;
  label: string;
  description?: string;
  active?: boolean;
};

const RadioOption = ({
  value,
  label,
  description,
  active = true,
}: RadioOptionProps) => {
  return (
    <>
      <Flex align="center" pt="2">
        <Radio value={value}>
          <Text
            as="h5"
            variant="body-medium"
            color={active ? 'secondary' : 'primary'}
          >
            {label}
          </Text>
        </Radio>
      </Flex>
      {description && (
        <Flex ml="6">
          <Text
            as="p"
            variant="body-small"
            color={active ? 'secondary' : 'primary'}
          >
            {description}
          </Text>
        </Flex>
      )}
    </>
  );
};

interface ConfigInitialRiscProps {
  dialogState: RiScDialogStates;
  switchOn: boolean;
  setSwitchOn: (val: boolean) => void;
  handleChangeCreateRiScFrom: (value: string) => void;
}

function ConfigInitialRisc({
  dialogState,
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
          <Box pb="2">
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
              defaultValue={String(CreateRiScFrom.Ops)}
              onChange={handleChangeCreateRiScFrom}
              isDisabled={!switchOn}
              aria-label="Select application type"
            >
              <RadioOption
                value={String(CreateRiScFrom.Ops)}
                label="Ops"
                description={t('rosDialog.generateObsRiScDescription')}
                active={!switchOn}
              />
              <RadioOption
                value={String(CreateRiScFrom.InternalJob)}
                label="Internal Job"
                description={t('rosDialog.generateInternalJobRiScDescription')}
                active={!switchOn}
              />
              <RadioOption
                value={String(CreateRiScFrom.Standard)}
                label="Standard"
                description={t('rosDialog.generateStandardRiScDescription')}
                active={!switchOn}
              />
            </RadioGroup>
          </Flex>
        </Box>
      )}
    </>
  );
}

export default ConfigInitialRisc;
