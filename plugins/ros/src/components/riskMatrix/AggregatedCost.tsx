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
    } else {
        let zeros;
        let unit;
        if (cost < 1e6) {
            zeros = 1e3;
            unit = 'tusen';
        } else if (cost < 1e9) {
            zeros = 1e6;
            unit = 'million'
        } else if (cost < 1e12) {
            zeros = 1e9;
            unit = 'milliard'
        } else {
            zeros = 1e12;
            unit = 'billiard'
        }
        let prefix = (cost / zeros).toFixed(1);
        if (prefix.endsWith('0') || zeros === 1e3) {
            prefix = (cost / zeros).toFixed(0)
        }
        if ((cost / zeros) > 1 && zeros != 1e3) {
            unit = unit + 'er';
        }
        return `${prefix} ${unit}`
    }
}