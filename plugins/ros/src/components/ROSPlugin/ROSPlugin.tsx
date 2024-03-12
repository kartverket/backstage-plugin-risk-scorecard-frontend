import React, { useState } from 'react';
import { Button, Grid, Typography } from '@material-ui/core';
import {
  Content,
  ContentHeader,
  SupportButton,
} from '@backstage/core-components';
import { useFetchRoses, useScenarioDrawer } from '../utils/hooks';
import { ScenarioTable } from '../ScenarioTable/ScenarioTable';
import { ROSDialog } from '../ROSDialog/ROSDialog';
import { ScenarioDrawer } from '../ScenarioDrawer/ScenarioDrawer';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import { ROSStatusComponent } from '../ROSStatus/ROSStatusComponent';
import { RiskMatrix } from '../riskMatrix/RiskMatrix';
import { Dropdown } from '../ScenarioDrawer/Dropdown';
import Alert from '@mui/material/Alert';
import { getAlertSeverity } from '../utils/utilityfunctions';
import CircularProgress from '@mui/material/CircularProgress';
import { useLoadingStyles } from './rosPluginStyle';
import { ScenarioContext } from './ScenarioContext';
import { useFontStyles } from '../ScenarioDrawer/style';
import { useParams } from 'react-router';

export const ROSPlugin = () => {
  const params = useParams();

  const [newROSDialogIsOpen, setNewROSDialogIsOpen] = useState<boolean>(false);

  const {
    selectedROS,
    roses,
    selectRos,
    isFetching,
    createNewROS,
    updateROS,
    approveROS,
    response,
  } = useFetchRoses(params.rosId);

  const scenario = useScenarioDrawer(
    selectedROS?.content ?? null,
    updateROS,
    params.scenarioId,
  );

  const classes = useLoadingStyles();
  const { button } = useFontStyles();

  return (
    <>
      <ScenarioContext.Provider value={scenario}>
        {response && (
          <Grid item xs={12}>
            <Alert severity={getAlertSeverity(response.status)}>
              <Typography>{response.statusMessage}</Typography>
            </Alert>
          </Grid>
        )}
        <Content>
          <ContentHeader title="Risiko- og sårbarhetsanalyse">
            <SupportButton>Kul plugin ass!</SupportButton>
          </ContentHeader>

          {isFetching && (
            <div className={classes.container}>
              <Grid item>
                <CircularProgress className={classes.spinner} size={80} />
              </Grid>
            </div>
          )}

          <Grid container spacing={3}>
            {roses !== null && roses.length !== 0 && (
              <Grid item xs={3}>
                <Dropdown<string>
                  options={roses.map(ros => ros.title) ?? []}
                  selectedValues={selectedROS?.title ?? ''}
                  handleChange={title => selectRos(title)}
                  variant="standard"
                />
              </Grid>
            )}

            {!isFetching && (
              <Grid item xs={9}>
                <Button
                  startIcon={<AddCircleOutlineIcon />}
                  variant="text"
                  color="primary"
                  onClick={() => setNewROSDialogIsOpen(true)}
                  className={button}
                >
                  Opprett ny analyse
                </Button>
              </Grid>
            )}

            {selectedROS && (
              <>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">
                    Omfang: {selectedROS.content.omfang}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <ROSStatusComponent
                    selectedROS={selectedROS}
                    publishRosFn={approveROS}
                  />
                </Grid>

                <Grid item container direction="row">
                  <Grid item xs={4}>
                    <RiskMatrix ros={selectedROS.content} />
                  </Grid>
                  <Grid item xs={8}>
                    <ScenarioTable ros={selectedROS.content} />
                  </Grid>
                </Grid>
              </>
            )}
          </Grid>

          <ROSDialog
            isOpen={newROSDialogIsOpen}
            onClose={() => setNewROSDialogIsOpen(false)}
            saveRos={createNewROS}
          />

          <ScenarioDrawer />
        </Content>
      </ScenarioContext.Provider>
    </>
  );
};
