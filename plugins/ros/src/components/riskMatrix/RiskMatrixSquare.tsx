import { RiScWithMetadata } from '../../utils/types.ts';
import Box from '@mui/material/Box';
import { riskMatrix, riskMatrixStroke } from '../../utils/constants.ts';
import { RiskMatrixScenarioCount } from './RiskMatrixScenarioCount.tsx';
import styles from './RiskMatrixSquare.module.css';

type RiskMatrixSquareProps = {
  size: 'small' | 'grid';
  probability: number; // 0 - 4
  consequence: number; // 0 - 4
  riScCountObject?: {
    riSc: RiScWithMetadata;
    isInitialRisk: boolean;
  };
};

export function RiskMatrixSquare(props: RiskMatrixSquareProps) {
  return (
    <Box
      className={`${styles.squareWithRiScCount} ${props.size === 'small' ? styles.smallSquare : ''}`}
      style={{
        backgroundColor: riskMatrix[4 - props.consequence][props.probability],
        borderColor: riskMatrixStroke[4 - props.consequence][props.probability],
      }}
      key={`S:${props.probability} K:${props.consequence}`}
    >
      {props.riScCountObject && (
        <RiskMatrixScenarioCount
          riScWithMetadata={props.riScCountObject.riSc}
          probability={props.probability}
          consequence={props.consequence}
          initialRisk={props.riScCountObject.isInitialRisk}
        />
      )}
    </Box>
  );
}
