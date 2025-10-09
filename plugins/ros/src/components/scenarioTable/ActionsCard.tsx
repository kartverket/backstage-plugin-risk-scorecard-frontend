import { Grid } from '@backstage/ui';
import { Action } from '../../utils/types';
import {
  formatDate,
  UpdatedStatusEnumType,
} from '../../utils/utilityfunctions';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { Divider } from '@mui/material';

type ActionsCardProps = {
  filteredData: (Action & { updatedStatus: UpdatedStatusEnumType })[];
};

export function ActionsCard(props: ActionsCardProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

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
