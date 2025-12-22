import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import DeleteIcon from '@mui/icons-material/Delete';
import { AlertTitle } from '@mui/material';
import AlertBar from '../common/AlertBar/AlertBar';
import Box from '@mui/material/Box';
import { Button } from '@backstage/ui';
import CircularProgress from '@mui/material/CircularProgress';
import Drawer from '@mui/material/Drawer';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRiScs } from '../../contexts/RiScContext';
import { useScenario } from '../../contexts/ScenarioContext';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { FormScenario, ProcessingStatus } from '../../utils/types';
import { deleteScenario, getAlertSeverity } from '../../utils/utilityfunctions';
import { MatrixDialog } from '../riScDialog/MatrixDialog';
import { CloseConfirmation } from '../scenarioWizard/components/CloseConfirmation';
import { ActionsSection } from './components/ActionsSection';
import { DeleteScenarioConfirmation } from './components/DeleteConfirmation';
import RiskFormSection from './components/RiskFormSection';
import ScopeFormSection from './components/ScopeFormSection';
import { Text, Flex } from '@backstage/ui';
import { useBackstageContext } from '../../contexts/BackstageContext.tsx';
import styles from '../common/alertBar.module.css';
import { ScopeSection } from './components/ScopeSection.tsx';
import { RiskSection } from './components/RiskSection.tsx';

