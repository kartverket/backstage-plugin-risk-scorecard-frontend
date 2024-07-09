import React, { ReactNode, useState, useEffect } from 'react';
import { useRouteRef } from '@backstage/core-plugin-api';
import { Action, RiSc, RiScWithMetadata, Scenario } from './utils/types';
import { consequenceOptions, probabilityOptions } from './utils/constants';
import { riScRouteRef, scenarioRouteRef } from './routes';
import { useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { ScenarioWizardSteps } from './components/scenarioWizard/ScenarioWizard';
import { generateRandomId } from './utils/utilityfunctions';
import { ScenarioDrawerState } from './utils/hooks';

const emptyAction = (): Action => ({
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
  scenarioDrawerState: ScenarioDrawerState;

  scenario: Scenario;
  originalScenario: Scenario;
  newScenario: () => void;
  saveScenario: () => boolean;
  editScenario: (step: ScenarioWizardSteps) => void;
  isNewScenario: boolean;

  openScenario: (id: string) => void;
  closeScenario: () => void;
  validateScenario: () => boolean;

  deleteConfirmationIsOpen: boolean;
  openDeleteConfirmation: () => void;
  abortDeletion: () => void;
  confirmDeletion: () => void;

  setScenarioValue: <T extends keyof Scenario>(
    key: T,
    value: Scenario[T],
  ) => void;

  addAction: () => void;
  updateAction: (action: Action) => void;
  deleteAction: (action: Action) => void;

  setProbability: (probabilityLevel: number) => void;
  setConsequence: (consequenceLevel: number) => void;
  setRemainingProbability: (probabilityLevel: number) => void;
  setRemainingConsequence: (consequenceLevel: number) => void;
  setProbabilityAndRemainingProbability: (probabilityLevel: number) => void;
  setConsequenceAndRemainingConsequence: (consequenceLevel: number) => void;

  setFormError: (key: string) => void;
  removeFormError: (key: string) => void;
  hasFormErrors: () => boolean;
  formFieldHasErrors: (key: string) => boolean;
};

const ScenarioContext = React.createContext<ScenarioDrawerProps | undefined>(
  undefined,
);

const ScenarioProvider = ({
  riSc,
  updateRiSc,
  scenarioIdFromParams,
  children,
}: {
  children: ReactNode;
  riSc: RiScWithMetadata | null;
  updateRiSc: (riSc: RiSc) => void;
  scenarioIdFromParams?: string;
}) => {
  // STATES
  const [scenarioDrawerState, setScenarioDrawerState] = useState(
    ScenarioDrawerState.Closed,
  );

  const [isNewScenario, setIsNewScenario] = useState(false);
  const [formErrors, _setFormErrors] = useState<{ [key: string]: boolean }>({});
  const [scenario, setScenario] = useState(emptyScenario());
  const [originalScenario, setOriginalScenario] = useState(emptyScenario());
  const [deleteConfirmationIsOpen, setDeleteConfirmationIsOpen] =
    useState(false);
  const [, setSearchParams] = useSearchParams();

  const navigate = useNavigate();
  const getScenarioPath = useRouteRef(scenarioRouteRef);
  const getRiScPath = useRouteRef(riScRouteRef);

  // Open scenario when url changes
  useEffect(() => {
    if (riSc) {
      // If there is no scenario ID in the URL, close the drawer and reset the scenario to an empty state
      if (!scenarioIdFromParams) {
        setScenarioDrawerState(ScenarioDrawerState.Closed);
        const s = emptyScenario();
        setScenario(s);
        setOriginalScenario(s);
        return;
      }

      if (isNewScenario) {
        // If this is a new scenario we should not set a "not found" state on path.
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
      setOriginalScenario(selectedScenario);
      setScenarioDrawerState(ScenarioDrawerState.View);
    }
  }, [riSc, scenarioIdFromParams, getRiScPath, navigate, isNewScenario]);

  // SCENARIO DRAWER FUNCTIONS
  const openScenario = (id: string) => {
    if (riSc) {
      navigate(getScenarioPath({ riScId: riSc.id, scenarioId: id }));
    }
  };

  // openNewScenarioWizard is used when opening the wizard with a new scenario. It explisit sets the searchParam to step=scenario.
  const openNewScenarioWizard = (id: string, step: ScenarioWizardSteps) => {
    if (riSc) {
      navigate(
        `${getScenarioPath({ riScId: riSc.id, scenarioId: id })}?step=${step}`,
      );
    }
  };

  const closeScenario = () => {
    if (riSc) {
      setIsNewScenario(false);
      navigate(getRiScPath({ riScId: riSc.id }));
    }
  };

  const editScenario = (step: ScenarioWizardSteps) => {
    setScenarioDrawerState(ScenarioDrawerState.Closed);
    setSearchParams({ step: step });
  };

  // TODO: håndter med form i stedet
  const validateScenario = () => {
    if (scenario.title === '') {
      return false;
    }
    return true;
  };

  const saveScenario = () => {
    if (riSc) {
      if (validateScenario()) {
        const updatedScenarios = riSc.content.scenarios.some(
          s => s.ID === scenario.ID,
        )
          ? riSc.content.scenarios.map(s =>
              s.ID === scenario.ID ? scenario : s,
            )
          : riSc.content.scenarios.concat(scenario);
        updateRiSc({ ...riSc.content, scenarios: updatedScenarios });
        return true;
      }
    }
    return false;
  };

  // TODO: har material en useDisclosure-sak man kan bruke her?
  const openDeleteConfirmation = () => setDeleteConfirmationIsOpen(true);
  const abortDeletion = () => setDeleteConfirmationIsOpen(false);

  const confirmDeletion = () => {
    if (riSc) {
      setDeleteConfirmationIsOpen(false);
      closeScenario();
      const updatedScenarios = riSc.content.scenarios.filter(
        s => s.ID !== scenario.ID,
      );
      updateRiSc({ ...riSc.content, scenarios: updatedScenarios });
    }
  };

  const newScenario = () => {
    if (riSc) {
      setIsNewScenario(true);
      const s = emptyScenario();
      setScenario(s);
      setOriginalScenario(s);
      openNewScenarioWizard(s.ID, 'scenario');
    }
  };

  // UPDATE SCENARIO FUNCTIONS
  const setScenarioValue = <T extends keyof Scenario>(
    key: T,
    value: Scenario[T],
  ) => {
    setScenario({
      ...scenario,
      [key]: value,
    });
  };

  const addAction = () =>
    setScenario({ ...scenario, actions: [...scenario.actions, emptyAction()] });

  const updateAction = (action: Action) => {
    const updatedAction = scenario.actions.some(a => a.ID === action.ID)
      ? scenario.actions.map(a => (a.ID === action.ID ? action : a))
      : [...scenario.actions, action];
    setScenario({ ...scenario, actions: updatedAction });
  };

  const deleteAction = (action: Action) => {
    const updatedAction = scenario.actions.filter(a => a.ID !== action.ID);
    setScenario({ ...scenario, actions: updatedAction });
  };

  const setProbability = (probabilityLevel: number) =>
    setScenario({
      ...scenario,
      risk: {
        ...scenario.risk,
        probability: probabilityOptions[probabilityLevel - 1],
      },
    });

  const setConsequence = (consequenceLevel: number) =>
    setScenario({
      ...scenario,
      risk: {
        ...scenario.risk,
        consequence: consequenceOptions[consequenceLevel - 1],
      },
    });

  const setRemainingProbability = (probabilityLevel: number) =>
    setScenario({
      ...scenario,
      remainingRisk: {
        ...scenario.remainingRisk,
        probability: probabilityOptions[probabilityLevel - 1],
      },
    });

  const setRemainingConsequence = (consequenceLevel: number) =>
    setScenario({
      ...scenario,
      remainingRisk: {
        ...scenario.remainingRisk,
        consequence: consequenceOptions[consequenceLevel - 1],
      },
    });

  const setProbabilityAndRemainingProbability = (probabilityLevel: number) =>
    setScenario({
      ...scenario,
      risk: {
        ...scenario.risk,
        probability: probabilityOptions[probabilityLevel - 1],
      },
      remainingRisk: {
        ...scenario.remainingRisk,
        probability: probabilityOptions[probabilityLevel - 1],
      },
    });

  const setConsequenceAndRemainingConsequence = (consequenceLevel: number) =>
    setScenario({
      ...scenario,
      risk: {
        ...scenario.risk,
        consequence: consequenceOptions[consequenceLevel - 1],
      },
      remainingRisk: {
        ...scenario.remainingRisk,
        consequence: consequenceOptions[consequenceLevel - 1],
      },
    });

  const setFormError = (key: string) => {
    _setFormErrors({ ...formErrors, [key]: true });
  };

  const removeFormError = (key: string) => {
    delete formErrors[key];
    _setFormErrors({ ...formErrors });
  };

  const formFieldHasErrors = (key: string) =>
    Object.keys(formErrors).includes(key);

  const hasFormErrors = () => Object.keys(formErrors).length > 0;

  // TODO: vurder memoisering
  const value = {
    scenarioDrawerState,

    scenario,
    originalScenario,
    newScenario,
    saveScenario,
    editScenario,
    isNewScenario,

    openScenario,
    closeScenario,

    validateScenario,

    deleteConfirmationIsOpen,
    openDeleteConfirmation,
    abortDeletion,
    confirmDeletion,

    setScenarioValue,

    addAction,
    updateAction,
    deleteAction,

    setProbability,
    setConsequence,
    setRemainingProbability,
    setRemainingConsequence,
    setProbabilityAndRemainingProbability,
    setConsequenceAndRemainingConsequence,

    setFormError,
    hasFormErrors,
    removeFormError,
    formFieldHasErrors,
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
