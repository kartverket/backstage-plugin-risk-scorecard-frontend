import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ScenarioWizard } from '../scenarioWizard/ScenarioWizard';
import { ScenarioDrawer } from '../scenarioDrawer/ScenarioDrawer';
import { RiskMatrix } from '../riskMatrix/RiskMatrix';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import { getAlertSeverity } from '../../utils/utilityfunctions';
import { RiScDialog, RiScDialogStates } from '../riScDialog/RiScDialog';
import { Spinner } from '../common/Spinner';
import { useRiScs } from '../../contexts/RiScContext';
import { ScenarioWizardSteps } from '../../contexts/ScenarioContext';
import { RiScHeader } from '../riScHeader/RiScHeader.tsx';
import { ScenarioTableWrapper } from '../scenarioTable/ScenarioTableWrapper.tsx';
import { FirstRiScDialog } from '../riScInfo/FirstRiScDialog.tsx';
import { Flex, Text, Button } from '@backstage/ui';
import { RiScSelectionCard } from '../riScInfo/RiScSelectionCard.tsx';
import { RiScStatusComponent } from '../riScInfo/riScStatus/RiScStatusComponent.tsx';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

export function RiScPlugin() {
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
    riScs,
  } = useRiScs();

  const { t } = useTranslationRef(pluginRiScTranslationRef);

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
          <Text variant="body-large">{response.statusMessage}</Text>
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
          <RiScHeader onEditEncryption={openEditEncryptionDialog} />
          {!isFetching &&
            riScs !== null &&
            riScs.length === 0 &&
            !selectedRiSc && (
              <Flex
                justify="center"
                align="center"
                style={{
                  height: '60%',
                }}
              >
                <FirstRiScDialog onNewRiSc={openCreateRiScDialog} />
              </Flex>
            )}
          {isFetching && <Spinner size={80} />}

          <Grid container spacing={4}>
            {selectedRiSc && (
              <>
                <Grid item xs={12}>
                  <Grid container rowSpacing={2} columnSpacing={4}>
                    <Grid item xs={6}>
                      <Flex align="center" justify="between">
                        <Text as="h3" variant="body-large" weight="bold">
                          {t('contentHeader.multipleRiScs')}
                        </Text>
                        <Button
                          iconStart={<i className="ri-add-circle-line" />}
                          onClick={openCreateRiScDialog}
                          variant="tertiary"
                          style={{ color: '#1F5492', fontSize: '16px' }}
                        >
                          {t('contentHeader.createNewButton')}
                        </Button>
                      </Flex>
                    </Grid>

                    <Grid item xs={6} />

                    <Grid item xs={6}>
                      <RiScSelectionCard
                        riScWithMetadata={selectedRiSc}
                        edit={openEditRiScDialog}
                        onCreateNew={openCreateRiScDialog}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <RiScStatusComponent
                        selectedRiSc={selectedRiSc}
                        publishRiScFn={openCreateRiScDialog}
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12} lg={8}>
                  <ScenarioTableWrapper riScWithMetadata={selectedRiSc} />
                </Grid>
                <Grid item xs={12} lg={4}>
                  <RiskMatrix riScWithMetadata={selectedRiSc} />
                </Grid>
              </>
            )}
          </Grid>
        </>
      )}

      {riScDialogState !== RiScDialogStates.Closed && (
        <RiScDialog
          onClose={closeRiScDialog}
          dialogState={riScDialogState}
          onDelete={openDeleteRiScDialog}
        />
      )}

      {!scenarioWizardStep && <ScenarioDrawer />}
    </>
  );
}
