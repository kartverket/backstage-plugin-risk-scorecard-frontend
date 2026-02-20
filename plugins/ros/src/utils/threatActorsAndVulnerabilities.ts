import { Scenario } from './types.ts';
import { ThreatActorsOptions, VulnerabilitiesOptions } from './constants.ts';

export enum CoverageType {
  ThreatActor,
  Vulnerability,
}

type ScenarioCoverageCounts = {
  threatActors: Map<ThreatActorsOptions, number>;
  vulnerabilities: Map<VulnerabilitiesOptions, number>;
};

export function countScenarioCoverage(scenarios: Scenario[]) {
  let coverageMap: ScenarioCoverageCounts = {
    threatActors: new Map(),
    vulnerabilities: new Map(),
  };

  Object.values(ThreatActorsOptions).forEach(threatActor => {
    coverageMap.threatActors.set(threatActor, 0);
  });

  Object.values(VulnerabilitiesOptions).forEach(vuln => {
    coverageMap.vulnerabilities.set(vuln, 0);
  });

  scenarios.forEach(scenario => {
    scenario.threatActors.forEach(threatActor => {
      const key = threatActor as ThreatActorsOptions;
      coverageMap.threatActors.set(
        key,
        (coverageMap.threatActors.get(key) ?? 0) + 1,
      );
    });
  });

  scenarios.forEach(scenario => {
    scenario.vulnerabilities.forEach(vuln => {
      const key = vuln as VulnerabilitiesOptions;
      coverageMap.vulnerabilities.set(
        key,
        (coverageMap.vulnerabilities.get(key) ?? 0) + 1,
      );
    });
  });

  return coverageMap;
}

export function getNotCovered(
  coverageMap: Map<string, number>,
): string[] {
  return Array.from(coverageMap.entries())
    .filter(([, count]) => count === 0)
    .map(([key]) => key);
}

type ScenarioCoverage = {
  covered: number;
  total: number;
};

export type ScenarioCoverageSummary = {
  threatActors: ScenarioCoverage;
  vulnerabilities: ScenarioCoverage;
};

export function countScenarioCoverageSummary(
  scenarios: Scenario[],
): ScenarioCoverageSummary {
  const scenarioCoverage = countScenarioCoverage(scenarios);

  return {
    threatActors: {
      covered: Array.from(scenarioCoverage.threatActors.values()).reduce(
        (sum, item) => sum + Number(item > 0),
        0,
      ),
      total: scenarioCoverage.threatActors.size,
    },
    vulnerabilities: {
      covered: Array.from(scenarioCoverage.vulnerabilities.values()).reduce(
        (sum, item) => sum + Number(item > 0),
        0,
      ),
      total: scenarioCoverage.vulnerabilities.size,
    },
  };
}
