import { ROS, TableData } from '../interface/interfaces';

export const mapToTableData = (data: ROS): TableData[] =>
  data.scenarier.map(scenario => ({
    beskrivelse: scenario.beskrivelse,
    trussel: scenario.trusselaktører.join(', '),
    sårbarhet: scenario.sårbarheter.join(', '),
    konsekvens: scenario.risiko.konsekvens,
    sannsynlighet: scenario.risiko.sannsynlighet,
    id: scenario.ID,
  }));
