import { Button } from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';

type AddScenarioButtonProps = {
  onNewScenario: () => void;
};

export function AddScenarioButton(props: AddScenarioButtonProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  return (
    <Button
      iconStart={<i className="ri-add-line" />}
      variant="secondary"
      onClick={props.onNewScenario}
      style={{
        color: '#2E7D32', // Green color from MUI, change when BUI is more mature
      }}
    >
      {t('scenarioTable.addScenarioButton')}
    </Button>
  );
}
