import {
  ReactNode,
  useState,
  useEffect,
  useContext,
  createContext,
} from 'react';
import { useRouteRef } from '@backstage/core-plugin-api';
import { Action, FormScenario, Scenario } from '../utils/types';
import { riScRouteRef, scenarioRouteRef } from '../routes';
import { useNavigate, useParams } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { generateRandomId } from '../utils/utilityfunctions';
import { useRiScs } from './RiScContext';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../utils/translations';

export const emptyAction = (): Action => ({
  ID: generateRandomId(),
  title: '',
  description: '',
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
  actions: [],
  remainingRisk: {
    summary: '',
    probability: 0.01,
    consequence: 1000,
  },
});

type ScenarioDrawerProps = {
  isDrawerOpen: boolean;

  isActionExpanded: (actionId: string) => boolean;
  toggleActionExpanded: (actionId: string) => void;
  collapseAllActions: () => void;

  emptyFormScenario: (scenario: Scenario) => FormScenario;
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
  mapFormScenarioToScenario: (formScenario: FormScenario) => Scenario;
  mapScenarioToFormScenario: (scenario: Scenario) => FormScenario;
};

export type ScenarioWizardSteps = (typeof scenarioWizardSteps)[number];
export const scenarioWizardSteps = [
  'scenario',
  'initialRisk',
  'measure',
  'restRisk',
] as const;

const ScenarioContext = createContext<ScenarioDrawerProps | undefined>(
  undefined,
);

export function ScenarioProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const getRiScPath = useRouteRef(riScRouteRef);
  const getScenarioPath = useRouteRef(scenarioRouteRef);
  const { scenarioId: scenarioIdFromParams } = useParams();

  const { selectedRiSc, updateRiSc } = useRiScs();
  const riSc = selectedRiSc ?? null;

  const [scenario, setScenario] = useState(emptyScenario());

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const [expandedActions, setExpandedActions] = useState<{
    [key: string]: boolean;
  }>({});

  function toggleActionExpanded(actionId: string) {
    setExpandedActions(prevState => ({
      ...prevState,
      [actionId]: !prevState[actionId],
    }));
  }

  function collapseAllActions() {
    const allCollapsed = Object.keys(expandedActions).reduce(
      (acc, key) => {
        acc[key] = false;
        return acc;
      },
      {} as { [key: string]: boolean },
    );
    setExpandedActions(allCollapsed);
  }

  function isActionExpanded(actionId: string) {
    return expandedActions[actionId] || false;
  }

  function emptyFormScenario(initialScenario: Scenario): FormScenario {
    return {
      ...initialScenario,
      risk: {
        summary: '',
        probability: '0.01',
        consequence: '1000',
      },
      remainingRisk: {
        summary: '',
        probability: '0.01',
        consequence: '1000',
      },
    };
  }

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
          state: t('errorMessages.ScenarioDoesNotExist'),
        });
        return;
      }

      setScenario(selectedScenario);
      setIsDrawerOpen(true);
    }
  }, [riSc, scenarioIdFromParams, getRiScPath, navigate, searchParams, t]);

  // SCENARIO DRAWER FUNCTIONS
  function openScenarioDrawer(id: string) {
    if (riSc) {
      navigate(getScenarioPath({ riScId: riSc.id, scenarioId: id }));
    }
  }

  function closeScenarioForm() {
    if (riSc) {
      navigate(getRiScPath({ riScId: riSc.id }));
    }
  }

  function submitNewScenario(
    newScenario: Scenario,
    onSuccess?: () => void,
    onError?: () => void,
  ) {
    if (riSc) {
      updateRiSc(
        {
          ...riSc,
          content: {
            ...riSc.content,
            scenarios: riSc.content.scenarios.concat(newScenario),
          },
        },
        onSuccess,
        onError,
      );
    }
  }

  function submitEditedScenarioToRiSc(
    editedScenario: Scenario,
    onSuccess?: () => void,
    onError?: () => void,
  ) {
    if (riSc) {
      updateRiSc(
        {
          ...riSc,
          content: {
            ...riSc.content,
            scenarios: riSc.content.scenarios.map(s =>
              s.ID === editedScenario.ID ? editedScenario : s,
            ),
          },
        },
        onSuccess,
        onError,
      );
    }
  }

  function openNewScenarioWizard() {
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
  }

  function mapFormScenarioToScenario(formScenario: FormScenario): Scenario {
    const returnScenario: Scenario = {
      ...formScenario,
      risk: {
        ...formScenario.risk,
        probability: Number(formScenario.risk.probability),
        consequence: Number(formScenario.risk.consequence),
      },
      remainingRisk: {
        ...formScenario.remainingRisk,
        probability: Number(formScenario.remainingRisk.probability),
        consequence: Number(formScenario.remainingRisk.consequence),
      },
    };
    return returnScenario;
  }

  function mapScenarioToFormScenario(apiScenario: Scenario): FormScenario {
    const returnFormScenario: FormScenario = {
      ...apiScenario,
      risk: {
        ...apiScenario.risk,
        probability: `${apiScenario.risk.probability}`,
        consequence: `${apiScenario.risk.consequence}`,
      },
      remainingRisk: {
        ...apiScenario.remainingRisk,
        probability: `${apiScenario.remainingRisk.probability}`,
        consequence: `${apiScenario.remainingRisk.consequence}`,
      },
    };
    return returnFormScenario;
  }

  const value = {
    isDrawerOpen,

    isActionExpanded,
    toggleActionExpanded,
    collapseAllActions,

    emptyFormScenario,
    scenario,
    submitNewScenario,
    submitEditedScenarioToRiSc,

    openScenarioDrawer,
    openNewScenarioWizard,
    closeScenarioForm,
    mapFormScenarioToScenario,
    mapScenarioToFormScenario,
  };

  return (
    <ScenarioContext.Provider value={value}>
      {children}
    </ScenarioContext.Provider>
  );
}

export function useScenario() {
  const context = useContext(ScenarioContext);
  if (context === undefined) {
    throw new Error('useScenario must be used within a ScenarioProvider');
  }
  return context;
}
