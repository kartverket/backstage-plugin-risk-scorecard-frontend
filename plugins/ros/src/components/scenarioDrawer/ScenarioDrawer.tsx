import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import DeleteIcon from '@mui/icons-material/Delete';
import Alert from '@mui/material/Alert';
import { AlertTitle } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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
import { RiskSection } from './components/RiskSection';
import ScopeFormSection from './components/ScopeFormSection';
import { ScopeSection } from './components/ScopeSection';
import { useCallback } from 'react';
import { useDebounce } from '../../utils/hooks';
import { Text, Flex } from '@backstage/ui';
import { getAlertStyle } from './scenarioDrawerComponents';
import { useBackstageContext } from '../../contexts/BackstageContext.tsx';

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

  const debounceCallback = useCallback(
    (updatedIDs: string[]) => {
      const indexOfAction = (ID: string) => {
        return scenario.actions.findIndex(a => a.ID === ID);
      };
      if (updatedIDs.length === 0) return;

      const formValues = formMethods.getValues();
      const updatedScenario = {
        ...scenario,
        actions: scenario.actions.map(a =>
          updatedIDs.includes(a.ID)
            ? {
                ...a,
                status:
                  formValues.actions?.[indexOfAction(a.ID)]?.status ?? a.status,
              }
            : a,
        ),
      };
      submitEditedScenarioToRiSc(updatedScenario, {
        idsOfActionsToForceUpdateLastUpdatedValue: updatedIDs,
        profileInfo: profileInfo,
      });
      setCurrentUpdatedActionIDs([]);
    },
    [scenario, formMethods, submitEditedScenarioToRiSc],
  );
  const { flush } = useDebounce(
    currentUpdatedActionIDs,
    6000,
    debounceCallback,
  );

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
      flush();
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
            color="primary"
            variant="contained"
            onClick={() => setIsEditing(true)}
          >
            {t('dictionary.edit')}
          </Button>
        )}
        <Button
          variant="outlined"
          color="primary"
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
            <Flex
              style={{
                position: 'fixed',
                width: '45%',
                zIndex: 20,
                border: '1px solid #439CCD',
                borderRadius: '4px',
              }}
            >
              <Alert
                severity="info"
                style={{
                  width: '100%',
                }}
                icon={<CircularProgress size={16} sx={{ color: 'inherit' }} />}
              >
                <AlertTitle>{t('infoMessages.UpdateAction')}</AlertTitle>
                <Text variant="body-large">
                  {' '}
                  {t('infoMessages.UpdateInfoMessage')}
                </Text>
              </Alert>
            </Flex>
          )}
          {currentUpdatedActionIDs.length === 0 &&
            response &&
            response.status !== ProcessingStatus.ErrorWhenFetchingRiScs && (
              <Flex
                style={{
                  position: 'fixed',
                  ...getAlertStyle(getAlertSeverity(updateStatus)),
                }}
              >
                <Alert
                  severity={getAlertSeverity(updateStatus)}
                  style={{ width: '100%' }}
                >
                  <Text variant="body-large">{response.statusMessage}</Text>
                </Alert>
              </Flex>
            )}
          <ScopeSection />
          <RiskSection />
        </>
      )}
      <ActionsSection
        formMethods={formMethods}
        isEditing={isEditing}
        onSubmit={onSubmit}
        setCurrentUpdatedActionIDs={setCurrentUpdatedActionIDs}
      />
      <Box
        sx={{
          display: 'flex',
          gap: '16px',
        }}
      >
        {isEditing && (
          <Button
            color="primary"
            variant="contained"
            onClick={onSubmit}
            disabled={!formMethods.formState.isDirty || updateStatus.isLoading}
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
              startIcon={<DeleteIcon />}
              variant="text"
              color="primary"
              onClick={() => setDeleteConfirmationIsOpen(true)}
              sx={{ marginLeft: 'auto' }}
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
