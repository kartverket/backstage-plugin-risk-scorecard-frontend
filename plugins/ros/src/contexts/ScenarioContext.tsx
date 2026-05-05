import { ProfileInfo, useRouteRef } from '@backstage/core-plugin-api';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  Dispatch,
  SetStateAction,
} from 'react';
import { useNavigate, useParams } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { riScRouteRef, scenarioRouteRef } from '../routes';
import { pluginRiScTranslationRef } from '../utils/translations';
import { Action, FormScenario, Scenario } from '../utils/types';
import {
  generateRandomId,
  roundConsequenceToNearestConsequenceOption,
  roundProbabilityToNearestProbabilityOption,
} from '../utils/utilityfunctions';
import { useRiScs } from './RiScContext';
import {
  ActionStatusOptions,
  consequenceOptions,
  probabilityOptions,
} from '../utils/constants';
import { getActionsWithLastUpdated } from '../utils/actions.ts';
import { getScenarioOfIdFromRiSc } from '../utils/scenario.ts';
import { useBackstageContext } from './BackstageContext.tsx';
import { isToday } from '../utils/date.ts';

export const emptyAction = (): Action => ({
  ID: generateRandomId(),
  title: '',
  description: '',
  status: ActionStatusOptions.NotOK,
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
  isEditingAllowed: boolean;

  isActionExpanded: (actionId: string) => boolean;
  toggleActionExpanded: (actionId: string) => void;
  collapseAllActions: () => void;

  hoveredScenarios: Scenario[];
  setHoveredScenarios: Dispatch<SetStateAction<Scenario[]>>;

  emptyFormScenario: (scenario: Scenario) => FormScenario;
  scenario: Scenario;
  submitNewScenario: (
    newScenario: Scenario,
    profileInfo?: ProfileInfo,
    onSuccess?: () => void,
    onError?: () => void,
  ) => void;
  submitEditedScenarioToRiSc: (
    editedScenario: Scenario,
    options?: {
      idsOfActionsToForceUpdateLastUpdatedValue?: string[];
      profileInfo?: ProfileInfo;
      onSuccess?: () => void;
      onError?: () => void;
    },
  ) => void;

  openScenarioDrawer: (id: string, isEditingAllowed: boolean) => void;
  openNewScenarioWizard: () => void;
  closeScenarioForm: () => void;
  mapFormScenarioToScenario: (formScenario: FormScenario) => Scenario;
  mapScenarioToFormScenario: (scenario: Scenario) => FormScenario;

  // Pending action status state (shared between table and drawer)
  pendingActionStatusUpdates: Record<
    string,
    Record<string, ActionStatusOptions>
  >;
  pendingActionUpdatesHistory: string[];
  hasPendingActionStatusChanges: boolean;
  isSavingActionStatuses: boolean;
  onNewActionStatus: (
    scenarioId: string,
    actionId: string,
    newStatus: ActionStatusOptions,
  ) => void;
  onRefreshActionStatus: (scenarioId: string, action: Action) => void;
  saveAllPendingActionStatuses: () => void;
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
  const { profileInfo } = useBackstageContext();

  const [scenario, setScenario] = useState(emptyScenario());

  const [hoveredScenarios, setHoveredScenarios] = useState<Scenario[]>([]);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditingAllowed, setIsEditingAllowed] = useState(true);

  const { t } = useTranslationRef(pluginRiScTranslationRef);

  // Pending action status state (shared between table and drawer)
  const [pendingActionStatusUpdates, setPendingActionStatusUpdates] = useState<
    Record<string, Record<string, ActionStatusOptions>>
  >({});
  const [pendingActionUpdatesHistory, setPendingActionUpdatesHistory] =
    useState<string[]>([]);
  const [isSavingActionStatuses, setIsSavingActionStatuses] = useState(false);

  const hasPendingActionStatusChanges =
    Object.keys(pendingActionStatusUpdates).length > 0;

  // Warn on browser tab close / refresh with unsaved changes
  useEffect(() => {
    if (!hasPendingActionStatusChanges) return undefined;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasPendingActionStatusChanges]);

  const onNewActionStatus = useCallback(
    (scenarioId: string, actionId: string, newStatus: ActionStatusOptions) => {
      setPendingActionUpdatesHistory(prev =>
        prev.filter(id => id !== actionId),
      );
      setPendingActionStatusUpdates(prev => ({
        ...prev,
        [scenarioId]: {
          ...prev[scenarioId],
          [actionId]: newStatus,
        },
      }));
    },
    [],
  );

  const onRefreshActionStatus = useCallback(
    (scenarioId: string, action: Action) => {
      if (isToday(action.lastUpdated ?? null)) return;
      setPendingActionUpdatesHistory(prev =>
        prev.filter(id => id !== action.ID),
      );
      setPendingActionStatusUpdates(prev => ({
        ...prev,
        [scenarioId]: {
          ...prev[scenarioId],
          [action.ID]: action.status as ActionStatusOptions,
        },
      }));
    },
    [],
  );

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
        probability: probabilityOptions[0].toString(),
        consequence: consequenceOptions[0].toString(),
      },
      remainingRisk: {
        summary: '',
        probability: probabilityOptions[0].toString(),
        consequence: consequenceOptions[0].toString(),
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
  function openScenarioDrawer(id: string, canEdit: boolean) {
    if (riSc) {
      setIsEditingAllowed(canEdit);
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
    callerProfileInfo?: ProfileInfo,
    onSuccess?: () => void,
    onError?: () => void,
  ) {
    newScenario.actions = getActionsWithLastUpdated(
      [],
      newScenario.actions,
      [],
      callerProfileInfo,
    );

    if (riSc) {
      updateRiSc(
        {
          ...riSc,
          content: {
            ...riSc.content,
            scenarios: [newScenario, ...riSc.content.scenarios],
          },
        },
        onSuccess,
        onError,
      );
    }
  }

  function submitEditedScenarioToRiSc(
    editedScenario: Scenario,
    options?: {
      idsOfActionsToForceUpdateLastUpdatedValue?: string[];
      profileInfo?: ProfileInfo;
      onSuccess?: () => void;
      onError?: () => void;
    },
  ) {
    const oldScenario = getScenarioOfIdFromRiSc(
      editedScenario.ID,
      selectedRiSc,
    );

    editedScenario.actions = getActionsWithLastUpdated(
      oldScenario?.actions ?? [],
      editedScenario.actions,
      options?.idsOfActionsToForceUpdateLastUpdatedValue ?? [],
      options?.profileInfo,
    );

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
        options?.onSuccess,
        options?.onError,
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

  const saveAllPendingActionStatuses = useCallback(() => {
    if (!hasPendingActionStatusChanges || !riSc) return;
    setIsSavingActionStatuses(true);

    // Build a single combined RiSc with all pending status changes applied
    const allAffectedActionIds: string[] = [];
    const updatedScenarios = riSc.content.scenarios.map(s => {
      const updates = pendingActionStatusUpdates[s.ID];
      if (!updates) return s;

      const updatedActions = s.actions.map(a =>
        a.ID in updates ? { ...a, status: updates[a.ID] ?? a.status } : a,
      );

      const actionIdsToForce = Object.keys(updates);
      allAffectedActionIds.push(...actionIdsToForce);

      return {
        ...s,
        actions: getActionsWithLastUpdated(
          s.actions,
          updatedActions,
          actionIdsToForce,
          profileInfo,
        ),
      };
    });

    updateRiSc(
      {
        ...riSc,
        content: { ...riSc.content, scenarios: updatedScenarios },
      },
      () => {
        setPendingActionStatusUpdates({});
        setPendingActionUpdatesHistory(prev => [
          ...prev,
          ...allAffectedActionIds,
        ]);
        setIsSavingActionStatuses(false);
      },
      () => {
        // On error: keep pending state so user can retry
        setIsSavingActionStatuses(false);
      },
    );
  }, [
    hasPendingActionStatusChanges,
    pendingActionStatusUpdates,
    riSc,
    updateRiSc,
    profileInfo,
  ]);

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
        probability: `${roundProbabilityToNearestProbabilityOption(apiScenario.risk.probability)}`,
        consequence: `${roundConsequenceToNearestConsequenceOption(apiScenario.risk.consequence)}`,
      },
      remainingRisk: {
        ...apiScenario.remainingRisk,
        probability: `${roundProbabilityToNearestProbabilityOption(apiScenario.remainingRisk.probability)}`,
        consequence: `${roundConsequenceToNearestConsequenceOption(apiScenario.remainingRisk.consequence)}`,
      },
    };
    return returnFormScenario;
  }

  const value = {
    isDrawerOpen,
    isEditingAllowed,

    isActionExpanded,
    toggleActionExpanded,
    collapseAllActions,

    hoveredScenarios,
    setHoveredScenarios,

    emptyFormScenario,
    scenario,
    submitNewScenario,
    submitEditedScenarioToRiSc,

    openScenarioDrawer,
    openNewScenarioWizard,
    closeScenarioForm,
    mapFormScenarioToScenario,
    mapScenarioToFormScenario,

    // Pending action status state
    pendingActionStatusUpdates,
    pendingActionUpdatesHistory,
    hasPendingActionStatusChanges,
    isSavingActionStatuses,
    onNewActionStatus,
    onRefreshActionStatus,
    saveAllPendingActionStatuses,
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
