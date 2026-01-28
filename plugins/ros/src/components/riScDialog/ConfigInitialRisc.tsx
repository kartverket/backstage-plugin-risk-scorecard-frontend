import { pluginRiScTranslationRef } from '../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { Box, Flex, Radio, RadioGroup, Switch, Text } from '@backstage/ui';
import { RiScWithMetadata } from '../../utils/types.ts';
import { useDefaultRiScTypeDescriptors } from '../../contexts/DefaultRiScTypesContext.tsx';
import { UseFormSetValue } from 'react-hook-form';
import { useTheme } from '@mui/material/styles';
import styles from './ConfigInitialRisc.module.css';

type RadioOptionProps = {
  value: string;
  label: string;
  description?: string;
  active?: boolean;
  numActions: number | null;
  numScenarios: number | null;
  recommendedBackstageComponentType?: string | null;
};

const RadioOption = ({
  value,
  label,
  description,
  active = true,
  numActions,
  numScenarios,
  recommendedBackstageComponentType,
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
        {recommendedBackstageComponentType && (
          <Text
            variant="body-large"
            color={active ? 'secondary' : 'primary'}
            className={styles.recommendedForComponentTypeText}
          >
            {t('rosDialog.recommendedForComponentOfType')}{' '}
            <b>{recommendedBackstageComponentType}</b>.
          </Text>
        )}
      </Flex>
    </>
  );
};

interface ConfigInitialRiscProps {
  switchOn: boolean;
  setSwitchOn: (val: boolean) => void;
  setValue: UseFormSetValue<RiScWithMetadata>;
  selectedRiScId: string | undefined;
  setSelectedRiScId: (riScId: string | undefined) => void;
}

function ConfigInitialRisc(props: ConfigInitialRiscProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const {
    defaultRiScTypeDescriptors,
    riScSelectedByDefault,
    getDescriptorOfId,
  } = useDefaultRiScTypeDescriptors();

  function onCreateDefaultRiScSwitchChange() {
    if (props.switchOn) {
      props.setValue('content.title', '');
      props.setValue('content.scope', '');
    } else {
      props.setSelectedRiScId(riScSelectedByDefault?.id);
      if (riScSelectedByDefault) {
        props.setValue('content.title', riScSelectedByDefault.defaultTitle);
        props.setValue('content.scope', riScSelectedByDefault.defaultScope);
      }
    }
    props.setSwitchOn(!props.switchOn);
  }

  function onSelectRiScType(selectedDefaultRiScId: string) {
    props.setSelectedRiScId(selectedDefaultRiScId);
    const descriptor = getDescriptorOfId(selectedDefaultRiScId);
    if (descriptor) {
      props.setValue('content.title', descriptor.defaultTitle);
      props.setValue('content.scope', descriptor.defaultScope);
    }
  }

  return (
    <Box>
      {defaultRiScTypeDescriptors.length > 0 && (
        <>
          <Box pb="2">
            <Text variant="body-medium" as="p">
              {t('rosDialog.initialRiscScopeDescription')}
            </Text>
            <Box pt="2">
              <Switch
                isSelected={props.switchOn}
                onChange={onCreateDefaultRiScSwitchChange}
                label={
                  props.switchOn ? t('dictionary.yes') : t('dictionary.no')
                }
              />
            </Box>
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
              value={props.selectedRiScId}
              className={styles.radioGroup}
            >
              {defaultRiScTypeDescriptors.map(descriptor => (
                <RadioOption
                  key={descriptor.id}
                  value={descriptor.id}
                  label={descriptor.listName}
                  description={descriptor.listDescription}
                  active={!props.switchOn}
                  numActions={descriptor.numberOfActions}
                  numScenarios={descriptor.numberOfScenarios}
                  recommendedBackstageComponentType={
                    descriptor.preferredBackstageComponentType
                  }
                />
              ))}
            </RadioGroup>
          </Flex>
        </>
      )}
      {defaultRiScTypeDescriptors.length === 0 && (
        <Text>{t('rosDialog.noInitialRiScFound')}</Text>
      )}
    </Box>
  );
}

export default ConfigInitialRisc;
