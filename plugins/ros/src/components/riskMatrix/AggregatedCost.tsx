import React, {useState} from 'react';
import {Box, IconButton, makeStyles, Typography} from '@material-ui/core';
import InfoIcon from '@mui/icons-material/Info';
import {ROS} from '../utils/types';
import {EstimatedRiskInfoDialog} from './EstimatedRiskInfoDialog';
import {formatNOK} from "../utils/utilityfunctions";

interface AggregatedCostProps {
    ros: ROS;
    startRisiko: boolean;
}

const useStyles = makeStyles({
    outerBox: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    innerBox: {
        display: 'flex',
        alignItems: 'center',
    },
});

export const AggregatedCost = ({ros, startRisiko}: AggregatedCostProps) => {
    const cost = ros.scenarier
        .map(scenario =>
            startRisiko
                ? scenario.risiko.sannsynlighet * scenario.risiko.konsekvens
                : scenario.restrisiko.sannsynlighet * scenario.restrisiko.konsekvens,
        )
        .reduce((a, b) => a + b, 0);

    const [showDialog, setShowDialog] = useState(false);
    const {outerBox, innerBox} = useStyles();
    return (
        <Box className={outerBox}>
            <Typography>Estimert risiko</Typography>
            <Box className={innerBox}>
                <Typography variant="h5">{formatNumber(cost)} kr/år</Typography>
                <IconButton size="small" onClick={() => setShowDialog(true)}>
                    <InfoIcon/>
                </IconButton>
            </Box>
            <EstimatedRiskInfoDialog
                isOpen={showDialog}
                onClose={() => setShowDialog(false)}
            />
        </Box>
    );
};

function formatNumber(cost: number): string {
    if (cost < 1e4) {
        return formatNOK(cost);
    } else if (cost < 1e6) {
        return `${(cost / 1e3).toFixed(1)} tusen`;
    } else if (cost < 1e9) {
        return `${(cost / 1e6).toFixed(1)} ${cost / 1e6 === 1 ? 'million' : 'millioner'}`;
    } else if (cost < 1e12) {
        return `${(cost / 1e9).toFixed(1)} ${cost / 1e9 === 1 ? 'milliard' : 'milliarder'}`;
    } else {
        return `${(cost / 1e12).toFixed(1)} ${cost / 1e12 === 1 ? 'billion' : 'billioner'}`;
    }
}