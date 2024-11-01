import React, {useEffect, useRef, useState} from 'react';
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
import {InitialRiScStatus, useRiScs} from '../../contexts/RiScContext';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import { ScenarioWizardSteps } from '../../contexts/ScenarioContext';
import { ScenarioTableWrapper } from '../scenarioTable/ScenarioTable';
import { CircularProgressWithLabel } from './CicularProgressWithLabel';

interface LoadingProgressInfo {
  progressValue: number;
  progressText: string;
}

export const RiScPlugin = () => {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const [riScDialogState, setRiScDialogState] = useState<RiScDialogStates>(
    RiScDialogStates.Closed,
  );

  const [
    loadingProgressGenerateInitialRiSc,
    setLoadingProgressGenerateInitialRiSc,
  ] = useState<LoadingProgressInfo>({
    progressValue: 0,
    progressText: `${t('loadingProgressInitialRiSc.0')}`,
  });
  const loadingProgressref = useRef(loadingProgressGenerateInitialRiSc)

  const openCreateRiScDialog = () =>
    setRiScDialogState(RiScDialogStates.Create);
  const openEditRiScDialog = () => setRiScDialogState(RiScDialogStates.Edit);
  const closeFromScratchRiScDialog = () =>
    setRiScDialogState(RiScDialogStates.Closed);
  const closeGenerateInitialRiScDialog = () => {
    setRiScDialogState(RiScDialogStates.Closed);
  };

  const {
    selectedRiSc,
    riScs,
    selectRiSc,
    isFetching,
    isLoadingGenerateInitialRiSc,
    resetResponse,
    resetRiScStatus,
    response,
    riScUpdateStatus,
    pollGenerateInitialRiScStatus,
    initialRiScStatus,
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

  // '0': 'Scheduling initial RiSc generation',
  //     '10': 'Automatic RiSc generation is scheduled',
  //     '20': 'Generating RiSc based on security metrics',
  //     '30': 'Generating RiSc based on security metrics',
  //     '40': 'Generating RiSc based on security metrics',
  //     '50': 'Generating RiSc based on security metrics',
  //     '60': 'Generating RiSc based on security metrics',
  //     '70': 'RiSc generation finished',
  //     '80': 'Encrypting RiSc',
  //     '90': 'Writing to GitHub',
  //     '100': 'Done',
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const fetchInitialRiScStatus = async () => {
      pollGenerateInitialRiScStatus()
      switch (initialRiScStatus) {
        case InitialRiScStatus.Scheduled: {
          switch (loadingProgressref.current.progressValue) {
            case 0: {
              loadingProgressref.current = {
                progressValue: 10,
                progressText: t(`loadingProgressInitialRiSc.10`),
              }
              setLoadingProgressGenerateInitialRiSc(loadingProgressref.current);
              return
            }
            case 10: {
              loadingProgressref.current = {
                progressValue: 20,
                progressText: t(`loadingProgressInitialRiSc.20`),
              }
              setLoadingProgressGenerateInitialRiSc(loadingProgressref.current);
              return
            }
            case 20: {
              loadingProgressref.current = {
                progressValue: 30,
                progressText: t(`loadingProgressInitialRiSc.30`),
              }
              setLoadingProgressGenerateInitialRiSc(loadingProgressref.current);
              return
            }
            case 30: {
              loadingProgressref.current = {
                progressValue: 40,
                progressText: t(`loadingProgressInitialRiSc.40`),
              }
              setLoadingProgressGenerateInitialRiSc(loadingProgressref.current);
              return
            }
            case 40: {
              loadingProgressref.current = {
                progressValue: 50,
                progressText: t(`loadingProgressInitialRiSc.50`),
              }
              setLoadingProgressGenerateInitialRiSc(loadingProgressref.current);
              return
            }
            case 50: {
              loadingProgressref.current = {
                progressValue: 60,
                progressText: t(`loadingProgressInitialRiSc.60`),
              }
              setLoadingProgressGenerateInitialRiSc(loadingProgressref.current);
              return
            }
            case 60: {
              loadingProgressref.current = {
                progressValue: 70,
                progressText: t(`loadingProgressInitialRiSc.70`),
              }
              setLoadingProgressGenerateInitialRiSc(loadingProgressref.current);
              return
            }
            case 70: {
              loadingProgressref.current = {
                progressValue: 80,
                progressText: t(`loadingProgressInitialRiSc.80`),
              }
              setLoadingProgressGenerateInitialRiSc(loadingProgressref.current);
              return
            }
          }
          return
        }
        case InitialRiScStatus.Commiting: {
          loadingProgressref.current = {
            progressValue: 90,
            progressText: t(`loadingProgressInitialRiSc.90`),
          }
          setLoadingProgressGenerateInitialRiSc(loadingProgressref.current);
          return
        }
      }
    }

    if (isLoadingGenerateInitialRiSc) {
      intervalId = setInterval(fetchInitialRiScStatus, 1000);
    } else if (intervalId) {
      clearInterval(intervalId)
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    }
  }, [isLoadingGenerateInitialRiSc]);

  return (
    <>
      {response && !riScUpdateStatus.isLoading && (
        <Alert
          severity={getAlertSeverity(riScUpdateStatus)}
          sx={{ marginBottom: 2 }}
        >
          <Typography>{response.statusMessage}</Typography>
        </Alert>
      )}
      {riScUpdateStatus.isLoading && (
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
            <SupportButton />
          </ContentHeader>

          {isFetching && <Spinner size={80} />}
          {isLoadingGenerateInitialRiSc && (
            <CircularProgressWithLabel
              value={loadingProgressGenerateInitialRiSc.progressValue}
              text={loadingProgressGenerateInitialRiSc.progressText}
              size={80}
            />
          )}
          <Grid container spacing={4}>
            {((riScs !== null && riScs.length !== 0) && !isLoadingGenerateInitialRiSc)  && (
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

            {!isFetching && !isLoadingGenerateInitialRiSc && (
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
        <RiScDialog
          onCloseFromScratch={closeFromScratchRiScDialog}
          onCloseGenerateInitial={closeGenerateInitialRiScDialog}
          dialogState={riScDialogState}
        />
      )}

      {!scenarioWizardStep && <ScenarioDrawer />}
    </>
  );
};
