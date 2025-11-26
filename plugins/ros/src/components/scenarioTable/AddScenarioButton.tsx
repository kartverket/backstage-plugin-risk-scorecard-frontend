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
      onClick={props.onNewScenario}
    >
      {t('scenarioTable.addScenarioButton')}
    </Button>
  );
}
