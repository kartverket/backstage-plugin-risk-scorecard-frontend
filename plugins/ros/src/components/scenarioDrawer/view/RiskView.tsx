import React, { useContext } from 'react';
import Box from '@mui/material/Box';
import { Button, Grid, Paper, Typography } from '@material-ui/core';
import {
    formatNOK,
    getKonsekvensLevel,
    getRiskMatrixColor,
    getSannsynlighetLevel,
} from '../../utils/utilityfunctions';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import { useScenarioDrawerContentStyles, useFontStyles } from '../style';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { ScenarioContext } from '../../riScPlugin/ScenarioContext';
import EditIcon from '@mui/icons-material/Edit';

export const RiskView = () => {
    const { risikoBadge, titleAndButton, section } =
        useScenarioDrawerContentStyles();
    const { h3, body1, label, button } = useFontStyles();

    const { t } = useTranslationRef(pluginRiScTranslationRef);
    const { scenario, editScenario } = useContext(ScenarioContext)!!;

    return (
        <>
            {/* Initial risk -> Rest risk*/}
            <Box
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                }}
            >
                <Paper className={section} style={{ padding: '1rem' }}>
                    <Grid item xs={12} className={titleAndButton}>
                        <Typography className={h3}>
                            {t('dictionary.initialRisk')}
                        </Typography>
                        <Button
                            className={button}
                            variant="text"
                            color="primary"
                            onClick={() => editScenario('initialRisk')}
                            startIcon={<EditIcon style={{ color: 'rgba(0, 0, 0, 0.54)' }} aria-label='Edit' />}
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
                                    backgroundColor: getRiskMatrixColor(scenario.risk),
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
                                    {t('dictionary.consequence')}:{' '}
                                    {getKonsekvensLevel(scenario.risk)}
                                </Typography>
                                <Typography className={label}>
                                    {t('dictionary.probability')}:{' '}
                                    {getSannsynlighetLevel(scenario.risk)}
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
                                    scenario.risk.consequence * scenario.risk.probability,
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

                <Paper className={section} style={{ padding: '1rem' }}>
                    <Grid item xs={12} className={titleAndButton}>
                        <Typography className={h3}>{t('dictionary.restRisk')}</Typography>
                        <Button
                            className={button}
                            variant="text"
                            color="primary"
                            onClick={() => editScenario('restRisk')}
                            startIcon={<EditIcon style={{ color: 'rgba(0, 0, 0, 0.54)' }} aria-label='Edit' />}
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
                                    backgroundColor: getRiskMatrixColor(scenario.remainingRisk),
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
                                    {t('dictionary.consequence')}:{' '}
                                    {getKonsekvensLevel(scenario.remainingRisk)}
                                </Typography>
                                <Typography className={label}>
                                    {t('dictionary.probability')}:{' '}
                                    {getSannsynlighetLevel(scenario.remainingRisk)}
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
                                    scenario.remainingRisk.consequence *
                                    scenario.remainingRisk.probability,
                                )}{' '}
                                {t('riskMatrix.estimatedRisk.unit.nokPerYear')}
                            </Typography>
                        </Grid>
                    </Grid>
                </Paper>
            </Box>
        </>
    );
};
