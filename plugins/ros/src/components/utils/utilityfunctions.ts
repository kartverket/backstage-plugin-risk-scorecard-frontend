import { Risiko, ROS, Scenario, TableData } from '../interface/interfaces';

export function mapToTableData(data: ROS): TableData[] {
  return data.scenarier.map((scenario: Scenario, id) => {
    const riskData = scenario.risiko;
    const risk: Risiko = {
      sannsynlighet: riskData.sannsynlighet,
      konsekvens: riskData.konsekvens,
      oppsummering: riskData.oppsummering,
    };

    const tableRow: TableData = {
      beskrivelse: scenario.beskrivelse,
      trussel: scenario.trusselaktører ? scenario.trusselaktører[0] : '',
      sårbarhet: scenario.sårbarheter ? scenario.sårbarheter[0] : '',
      konsekvens: risk.konsekvens,
      sannsynlighet: risk.sannsynlighet,
      id: id,
    };
    return tableRow;
  });
}