export function ScenarioDrawer() {
  const { profileInfo } = useBackstageContext();
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const [isEditing, setIsEditing] = useState(false);
  const {
    scenario,
    isDrawerOpen,
    isEditingAllowed,
    closeScenarioForm,
    submitEditedScenarioToRiSc,
    mapScenarioToFormScenario,
    mapFormScenarioToScenario,
    collapseAllActions,
  } = useScenario();
  const { selectedRiSc, updateRiSc } = useRiScs();

  const [deleteConfirmationIsOpen, setDeleteConfirmationIsOpen] =
    useState(false);

  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);

  const [isMatrixDialogOpen, setIsMatrixDialogOpen] = useState<boolean>(false);

  const { updateStatus, response } = useRiScs();

  const [currentUpdatedActionIDs, setCurrentUpdatedActionIDs] = useState<
    string[]
  >([]);

  // Used to scroll to the bottom of the drawer when the user deletes a scenario
  // via the quick edit and DeleteConfirmation
  const deleteScenarioRef = useRef<HTMLDivElement>(null);

  const formMethods = useForm<FormScenario>({
    defaultValues: mapScenarioToFormScenario(scenario),
    mode: 'onChange',
  });

  function onCancel() {
    formMethods.reset(mapScenarioToFormScenario(scenario));
    setIsEditing(false);
  }

  function handleClose() {
    closeScenarioForm();
    setIsEditing(false);
    setShowCloseConfirmation(false);
    collapseAllActions();
  }

  function onClose() {
    if (formMethods.formState.isDirty) {
      setShowCloseConfirmation(true);
    } else {
      closeScenarioForm();
      setIsEditing(false);
      collapseAllActions();
    }
  }

  const onSubmit = formMethods.handleSubmit((data: FormScenario) => {
    submitEditedScenarioToRiSc(mapFormScenarioToScenario(data), {
      onSuccess: () => {
        setCurrentUpdatedActionIDs([]);
        setIsEditing(false);
      },
      idsOfActionsToForceUpdateLastUpdatedValue: currentUpdatedActionIDs,
      profileInfo: profileInfo,
    });
  });

  function onSubmitAndCloseDialog() {
    onSubmit();
    setShowCloseConfirmation(false);

    if (deleteScenarioRef.current) {
      deleteScenarioRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }

  useEffect(() => {
    formMethods.reset(mapScenarioToFormScenario(scenario));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario]);

  return (
    <Drawer
      PaperProps={{
        sx: theme => ({
          padding: theme.spacing(4),
          width: '50%',
          gap: theme.spacing(3),
          [theme.breakpoints.down('sm')]: {
            width: '90%',
            padding: theme.spacing(2),
          },
          backgroundColor:
            theme.palette.mode === 'dark' ? '#333333' : '#f8f8f8',
        }),
      }}
      variant="temporary"
      ModalProps={{ sx: { zIndex: 100 } }}
      anchor="right"
      open={isDrawerOpen}
      onClose={onClose}
    >
      <Box
        sx={{
          display: 'flex',
          gap: '16px',
          marginLeft: 'auto',
        }}
      >
        {!isEditing && isEditingAllowed && (
          <Button
            size="medium"
            variant="primary"
            onClick={() => setIsEditing(true)}
          >
            {t('dictionary.edit')}
          </Button>
        )}
        <Button
          size="medium"
          variant="secondary"
          onClick={isEditing ? onCancel : onClose}
        >
          {t(isEditing ? 'dictionary.cancel' : 'dictionary.close')}
        </Button>
      </Box>

      {isEditing ? (
        <>
          <ScopeFormSection formMethods={formMethods} />
          <RiskFormSection
            formMethods={formMethods}
            setIsMatrixDialogOpen={setIsMatrixDialogOpen}
          />
        </>
      ) : (
        <>
          {updateStatus.isLoading && (
            <Flex className={styles.alertBarBox}>
              <AlertBar
                className={styles.alertBar}
                severity="info"
                alertProps={{
                  icon: (
                    <CircularProgress size={16} sx={{ color: 'inherit' }} />
                  ),
                }}
              >
                <>
                  <AlertTitle>{t('infoMessages.UpdateAction')}</AlertTitle>
                  <Text variant="body-large">
                    {t('infoMessages.UpdateInfoMessage')}
                  </Text>
                </>
              </AlertBar>
            </Flex>
          )}
          {currentUpdatedActionIDs.length === 0 &&
            response &&
            response.status !== ProcessingStatus.ErrorWhenFetchingRiScs && (
              <Flex className={styles.alertBarBox}>
                <AlertBar
                  className={styles.alertBar}
                  severity={getAlertSeverity(updateStatus, response)}
                >
                  <Text variant="body-large">{response?.statusMessage}</Text>
                </AlertBar>
              </Flex>
            )}
          <ScopeSection />
          <RiskSection />
        </>
      )}

      <ActionsSection formMethods={formMethods} isEditing={isEditing} />
      <Box
        sx={{
          display: 'flex',
          gap: '16px',
        }}
      >
        {isEditing && (
          <Button
            size="medium"
            variant="primary"
            onClick={onSubmit}
            isDisabled={
              !formMethods.formState.isDirty || updateStatus.isLoading
            }
          >
            {t('dictionary.save')}
            {updateStatus.isLoading && (
              <CircularProgress
                size={16}
                sx={{ marginLeft: 1, color: 'inherit' }}
              />
            )}
          </Button>
        )}
        {isEditingAllowed && (
          <div ref={deleteScenarioRef}>
            <Button
              iconStart={<DeleteIcon />}
              size="medium"
              variant="tertiary"
              onClick={() => setDeleteConfirmationIsOpen(true)}
            >
              {t('scenarioDrawer.deleteScenarioButton')}
            </Button>
          </div>
        )}
      </Box>

      <DeleteScenarioConfirmation
        isOpen={deleteConfirmationIsOpen}
        setIsOpen={setDeleteConfirmationIsOpen}
        onConfirm={() => deleteScenario(selectedRiSc, updateRiSc, scenario)}
      />
      <MatrixDialog
        open={isMatrixDialogOpen}
        close={() => setIsMatrixDialogOpen(false)}
      />
      <CloseConfirmation
        isOpen={showCloseConfirmation}
        close={handleClose}
        save={onSubmitAndCloseDialog}
      />
    </Drawer>
  );
}
