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
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import { ScenarioWizardSteps } from '../../contexts/ScenarioContext';
import { ScenarioTableWrapper } from '../scenarioTable/ScenarioTable';
import { Delete, Settings } from '@mui/icons-material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import { useAuthenticatedFetch } from '../../utils/hooks.ts';
import { RiScStatus } from '../../utils/types';


export function RiScPlugin() {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
    const { postFeedback } = useAuthenticatedFetch();

  const [riScDialogState, setRiScDialogState] = useState<RiScDialogStates>(
    RiScDialogStates.Closed,
  );

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);


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
    riScs,
    selectRiSc,
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
              <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setFeedbackOpen(true)}
                  sx={{ borderRadius: '6px', fontWeight: 'bold'}}
              >
                Tilbakemelding
              </Button>
            </Grid>
          </ContentHeader>

          {isFetching && <Spinner size={80} />}

          <Grid container spacing={4}>
            {riScs !== null && riScs.length !== 0 && (
              <Grid item xs={12} sm={6}>
                <Select
                  variant="standard"
                  value={selectedRiSc?.id ?? ''}
                  onChange={e => selectRiSc(e.target.value)}
                  sx={{ width: '100%' }}
                >
                  {riScs.map(riSc => (
                    <MenuItem key={riSc.id} value={riSc.id}>
                      <ListItemText primary={riSc.content.title} />
                    </MenuItem>
                  )) ?? []}
                </Select>
              </Grid>
            )}

            {!isFetching && (
              <Grid item xs>
                <Button
                  startIcon={<AddCircle />}
                  variant="text"
                  color="success"
                  onClick={openCreateRiScDialog}
                  sx={{
                    minWidth: '205px',
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
      <Dialog open={feedbackOpen} onClose={() => {
        setFeedbackOpen(false);
        setFeedbackSent(false);
      }} fullWidth maxWidth="sm">
        {!feedbackSent && <DialogTitle>Send tilbakemelding</DialogTitle>}
        <DialogContent>
          {feedbackSent ? (
              <Typography align="center" variant="h4" sx={{ py: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                Takk for tilbakemeldingen
              </Typography>
          ) : (
              <TextField
                  margin="dense"
                  label="Din tilbakemelding"
                  fullWidth
                  multiline
                  minRows={4}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
              />
          )}
        </DialogContent>
        <DialogActions>
          {feedbackSent ? (
              <Button onClick={() => {
                setFeedbackOpen(false);
                setFeedbackSent(false);
                setFeedbackText('');
              }}>
                Lukk
              </Button>
          ) : (
              <>
                <Button onClick={() => setFeedbackOpen(false)}>Avbryt</Button>
                <Button
                    onClick={async () => {
                      await postFeedback(feedbackText);
                      setFeedbackSent(true);
                    }}
                    disabled={!feedbackText.trim()}
                    variant="contained"
                >
                  Send
                </Button>
              </>
          )}
        </DialogActions>
      </Dialog>


      {!scenarioWizardStep && <ScenarioDrawer />}
    </>
  );
}
