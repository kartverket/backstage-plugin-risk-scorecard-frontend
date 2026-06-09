import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { ScenarioDTO } from '../utils/DTOs.ts';
import {
  buildPredefinedScenarioTemplates,
  PredefinedScenarioTemplate,
} from '../utils/predefinedScenarios.ts';

const PREDEFINED_SCENARIOS_SOURCE_URL =
  'https://raw.githubusercontent.com/aleksanderobrestad/testaleksander/main/testinitros.json';

/**
 * IDs of the scenarios to pull out of the source file. These become the stable
 * presence-detection contract and must never change in the source file.
 */
const PREDEFINED_SCENARIO_IDS = ['N2GiZ']; // temp value

type PredefinedScenariosContextObject = {
  predefinedScenarioTemplates: PredefinedScenarioTemplate[];
  predefinedScenarioIds: string[];
};

const PredefinedScenariosContext = createContext<
  PredefinedScenariosContextObject | undefined
>(undefined);

export function PredefinedScenariosProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [predefinedScenarioTemplates, setPredefinedScenarioTemplates] =
    useState<PredefinedScenarioTemplate[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(PREDEFINED_SCENARIOS_SOURCE_URL);
        if (!response.ok) {
          throw new Error(`Unexpected status ${response.status}`);
        }
        const data: unknown = await response.json();
        const scenarios = (data as { scenarios?: ScenarioDTO[] })?.scenarios;
        if (!Array.isArray(scenarios)) {
          throw new Error('Source file has no scenarios array');
        }

        const templates = buildPredefinedScenarioTemplates(
          scenarios,
          PREDEFINED_SCENARIO_IDS,
        );
        if (!cancelled) setPredefinedScenarioTemplates(templates);
      } catch (error) {
        // TODO: handle error
        console.error('Failed to load predefined scenarios:', error);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const predefinedScenarioIds = predefinedScenarioTemplates.map(
    template => template.ID,
  );

  return (
    <PredefinedScenariosContext.Provider
      value={{ predefinedScenarioTemplates, predefinedScenarioIds }}
    >
      {children}
    </PredefinedScenariosContext.Provider>
  );
}

export function usePredefinedScenarios() {
  const context = useContext(PredefinedScenariosContext);

  if (context === undefined) {
    throw new Error(
      'usePredefinedScenarios must be used within a PredefinedScenariosProvider',
    );
  }
  return context;
}
