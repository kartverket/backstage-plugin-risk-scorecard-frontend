import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import DeleteIcon from '@mui/icons-material/Delete';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRiScs } from '../../contexts/RiScContext';
import { useScenario } from '../../contexts/ScenarioContext';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { FormScenario, ProcessingStatus } from '../../utils/types';
import { getAlertSeverity } from '../../utils/utilityfunctions';
import { MatrixDialog } from '../riScDialog/MatrixDialog';
import { CloseConfirmation } from '../scenarioWizard/components/CloseConfirmation';
import { ActionsSection } from './components/ActionsSection';
import { DeleteConfirmation } from './components/DeleteConfirmation';
import RiskFormSection from './components/RiskFormSection';
import { RiskSection } from './components/RiskSection';
import ScopeFormSection from './components/ScopeFormSection';
import { ScopeSection } from './components/ScopeSection';

export function ScenarioDrawer() {
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

  const [deleteConfirmationIsOpen, setDeleteConfirmationIsOpen] =
    useState(false);

  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);

  const [isMatrixDialogOpen, setIsMatrixDialogOpen] = useState<boolean>(false);

  const { updateStatus, response } = useRiScs();

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
    submitEditedScenarioToRiSc(mapFormScenarioToScenario(data), () =>
      setIsEditing(false),
    );
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
          <ScopeSection />
          <RiskSection />
        </>
      )}
      <ActionsSection
        formMethods={formMethods}
        isEditing={isEditing}
        onSubmit={onSubmit}
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

      {response &&
        response.status !== ProcessingStatus.ErrorWhenFetchingRiScs && (
          <Alert severity={getAlertSeverity(updateStatus)}>
            <Typography>{response.statusMessage}</Typography>
          </Alert>
        )}

      <DeleteConfirmation
        isOpen={deleteConfirmationIsOpen}
        setIsOpen={setDeleteConfirmationIsOpen}
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
