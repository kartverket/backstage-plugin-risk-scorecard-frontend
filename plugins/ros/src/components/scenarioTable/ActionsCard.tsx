import { Grid } from '@backstage/ui';
import { Action, Scenario } from '../../utils/types';
import {
  calculateDaysSince,
  calculateUpdatedStatus,
  formatDate,
} from '../../utils/utilityfunctions';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { Divider } from '@mui/material';

type ActionsCardProps = {
  data: Scenario[];
  filteredData: Action[];
  metaData: number | null;
};

export function ActionsCard(props: ActionsCardProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const tmp = props.data
    .flatMap(scenario => scenario.actions)
    .map(action => {
      const daysSinceLastUpdate = action.lastUpdated
        ? calculateDaysSince(new Date(action.lastUpdated))
        : null;
      return {
        ...action,
        updatedStatus: calculateUpdatedStatus(
          daysSinceLastUpdate,
          props.metaData,
        ),
      };
    });

  return (
    <>
      <Divider />
      {props.filteredData.map((action, index) => (
        <Grid.Root key={index} columns="6">
          <Grid.Item colSpan="4">
            {action.updatedStatus}
            <br />
            {action.title}
          </Grid.Item>
          <Grid.Item colSpan="1">{action.status}</Grid.Item>
          <Grid.Item colSpan="1">
            {t('scenarioDrawer.action.lastUpdated')}
            <br />
            {formatDate(action.lastUpdated!)}
          </Grid.Item>
        </Grid.Root>
      ))}
    </>
  );
}
