import React, { useEffect, useState } from 'react';
import { Button, Grid, LinearProgress, Typography } from '@material-ui/core';
import { ContentHeader, SupportButton } from '@backstage/core-components';
import { useSearchParams } from 'react-router-dom';
import {
  ScenarioWizard,
  ScenarioWizardSteps,
} from '../scenarioWizard/ScenarioWizard';
import { ScenarioDrawer } from '../scenarioDrawer/ScenarioDrawer';
import { RiskMatrix } from '../riskMatrix/RiskMatrix';
import { ScenarioTable } from '../scenarioTable/ScenarioTable';
import Alert from '@mui/material/Alert';
import { getAlertSeverity } from '../../utils/utilityfunctions';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { RiScDialog, RiScDialogStates } from '../riScDialog/RiScDialog';
import { RiScInfo } from '../riScInfo/RiScInfo';
import AddCircle from '@material-ui/icons/AddCircle';
import { useLinearProgressStyle } from './linearProgressStyle';
import { Spinner } from '../common/Spinner';
import { Dropdown } from '../common/Dropdown';
import { useRiScs } from '../../contexts/RiScContext';

export const RiScPlugin = () => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const { linearProgress } = useLinearProgressStyle();

  const [RiScDialogState, setRiScDialogState] = useState<RiScDialogStates>(
    RiScDialogStates.Closed,
  );

  const openCreateRiScDialog = () =>
    setRiScDialogState(RiScDialogStates.Create);
  const openEditRiScDialog = () => setRiScDialogState(RiScDialogStates.Edit);
  const closeRiScDialog = () => setRiScDialogState(RiScDialogStates.Closed);

  const {
    selectedRiSc,
    riScs,
    selectRiSc,
    isFetching,
    createNewRiSc,
    updateRiSc,
    updateRiScStatus,
    resetRiScStatus,
    approveRiSc,
    response,
    isRequesting,
  } = useRiScs();

  const [searchParams] = useSearchParams();
  const scenarioWizardStep =
    (searchParams.get('step') as ScenarioWizardSteps | null) || null;

  useEffect(() => {
    if (scenarioWizardStep !== null) resetRiScStatus();
  }, [resetRiScStatus, scenarioWizardStep]);

  return (
    <>
      {response && (
        <Alert severity={getAlertSeverity(response.status)}>
          <Typography>{response.statusMessage}</Typography>
        </Alert>
      )}
      {isRequesting && <LinearProgress className={linearProgress} />}

      {scenarioWizardStep !== null ? (
        <ScenarioWizard
          step={scenarioWizardStep}
          isFetching={isFetching}
          updateStatus={updateRiScStatus}
        />
      ) : (
        <>
          <ContentHeader title={t('contentHeader.title')}>
            <SupportButton />
          </ContentHeader>

          {isFetching && <Spinner size={80} />}

          <Grid container spacing={4}>
            {riScs !== null && riScs.length !== 0 && (
              <Grid
                item
                xs={12}
                sm={6}
                style={{
                  maxWidth: '600px',
                  minWidth: '300px',
                }}
              >
                <Dropdown<string>
                  options={riScs.map(riSc => riSc.content.title) ?? []}
                  selectedValues={selectedRiSc?.content.title ?? ''}
                  handleChange={title => selectRiSc(title)}
                  variant="standard"
                />
              </Grid>
            )}

            {!isFetching && (
              <Grid item xs>
                <Button
                  startIcon={<AddCircle />}
                  variant="text"
                  color="primary"
                  onClick={openCreateRiScDialog}
                  style={{
                    minWidth: '205px',
                  }}
                >
                  {t('contentHeader.createNewButton')}
                </Button>
              </Grid>
            )}

            {selectedRiSc && (
              <>
                <Grid item xs={12}>
                  <RiScInfo
                    riSc={selectedRiSc}
                    approveRiSc={approveRiSc}
                    edit={openEditRiScDialog}
                  />
                </Grid>
                <Grid item xs md={7} lg={8}>
                  <ScenarioTable riSc={selectedRiSc.content} />
                </Grid>
                <Grid item xs md={5} lg={4}>
                  <RiskMatrix riSc={selectedRiSc.content} />
                </Grid>
              </>
            )}
          </Grid>
        </>
      )}

      {RiScDialogState !== RiScDialogStates.Closed && (
        <RiScDialog
          onClose={closeRiScDialog}
          createNewRiSc={createNewRiSc}
          updateRiSc={updateRiSc}
          riSc={selectedRiSc}
          dialogState={RiScDialogState}
        />
      )}

      {!scenarioWizardStep && <ScenarioDrawer />}
    </>
  );
};
