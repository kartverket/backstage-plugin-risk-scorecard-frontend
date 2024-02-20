import React, { useState } from 'react';
import { ROS } from '../../../../../../plugins/ros/src/components/utils/interfaces';
import { useRiskMatrixStyles} from "./style";

interface aggregatedCostProps {
    ros: ROS;
}

export const AggregatedCost = ({
    ros,
}: aggregatedCostProps) => {

    const riskConsequenceCosts = [5000, 50000, 500000, 5000000, 50000000]
    const riskProbabilityFactors = [1/2, 1, 365/12, 365/52, 365] //Expected yearly occurrences

    let cost = 0
    ros.scenarier.forEach((scenario) => {
        cost = cost + (riskConsequenceCosts[scenario.risiko.konsekvens-1]*riskProbabilityFactors[scenario.risiko.sannsynlighet-1])
    })

    return (
        <h1>Scenariene i denne matrisen har en årlig kostnad på {cost} kroner og øre</h1>
    )
}