import { pluginRiScTranslationRef } from '../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { Box, Flex, Radio, RadioGroup, Switch, Text } from '@backstage/ui';
import { RiScDialogStates } from './RiScDialog';
import { Divider } from '@mui/material';
import {
  DefaultRiScType,
  DefaultRiScTypeDescriptor,
  RiScWithMetadata,
} from '../../utils/types.ts';
import { useDefaultRiScTypeDescriptors } from '../../contexts/DefaultRiScTypesContext.tsx';
import { UseFormSetValue } from 'react-hook-form/dist/types/form';

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
  setValue: UseFormSetValue<RiScWithMetadata>;
  selectedRiScType: DefaultRiScType;
  setSelectedRiScType: (riScType: DefaultRiScType) => void;
}

function sortStandardRiScFirst(
  defaultRiScTypeDescriptors: DefaultRiScTypeDescriptor[],
): DefaultRiScTypeDescriptor[] {
  return defaultRiScTypeDescriptors.sort((a, b) => {
    if (
      a.riScType === DefaultRiScType.Standard &&
      b.riScType !== DefaultRiScType.Standard
    )
      return -1;
    if (
      a.riScType !== DefaultRiScType.Standard &&
      b.riScType === DefaultRiScType.Standard
    )
      return 1;
    return 0;
  });
}

function ConfigInitialRisc(props: ConfigInitialRiscProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { defaultRiScTypeDescriptors, getDescriptorOfType } =
    useDefaultRiScTypeDescriptors();

  function onSwitchChange() {
    if (props.switchOn) {
      props.setValue('content.title', '');
      props.setValue('content.scope', '');
    } else {
      let standardDescriptor = getDescriptorOfType(DefaultRiScType.Standard);
      props.setSelectedRiScType(DefaultRiScType.Standard);
      if (standardDescriptor) {
        props.setValue('content.title', standardDescriptor.defaultTitle);
        props.setValue('content.scope', standardDescriptor.defaultScope);
      }
    }
    props.setSwitchOn(!props.switchOn);
  }

  function onSelectRiScType(newRiScType: string) {
    const defaultRiScType = newRiScType as DefaultRiScType;
    props.setSelectedRiScType(defaultRiScType);
    let descriptor = getDescriptorOfType(newRiScType as DefaultRiScType);
    if (descriptor) {
      props.setValue('content.title', descriptor.defaultTitle);
      props.setValue('content.scope', descriptor.defaultScope);
    }
  }

  return (
    <>
      <Divider />
      {props.dialogState === RiScDialogStates.Create && (
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
                    isSelected={props.switchOn}
                    onChange={onSwitchChange}
                    label={
                      props.switchOn ? t('dictionary.yes') : t('dictionary.no')
                    }
                  />
                </Box>
                <Flex direction="column" justify="between" mt="2" gap="2">
                  <Text
                    variant="body-medium"
                    color={!props.switchOn ? 'secondary' : 'primary'}
                  >
                    {t('rosDialog.initialRiscApplicationType')}
                  </Text>

                  <RadioGroup
                    onChange={onSelectRiScType}
                    isDisabled={!props.switchOn}
                    aria-label="Select application type"
                    value={props.selectedRiScType}
                  >
                    {sortStandardRiScFirst(defaultRiScTypeDescriptors).map(
                      descriptor => (
                        <RadioOption
                          key={descriptor.riScType}
                          value={descriptor.riScType}
                          label={descriptor.listName}
                          description={descriptor.listDescription}
                          active={!props.switchOn}
                        />
                      ),
                    )}
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
