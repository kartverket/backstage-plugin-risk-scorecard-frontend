import React, { useEffect, useState } from 'react';
import { ContentHeader, SupportButton } from '@backstage/core-components';
import { useSearchParams } from 'react-router-dom';
import { ScenarioWizard } from '../scenarioWizard/ScenarioWizard';
import { ScenarioDrawer } from '../scenarioDrawer/ScenarioDrawer';
import { RiskMatrix } from '../riskMatrix/RiskMatrix';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import { getAlertSeverity } from '../../utils/utilityfunctions';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { RiScDialog, RiScDialogStates } from '../riScDialog/RiScDialog';
import { RiScInfo } from '../riScInfo/RiScInfo';
import AddCircle from '@mui/icons-material/AddCircle';
import { Spinner } from '../common/Spinner';
import { useRiScs } from '../../contexts/RiScContext';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import { ScenarioWizardSteps } from '../../contexts/ScenarioContext';
import { ScenarioTableWrapper } from '../scenarioTable/ScenarioTable';
import { SopsConfigButton } from '../common/SopsConfigButton';
import { SopsConfigDialog } from '../sopsConfigDialog/SopsConfigDialog';

export const RiScPlugin = () => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const [riScDialogState, setRiScDialogState] = useState<RiScDialogStates>(
    RiScDialogStates.Closed,
  );

  const [showSopsConfigDialog, setShowSopsConfigDialog] =
    useState<boolean>(false);

  const openCreateRiScDialog = () =>
    setRiScDialogState(RiScDialogStates.Create);
  const [hasOpenedSopsConfigDialogOnce, setHasOpenedSopsConfigDialogOnce] =
    useState(false);
  const [
    hasOpenedSopsConfigDialogGitBranchMenuOnce,
    setHasOpenedSopsConfigDialogGitBranchMenuOnce,
  ] = useState(false);
  const handleOpenSopsConfigDialogGitBranchMenu = () => {
    setInterval(() => setHasOpenedSopsConfigDialogGitBranchMenuOnce(true), 700);
  };

  const openEditRiScDialog = () => setRiScDialogState(RiScDialogStates.Edit);
  const closeRiScDialog = () => setRiScDialogState(RiScDialogStates.Closed);
  const closeSopsConfigDialog = () => setShowSopsConfigDialog(false);

  const [showSopsConfigButton, setShowSopsConfigButton] = useState(false);
  const [disableSopsConfigButton, setDisableSopsConfigButton] = useState(false);
  const handleClickSopsConfigDialogButton = () => {
    setHasOpenedSopsConfigDialogOnce(true);
    setShowSopsConfigDialog(true);
  };

  const {
    selectedRiSc,
    riScs,
    selectRiSc,
    isFetching,
    sopsConfigs,
    gcpProjectIds,
    resetResponse,
    resetRiScStatus,
    response,
    updateStatus,
    failedToFetchSopsConfig,
  } = useRiScs();

  const [searchParams] = useSearchParams();
  const scenarioWizardStep = searchParams.get(
    'step',
  ) as ScenarioWizardSteps | null;

  useEffect(() => {
    if (scenarioWizardStep !== null) {
      resetRiScStatus();
      resetResponse();
    }
  }, [resetRiScStatus, resetResponse, scenarioWizardStep]);

  useEffect(() => {
    if (
      !isFetching &&
      sopsConfigs.filter(config => config.onDefaultBranch).length < 1 &&
      !failedToFetchSopsConfig &&
      !updateStatus.isLoading &&
      riScs?.length === 0
    ) {
      setShowSopsConfigButton(true);
      setHasOpenedSopsConfigDialogOnce(true);
      setShowSopsConfigDialog(true);
    } else {
      setShowSopsConfigButton(false);
      setDisableSopsConfigButton(true);
    }
  }, [isFetching, updateStatus]);

  return (
    <>
      {response && !updateStatus.isLoading && (
        <Alert
          severity={getAlertSeverity(updateStatus)}
          sx={{ marginBottom: 2 }}
        >
          <Typography>{response.statusMessage}</Typography>
        </Alert>
      )}
      {updateStatus.isLoading && (
        <LinearProgress
          sx={{
            position: 'sticky',
            top: 0,
            margin: 2,
          }}
        />
      )}

      {scenarioWizardStep !== null ? (
        <ScenarioWizard step={scenarioWizardStep} />
      ) : (
        <>
          <ContentHeader title={t('contentHeader.title')}>
            <Grid
              sx={{
                display: 'flex',
                flexDirection: 'row',
              }}
            >
              {showSopsConfigButton && (
                <SopsConfigButton
                  disable={disableSopsConfigButton}
                  hasOpenedOnce={hasOpenedSopsConfigDialogOnce}
                  handleClick={handleClickSopsConfigDialogButton}
                  pullRequestCount={
                    sopsConfigs.filter(value => value.pullRequest !== null)
                      .length
                  }
                />
              )}
              <SupportButton />
            </Grid>
          </ContentHeader>

          {isFetching && <Spinner size={80} />}

          <Grid container spacing={4}>
            {riScs !== null && riScs.length !== 0 && (
              <Grid
                item
                xs={12}
                sm={6}
                sx={{
                  maxWidth: '600px',
                  minWidth: '300px',
                }}
              >
                <Select
                  variant="standard"
                  value={selectedRiSc?.content.title ?? ''}
                  onChange={e => selectRiSc(e.target.value)}
                  sx={{ width: '100%' }}
                >
                  {riScs.map(riSc => (
                    <MenuItem key={riSc.id} value={riSc.content.title}>
                      <ListItemText primary={riSc.content.title} />
                    </MenuItem>
                  )) ?? []}
                </Select>
              </Grid>
            )}

            {!isFetching &&
              sopsConfigs.find(value => value.onDefaultBranch) !==
                undefined && (
                <Grid item xs>
                  <Button
                    startIcon={<AddCircle />}
                    variant="text"
                    color="primary"
                    onClick={openCreateRiScDialog}
                    sx={{
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
                  <RiScInfo riSc={selectedRiSc} edit={openEditRiScDialog} />
                </Grid>
                <Grid item xs md={7} lg={8}>
                  <ScenarioTableWrapper riSc={selectedRiSc} />
                </Grid>
                <Grid item xs md={5} lg={4}>
                  <RiskMatrix riSc={selectedRiSc.content} />
                </Grid>
              </>
            )}
          </Grid>
        </>
      )}

      {riScDialogState !== RiScDialogStates.Closed && (
        <RiScDialog onClose={closeRiScDialog} dialogState={riScDialogState} />
      )}

      {showSopsConfigDialog && (
        <SopsConfigDialog
          onClose={closeSopsConfigDialog}
          showDialog={showSopsConfigDialog}
          sopsConfigs={sopsConfigs}
          gcpProjectIds={gcpProjectIds}
          hasOpenedGitBranchMenuOnce={
            hasOpenedSopsConfigDialogGitBranchMenuOnce
          }
          handleOpenGitBranchMenuFirst={handleOpenSopsConfigDialogGitBranchMenu}
        />
      )}

      {!scenarioWizardStep && <ScenarioDrawer />}
    </>
  );
};
