import { pluginRiScTranslationRef } from '../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { Text, RadioGroup, Radio, Box, Switch, Flex } from '@backstage/ui';
import { RiScDialogStates } from './RiScDialog';
import { Divider } from '@mui/material';
import { DefaultRiScType } from '../../utils/types.ts';
import { useDefaultRiScTypeDescriptors } from '../../contexts/DefaultRiScTypesContext.tsx';

type RadioOptionProps = {
  value: string;
  label: string;
  description?: string;
  active?: boolean;
};

export const RadioOption = ({
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
  onSelectRiScType: (value: string) => void;
}

function ConfigInitialRisc({
  dialogState,
  switchOn,
  setSwitchOn,
  onSelectRiScType,
}: ConfigInitialRiscProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { defaultRiScTypeDescriptors } = useDefaultRiScTypeDescriptors();

  return (
    <>
      <Divider />
      {dialogState === RiScDialogStates.Create && (
        <>
          <Box mt="4">
            <Box mb="4">
              <Text variant="title-small" as="h6" weight="bold">
                {t('rosDialog.initialRiscTitle')}{' '}
              </Text>
            </Box>
            {defaultRiScTypeDescriptors.length > 0 && (
              <>
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
                    defaultValue={DefaultRiScType.Standard}
                    onChange={onSelectRiScType}
                    isDisabled={!switchOn}
                    aria-label="Select application type"
                  >
                    {defaultRiScTypeDescriptors.map(descriptor => (
                      <RadioOption
                        key={descriptor.riScType}
                        value={descriptor.riScType}
                        label={descriptor.listName}
                        description={descriptor.listDescription}
                        active={!switchOn}
                      />
                    ))}
                  </RadioGroup>
                </Flex>
              </>
            )}
            {defaultRiScTypeDescriptors.length === 0 && (
              <Text>
                Ingen forhåndsdefinert RoS er tilgjengelig for øyeblikket.
              </Text>
            )}
          </Box>
        </>
      )}
    </>
  );
}

export default ConfigInitialRisc;
