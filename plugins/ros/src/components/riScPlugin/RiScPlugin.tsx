import { useEffect, useState } from 'react';
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
import { ScenarioWizardSteps } from '../../contexts/ScenarioContext';
import { ScenarioTableWrapper } from '../scenarioTable/ScenarioTable';
import { Delete, Settings } from '@mui/icons-material';
import { RiScStatus } from '../../utils/types';
import { FeedbackDialog } from './FeedbackDialog.tsx';

export function RiScPlugin() {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const [riScDialogState, setRiScDialogState] = useState<RiScDialogStates>(
    RiScDialogStates.Closed,
  );

  function openCreateRiScDialog() {
    return setRiScDialogState(RiScDialogStates.Create);
  }

  function openDeleteRiScDialog() {
    return setRiScDialogState(RiScDialogStates.Delete);
  }

  function openEditRiScDialog() {
    return setRiScDialogState(RiScDialogStates.EditRiscInfo);
  }

  function openEditEncryptionDialog() {
    return setRiScDialogState(RiScDialogStates.EditEncryption);
  }

  function closeRiScDialog() {
    return setRiScDialogState(RiScDialogStates.Closed);
  }

  const {
    selectedRiSc,
    isFetching,
    resetResponse,
    resetRiScStatus,
    response,
    updateStatus,
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
              <SupportButton />
              <FeedbackDialog />
            </Grid>
          </ContentHeader>

          {isFetching && <Spinner size={80} />}

          <Grid container spacing={4}>
            {!isFetching && (
              <Grid item xs>
                <Button
                  startIcon={<AddCircle />}
                  variant="text"
                  color="success"
                  onClick={openCreateRiScDialog}
                  sx={{
                    alignItems: 'right',
                  }}
                >
                  {t('contentHeader.createNewButton')}
                </Button>
                {selectedRiSc &&
                  selectedRiSc.status !== RiScStatus.DeletionDraft &&
                  selectedRiSc.status !==
                    RiScStatus.DeletionSentForApproval && (
                    <>
                      <Button
                        startIcon={<Delete />}
                        variant="text"
                        color="error"
                        onClick={openDeleteRiScDialog}
                      >
                        {t('contentHeader.deleteButton')}
                      </Button>
                      <Button
                        startIcon={<Settings />}
                        variant="text"
                        color="primary"
                        onClick={openEditEncryptionDialog}
                      >
                        {t('contentHeader.editEncryption')}
                      </Button>
                    </>
                  )}
              </Grid>
            )}

            {selectedRiSc && (
              <>
                <Grid item xs={12}>
                  <RiScInfo
                    riScWithMetadata={selectedRiSc}
                    edit={openEditRiScDialog}
                  />
                </Grid>
                <Grid item xs md={7} lg={8}>
                  <ScenarioTableWrapper riScWithMetadata={selectedRiSc} />
                </Grid>
                <Grid item xs md={5} lg={4}>
                  <RiskMatrix riScWithMetadata={selectedRiSc} />
                </Grid>
              </>
            )}
          </Grid>
        </>
      )}

      {riScDialogState !== RiScDialogStates.Closed && (
        <RiScDialog onClose={closeRiScDialog} dialogState={riScDialogState} />
      )}

      {!scenarioWizardStep && <ScenarioDrawer />}
    </>
  );
}
