import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ScenarioWizard } from '../scenarioWizard/ScenarioWizard';
import { ScenarioDrawer } from '../scenarioDrawer/ScenarioDrawer';
import { RiskMatrix } from '../riskMatrix/RiskMatrix';
import AlertBar from '../common/AlertBar/AlertBar';
import Grid from '@mui/material/Grid';
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
import { RiScStatusComponent } from '../riScInfo/riScStatus/RiScStatusComponent.tsx';
import { pluginRiScTranslationRef } from '../../utils/translations.ts';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import styles from '../common/alertBar.module.css';
import { RiScDescriptionCard } from '../riScInfo/RiScDescriptionCard.tsx';
import riscStyles from '../riScInfo/RiScSelectionCard.module.css';
import { ErrorState } from '../riScInfo/ErrorState.tsx';
import { LockedRiScView } from '../riScInfo/LockedRiScView.tsx';
import { ThreatActorsAndVulnerabilitiesCard } from '../threatActorsAndVulnerabilities/ThreatActorsAndVulnerabilitiesCard.tsx';

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
    selectedLockedRiSc,
    isFetching,
    resetResponse,
    resetRiScStatus,
    response,
    updateStatus,
    riScs,
    failedToFetchGcpCryptoKeys,
    allRiScsFailedDecryption,
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
      <Flex className={styles.alertBarBox}>
        <AlertBar
          updateStatus={updateStatus}
          response={response}
          statusText={response?.statusMessage}
        />
      </Flex>
      {scenarioWizardStep !== null ? (
        <ScenarioWizard step={scenarioWizardStep} />
      ) : (
        <>
          <RiScHeader onEditEncryption={openEditEncryptionDialog} />
          {!isFetching &&
            riScs !== null &&
            riScs.length === 0 &&
            !selectedRiSc &&
            !selectedLockedRiSc &&
            !allRiScsFailedDecryption && (
              <Flex
                justify="center"
                align="center"
                className={riscStyles.componentLayout}
              >
                <FirstRiScDialog onNewRiSc={openCreateRiScDialog} />
              </Flex>
            )}
          {/* Added isFetching condition to avoid showing error state when user e.g., adds new scorecard. */}
          {!isFetching &&
            !selectedRiSc &&
            !selectedLockedRiSc &&
            (failedToFetchGcpCryptoKeys || allRiScsFailedDecryption) && (
              <Flex
                align="center"
                justify="center"
                className={riscStyles.componentLayout}
              >
                <ErrorState onCreateNew={openCreateRiScDialog} />
              </Flex>
            )}
          {isFetching && <Spinner size={80} />}

          {selectedLockedRiSc && (
            <>
              <Grid container spacing={4}>
                <Grid size={12}>
                  <Grid container rowSpacing={3} columnSpacing={4}>
                    <Grid size={8}>
                      <Flex align="center" justify="between">
                        <Text as="h3" variant="body-large" weight="bold">
                          {t('contentHeader.multipleRiScs')}
                        </Text>
                        <CreateNewRiScButton
                          onCreateNew={openCreateRiScDialog}
                        />
                      </Flex>
                    </Grid>
                    <Grid size={8}>
                      <RiScSelectionCard />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Flex
                justify="center"
                align="center"
                className={riscStyles.componentLayout}
              >
                <LockedRiScView lockedRiSc={selectedLockedRiSc} />
              </Flex>
            </>
          )}

          <Grid container spacing={4}>
            {selectedRiSc && (
              <>
                <Grid size={12}>
                  <Grid container rowSpacing={3} columnSpacing={4}>
                    <Grid size={8}>
                      <Flex align="center" justify="between">
                        <Text as="h3" variant="body-large" weight="bold">
                          {t('contentHeader.multipleRiScs')}
                        </Text>
                        <CreateNewRiScButton
                          onCreateNew={openCreateRiScDialog}
                        />
                      </Flex>
                    </Grid>
                    <Grid size={8}>
                      <RiScSelectionCard />
                    </Grid>
                    <Grid size={4} />

                    <Grid size={8}>
                      <Flex gap="24px" direction="column">
                        <RiScDescriptionCard
                          riScWithMetadata={selectedRiSc}
                          edit={openEditRiScDialog}
                        />
                        <ScenarioTableWrapper riScWithMetadata={selectedRiSc} />
                      </Flex>
                    </Grid>

                    <Grid size={4}>
                      <Flex direction="column" gap="24px">
                        <RiScStatusComponent
                          selectedRiSc={selectedRiSc}
                          publishRiScFn={approveRiSc}
                        />
                        <RiskMatrix riScWithMetadata={selectedRiSc} />
                        <ThreatActorsAndVulnerabilitiesCard
                          scenarios={selectedRiSc.content.scenarios}
                        />
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
