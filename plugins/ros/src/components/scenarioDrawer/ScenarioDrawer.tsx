import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { useScenario } from '../../contexts/ScenarioContext';
import { RiskSection } from './components/RiskSection';
import { ActionsSection } from './components/ActionsSection';
import DeleteIcon from '@mui/icons-material/Delete';
import { DeleteConfirmation } from './components/DeleteConfirmation';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { ScopeSection } from './components/ScopeSection';
import { useForm } from 'react-hook-form';
import { ProcessingStatus, Scenario } from '../../utils/types';
import RiskFormSection from './components/RiskFormSection';
import ActionFormSection from './components/ActionFormSection';
import ScopeFormSection from './components/ScopeFormSection';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import { useRiScs } from '../../contexts/RiScContext';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { getAlertSeverity } from '../../utils/utilityfunctions';
import Typography from '@mui/material/Typography';
import { MatrixDialog } from '../riScDialog/MatrixDialog';

export const ScenarioDrawer = () => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const [isEditing, setIsEditing] = useState(false);
  const {
    scenario,
    isDrawerOpen,
    closeScenarioForm,
    submitEditedScenarioToRiSc,
  } = useScenario();

  const [deleteConfirmationIsOpen, setDeleteConfirmationIsOpen] =
    useState(false);

  const [matrixDialogState, setMatrixDialogState] = useState<
    keyof Pick<Scenario, 'risk' | 'remainingRisk'> | 'closed'
  >('closed');

  const { riScUpdateStatus, response } = useRiScs();

  const formMethods = useForm<Scenario>({
    defaultValues: scenario,
    mode: 'onBlur',
  });

  const onCancel = () => {
    formMethods.reset(scenario);
    setIsEditing(false);
  };

  const onClose = () => {
    closeScenarioForm();
    setIsEditing(false);
  };

  const onSubmit = formMethods.handleSubmit((data: Scenario) => {
    submitEditedScenarioToRiSc(data, () => setIsEditing(false));
  });

  useEffect(() => {
    formMethods.reset(scenario);
  }, [scenario, formMethods]);

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
        {!isEditing && (
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
            setMatrixDialogState={setMatrixDialogState}
          />
          <ActionFormSection formMethods={formMethods} />
        </>
      ) : (
        <>
          <ScopeSection />
          <RiskSection />
          <ActionsSection />
        </>
      )}
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
            disabled={
              !formMethods.formState.isDirty || riScUpdateStatus.isLoading
            }
          >
            {t('dictionary.save')}
            {riScUpdateStatus.isLoading && (
              <CircularProgress
                size={16}
                sx={{ marginLeft: 1, color: 'inherit' }}
              />
            )}
          </Button>
        )}
        <Button
          startIcon={<DeleteIcon />}
          variant="text"
          color="primary"
          onClick={() => setDeleteConfirmationIsOpen(true)}
          sx={{ marginLeft: 'auto' }}
        >
          {t('scenarioDrawer.deleteScenarioButton')}
        </Button>
      </Box>

      {response &&
        response.status !== ProcessingStatus.ErrorWhenFetchingRiScs && (
          <Alert severity={getAlertSeverity(response.status)}>
            <Typography>{response.statusMessage}</Typography>
          </Alert>
        )}

      <DeleteConfirmation
        deleteConfirmationIsOpen={deleteConfirmationIsOpen}
        setDeleteConfirmationIsOpen={setDeleteConfirmationIsOpen}
      />
      <MatrixDialog
        open={matrixDialogState !== 'closed'}
        close={() => setMatrixDialogState('closed')}
      />
    </Drawer>
  );
};
