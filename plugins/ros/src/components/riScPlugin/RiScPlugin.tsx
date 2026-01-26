import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ScenarioWizard } from '../scenarioWizard/ScenarioWizard';
import { ScenarioDrawer } from '../scenarioDrawer/ScenarioDrawer';
import { RiskMatrix } from '../riskMatrix/RiskMatrix';
import AlertBar from '../common/AlertBar/AlertBar';
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
import { Flex, Text } from '@backstage/ui';
import { CreateNewRiScButton } from '../riScInfo/CreateNewRiScButton.tsx';
import { RiScSelectionCard } from '../riScInfo/RiScSelectionCard.tsx';
import { RiScRelationComponent } from '../riScInfo/RiScRelationComponent.tsx';
import { RiScStatusComponent } from '../riScInfo/riScStatus/RiScStatusComponent.tsx';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import styles from '../common/alertBar.module.css';
import { RiScDescriptionCard } from '../riScInfo/RiScDescriptionCard.tsx';
import riscStyles from '../riScInfo/RiScSelectionCard.module.css';
import { ErrorState } from '../riScInfo/ErrorState.tsx';

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
    approveRiSc,
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
        <Flex className={styles.alertBarBox}>
          <AlertBar
            severity={getAlertSeverity(updateStatus, response)}
            className={styles.alertBar}
          >
            <Text variant="body-large">{response.statusMessage}</Text>
          </AlertBar>
        </Flex>
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
                className={riscStyles.componentLayout}
              >
                <FirstRiScDialog onNewRiSc={openCreateRiScDialog} />
              </Flex>
            )}
          {!isFetching && riScs === null && (
            <Flex
              align="center"
              justify="center"
              className={riscStyles.componentLayout}
            >
              <ErrorState />
            </Flex>
          )}
          {isFetching && <Spinner size={80} />}

          <Grid container spacing={4}>
            {selectedRiSc && (
              <>
                <Grid item xs={12}>
                  <Grid container rowSpacing={3} columnSpacing={4}>
                    <Grid item xs={8}>
                      <Flex align="center" justify="between">
                        <Text as="h3" variant="body-large" weight="bold">
                          {t('contentHeader.multipleRiScs')}
                        </Text>
                        <CreateNewRiScButton
                          onCreateNew={openCreateRiScDialog}
                        />
                      </Flex>
                    </Grid>
                    <Grid item xs={8}>
                      <RiScSelectionCard />
                    </Grid>
                    <Grid item xs={4} />

                    <Grid item xs={8}>
                      <Flex gap="24px" direction="column">
                        <RiScDescriptionCard
                          riScWithMetadata={selectedRiSc}
                          edit={openEditRiScDialog}
                        />
                        <ScenarioTableWrapper riScWithMetadata={selectedRiSc} />
                      </Flex>
                    </Grid>

                    <Grid item xs={4}>
                      <Flex direction="column" gap="24px">
                        <RiScStatusComponent
                          selectedRiSc={selectedRiSc}
                          publishRiScFn={approveRiSc}
                        />
                        <RiScRelationComponent />
                        <RiskMatrix riScWithMetadata={selectedRiSc} />
                      </Flex>
                    </Grid>
                  </Grid>
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
