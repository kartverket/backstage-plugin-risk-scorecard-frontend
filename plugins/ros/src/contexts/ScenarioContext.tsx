import React, { ReactNode, useState, useEffect } from 'react';
import { useRouteRef } from '@backstage/core-plugin-api';
import { Action, Scenario } from '../utils/types';
import { riScRouteRef, scenarioRouteRef } from '../routes';
import { useNavigate, useParams } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { generateRandomId } from '../utils/utilityfunctions';
import { useRiScs } from './RiScContext';

export const emptyAction = (): Action => ({
  ID: generateRandomId(),
  title: '',
  description: '',
  owner: '',
  deadline: new Date().toISOString().split('T')[0],
  status: 'Not started',
  url: '',
});

const emptyScenario = (): Scenario => ({
  ID: generateRandomId(),
  title: '',
  description: '',
  threatActors: [],
  vulnerabilities: [],
  risk: {
    summary: '',
    probability: 0.01,
    consequence: 1000,
  },
  existingActions: '',
  actions: [],
  remainingRisk: {
    summary: '',
    probability: 0.01,
    consequence: 1000,
  },
});

type ScenarioDrawerProps = {
  isDrawerOpen: boolean;

  scenario: Scenario;
  submitNewScenario: (
    newScenario: Scenario,
    onSuccess?: () => void,
    onError?: () => void,
  ) => void;
  submitEditedScenarioToRiSc: (
    editedScenario: Scenario,
    onSuccess?: () => void,
    onError?: () => void,
  ) => void;

  openScenarioDrawer: (id: string) => void;
  openNewScenarioWizard: () => void;
  closeScenarioForm: () => void;
};

export type ScenarioWizardSteps = (typeof scenarioWizardSteps)[number];
export const scenarioWizardSteps = [
  'scenario',
  'initialRisk',
  'measure',
  'restRisk',
] as const;

const ScenarioContext = React.createContext<ScenarioDrawerProps | undefined>(
  undefined,
);

const ScenarioProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const getRiScPath = useRouteRef(riScRouteRef);
  const getScenarioPath = useRouteRef(scenarioRouteRef);
  const { scenarioId: scenarioIdFromParams } = useParams();

  const { selectedRiSc, updateRiSc } = useRiScs();
  const riSc = selectedRiSc ?? null;

  const [scenario, setScenario] = useState(emptyScenario());

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Open scenario when url changes
  useEffect(() => {
    const scenarioWizardStep = searchParams.get(
      'step',
    ) as ScenarioWizardSteps | null;

    if (riSc) {
      // If there is no scenario ID in the URL, close the drawer and reset the scenario to an empty state
      if (!scenarioIdFromParams) {
        setIsDrawerOpen(false);
        const s = emptyScenario();

        setScenario(s);
        return;
      }

      if (scenarioWizardStep) {
        // If step query param exists in url then we are creating a new scenario with the wizard.
        return;
      }

      const selectedScenario = riSc.content.scenarios.find(
        s => s.ID === scenarioIdFromParams,
      );

      // If there is an invalid scenario ID in the URL, navigate to the RiSc with error state
      if (!selectedScenario) {
        navigate(getRiScPath({ riScId: riSc.id }), {
          state: 'Risikoscenarioet du prøver å åpne eksisterer ikke',
        });
        return;
      }

      setScenario(selectedScenario);
      setIsDrawerOpen(true);
    }
  }, [riSc, scenarioIdFromParams, getRiScPath, navigate, searchParams]);

  // SCENARIO DRAWER FUNCTIONS
  const openScenarioDrawer = (id: string) => {
    if (riSc) {
      navigate(getScenarioPath({ riScId: riSc.id, scenarioId: id }));
    }
  };

  const closeScenarioForm = () => {
    if (riSc) {
      navigate(getRiScPath({ riScId: riSc.id }));
    }
  };

  const submitNewScenario = (
    newScenario: Scenario,
    onSuccess?: () => void,
    onError?: () => void,
  ) => {
    if (riSc) {
      updateRiSc(
        {
          ...riSc.content,
          scenarios: riSc.content.scenarios.concat(newScenario),
        },
        onSuccess,
        onError,
      );
    }
  };

  const submitEditedScenarioToRiSc = (
    editedScenario: Scenario,
    onSuccess?: () => void,
    onError?: () => void,
  ) => {
    if (riSc) {
      updateRiSc(
        {
          ...riSc.content,
          scenarios: riSc.content.scenarios.map(s =>
            s.ID === editedScenario.ID ? editedScenario : s,
          ),
        },
        onSuccess,
        onError,
      );
    }
  };

  const openNewScenarioWizard = () => {
    if (riSc) {
      const s = emptyScenario();
      setScenario(s);

      navigate(
        `${getScenarioPath({
          riScId: riSc.id,
          scenarioId: s.ID,
        })}?step=scenario`,
      );
    }
  };

  const value = {
    isDrawerOpen,

    scenario,
    submitNewScenario,
    submitEditedScenarioToRiSc,

    openScenarioDrawer,
    openNewScenarioWizard,
    closeScenarioForm,
  };

  return (
    <ScenarioContext.Provider value={value}>
      {children}
    </ScenarioContext.Provider>
  );
};

const useScenario = () => {
  const context = React.useContext(ScenarioContext);
  if (context === undefined) {
    throw new Error('useScenario must be used within a ScenarioProvider');
  }
  return context;
};

export { ScenarioProvider, useScenario };
