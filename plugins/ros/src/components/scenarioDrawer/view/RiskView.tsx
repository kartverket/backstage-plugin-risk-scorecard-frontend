import React, { useContext } from 'react';
import Box from '@mui/material/Box';
import { Button, Grid, Paper, Typography } from '@material-ui/core';
import BorderColorOutlinedIcon from '@mui/icons-material/BorderColorOutlined';
import {
    formatNOK,
    getKonsekvensLevel,
    getRiskMatrixColor,
    getSannsynlighetLevel,
} from '../../utils/utilityfunctions';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import { useScenarioDrawerContentStyles, useInputFieldStyles, useFontStyles } from '../style';
import { ScenarioContext } from '../../rosPlugin/ScenarioContext';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

export const RiskView = () => {

    const { risikoBadge, titleAndButton } = useScenarioDrawerContentStyles();
    const { paper } = useInputFieldStyles();

    const { h3, body1, label, button } = useFontStyles();


    const { t } = useTranslationRef(pluginRiScTranslationRef);
    const { scenario, editScenario } =
        useContext(ScenarioContext)!!;



    return (
        <>
            {/* Initial risk -> Rest risk*/}
            < Grid
                item
                xs={12}
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                }
                }
            >

                <Paper className={paper} style={{ padding: '1rem' }}>
                    <Grid item xs={12} className={titleAndButton}>
                        <Typography className={h3}>
                            {t('dictionary.initialRisk')}
                        </Typography>
                        <Button
                            className={button}
                            variant="text"
                            color="primary"
                            onClick={() => editScenario('initialRisk')}
                            startIcon={<BorderColorOutlinedIcon />}
                        />
                    </Grid>


                    <Grid container>
                        <Grid
                            item
                            xs={12}
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                gap: '0.5rem',
                                alignItems: 'center',
                            }}
                        >
                            <Box
                                className={risikoBadge}
                                style={{
                                    backgroundColor: getRiskMatrixColor(scenario.risiko),
                                }}
                            />
                            <Grid
                                item
                                xs={12}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'start',
                                }}
                            >
                                <Typography className={label}>
                                    {t('dictionary.consequence')}: {getKonsekvensLevel(scenario.risiko)}
                                </Typography>
                                <Typography className={label}>
                                    {t('dictionary.probability')}: {getSannsynlighetLevel(scenario.risiko)}
                                </Typography>
                            </Grid>
                        </Grid>
                        <Grid item xs={12} style={{ paddingBottom: 0 }}>
                            <Typography className={label}>
                                {t('dictionary.estimatedRisk')}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} style={{ paddingTop: 0 }}>
                            <Typography className={body1}>
                                {formatNOK(
                                    scenario.risiko.konsekvens * scenario.risiko.sannsynlighet,
                                )}{' '}
                                {t('riskMatrix.estimatedRisk.unit.nokPerYear')}
                            </Typography>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Arrow */}
                <Grid
                    item
                    xs={2}
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <KeyboardDoubleArrowRightIcon fontSize="large" />
                </Grid>

                <Paper className={paper} style={{ padding: '1rem' }}>
                    <Grid item xs={12} className={titleAndButton}>
                        <Typography className={h3}>
                            {t('dictionary.restRisk')}
                        </Typography>
                        <Button
                            className={button}
                            variant="text"
                            color="primary"
                            onClick={() => editScenario('restRisk')}
                            startIcon={<BorderColorOutlinedIcon />}
                        />
                    </Grid>

                    <Grid container>
                        <Grid
                            item
                            xs={12}
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                gap: '0.5rem',
                                alignItems: 'center',
                            }}
                        >
                            <Box
                                className={risikoBadge}
                                style={{
                                    backgroundColor: getRiskMatrixColor(scenario.restrisiko),
                                }}
                            />

                            <Grid
                                item
                                xs={12}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'start',
                                }}
                            >
                                <Typography className={label}>
                                    {t('dictionary.consequence')}: {getKonsekvensLevel(scenario.restrisiko)}
                                </Typography>
                                <Typography className={label}>
                                    {t('dictionary.probability')}: {getSannsynlighetLevel(scenario.restrisiko)}
                                </Typography>
                            </Grid>
                        </Grid>
                        <Grid item xs={12} style={{ paddingBottom: 0 }}>
                            <Typography className={label}>
                                {t('dictionary.estimatedRisk')}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} style={{ paddingTop: 0 }}>
                            <Typography className={body1}>
                                {formatNOK(
                                    scenario.restrisiko.konsekvens * scenario.restrisiko.sannsynlighet,
                                )}{' '}
                                {t('riskMatrix.estimatedRisk.unit.nokPerYear')}
                            </Typography>
                        </Grid>
                    </Grid>
                </Paper>
            </Grid >
        </>
    );
}