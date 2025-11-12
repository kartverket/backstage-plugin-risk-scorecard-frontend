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
import { useTheme } from '@mui/material/styles';

type RadioOptionProps = {
  value: string;
  label: string;
  description?: string;
  active?: boolean;
  numActions: number | null;
  numScenarios: number | null;
};

const RadioOption = ({
  value,
  label,
  description,
  active = true,
  numActions,
  numScenarios,
}: RadioOptionProps) => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const theme = useTheme();
  const style = {
    fontSize: '12px',
    border: `1px solid ${active ? 'var(--bui-gray-6)' : 'var(--bui-gray-8)'}`,
    borderRadius: '24px',
    padding: '2px 8px',
  };

  return (
    <>
      <Flex
        direction="column"
        align="start"
        p="12px 16px"
        gap="2"
        style={{
          backgroundColor:
            theme.palette.mode === 'dark'
              ? 'var(--bui-gray-5)'
              : 'var(--bui-gray-2)',
          borderRadius: '8px',
        }}
      >
        <Radio value={value}>
          <Text
            weight="bold"
            as="h5"
            variant="body-large"
            color={active ? 'secondary' : 'primary'}
          >
            {label}
          </Text>
          <Flex gap="8px">
            <Text color={active ? 'secondary' : 'primary'} style={style}>
              {numActions} {t('dictionary.measuresInitialRiSc')}
            </Text>
            <Text color={active ? 'secondary' : 'primary'} style={style}>
              {numScenarios} {t('dictionary.scenarios')}
            </Text>
          </Flex>
        </Radio>
        {description && (
          <Flex ml="6">
            <Text
              as="p"
              variant="body-large"
              color={active ? 'secondary' : 'primary'}
            >
              {description}
            </Text>
          </Flex>
        )}
      </Flex>
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
      const standardDescriptor = getDescriptorOfType(DefaultRiScType.Standard);
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
    const descriptor = getDescriptorOfType(newRiScType as DefaultRiScType);
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
          <Box>
            <Box mb="4">
              <Text variant="title-x-small" weight="bold">
                {t('rosDialog.initialRiscTitle')}
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
                    weight="bold"
                    as="p"
                    color={!props.switchOn ? 'secondary' : 'primary'}
                  >
                    {t('rosDialog.applicationType')}
                  </Text>
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
                          numActions={descriptor.numberOfActions}
                          numScenarios={descriptor.numberOfScenarios}
                        />
                      ),
                    )}
                  </RadioGroup>
                </Flex>
              </>
            )}
            {defaultRiScTypeDescriptors.length === 0 && (
              <Text>{t('rosDialog.noInitialRiScFound')}</Text>
            )}
          </Box>
        </>
      )}
    </>
  );
}

export default ConfigInitialRisc;
