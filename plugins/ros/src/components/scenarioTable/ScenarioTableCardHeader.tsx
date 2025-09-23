import { Button, Flex, Text } from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import { AddScenarioButton } from './AddScenarioButton.tsx';

type ScenarioTableCardHeaderProps = {
  isEditing: boolean;
  isEditingAllowed: boolean;
  onNewScenario: () => void;
  onToggleEdit: () => void;
};

export function ScenarioTableCardHeader(props: ScenarioTableCardHeaderProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  return (
    <Flex justify="between">
      <Text variant="title-small" as="h6" weight="bold">
        {t('scenarioTable.title')}
      </Text>
      {props.isEditingAllowed && (
        <Flex justify="end" align="center">
          <AddScenarioButton onNewScenario={props.onNewScenario} />
          <Button
            iconStart={
              props.isEditing ? (
                <i className="ri-checkbox-circle-line"></i>
              ) : (
                <i className="ri-pencil-line" />
              )
            }
            variant="secondary"
            onClick={props.onToggleEdit}
          >
            {props.isEditing
              ? t('scenarioTable.doneEditing')
              : t('scenarioTable.editButton')}
          </Button>
        </Flex>
      )}
    </Flex>
  );
}
