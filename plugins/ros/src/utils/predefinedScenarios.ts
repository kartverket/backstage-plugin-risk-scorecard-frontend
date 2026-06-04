/**
 * TEMPORARY FEATURE
 *
 * Predefined scenarios and actions that users can add to an existing RiSc via the
 * banner in {@link ../components/predefinedScenarios/PredefinedScenariosBanner}.
 *
 * The content below is DUMMY DATA and should be replaced with the real
 * scenarios before this is shown to users.
 *
 * To remove this feature: delete this file, the PredefinedScenariosBanner
 * component, and the single render site in RiScPlugin.tsx.
 */
import { ProfileInfo } from '@backstage/core-plugin-api';
import { Action, Scenario } from './types.ts';
import {
  ActionStatusOptions,
  consequenceOptions,
  probabilityOptions,
  ThreatActorsOptions,
  VulnerabilitiesOptions,
} from './constants.ts';
import { getActionsWithLastUpdated } from './actions.ts';

/** An action template with a stable, hardcoded ID. */
type PredefinedActionTemplate = Omit<Action, 'lastUpdated' | 'lastUpdatedBy'>;

/** A scenario template with a stable, hardcoded ID. */
type PredefinedScenarioTemplate = Omit<Scenario, 'actions'> & {
  actions: PredefinedActionTemplate[];
};

/**
 * Dummy predefined scenarios. The `ID` of each scenario is used as the stable
 * identifier for detecting whether it has already been added, so the IDs must
 * remain unique and stable while this feature is live. IDs must match the RiSc
 * schema pattern `^[a-zA-Z0-9]{5,}$` (alphanumeric, at least 5 characters).
 */
export const predefinedScenarioTemplates: PredefinedScenarioTemplate[] = [
  {
    ID: 'PDEFScenario01',
    title: 'KI tar over verden',
    description:
      'Dummy scenario: An attacker gains access to sensitive data because access controls on the service are misconfigured.',
    threatActors: [
      ThreatActorsOptions.OrganisedCrime,
      ThreatActorsOptions.Hacktivist,
    ],
    vulnerabilities: [
      VulnerabilitiesOptions.Misconfiguration,
      VulnerabilitiesOptions.UnauthorizedAccess,
    ],
    risk: {
      summary: 'Dummy risk summary for misconfigured access controls.',
      probability: probabilityOptions[1],
      consequence: consequenceOptions[2],
    },
    remainingRisk: {
      summary: 'Dummy remaining risk summary after mitigations.',
      probability: probabilityOptions[0],
      consequence: consequenceOptions[2],
    },
    actions: [
      {
        ID: 'PDEFAction0101',
        title: 'Review and tighten access controls',
        description:
          'Dummy action: Audit the current access control configuration and apply least-privilege.',
        status: ActionStatusOptions.NotOK,
        url: '',
        comment: '',
      },
      {
        ID: 'PDEFAction0102',
        title: 'Enable access logging and alerting',
        description:
          'Dummy action: Ensure access to sensitive data is logged and anomalies trigger alerts.',
        status: ActionStatusOptions.NotOK,
        url: '',
        comment: '',
      },
    ],
  },
  {
    ID: 'PDEFScenario02',
    title: 'Georg blir cyborg og allierer seg med skurkene',
    description:
      'Dummy scenario: A third-party dependency with a publicly known vulnerability is exploited to compromise the service.',
    threatActors: [
      ThreatActorsOptions.ScriptKiddie,
      ThreatActorsOptions.OrganisedCrime,
    ],
    vulnerabilities: [VulnerabilitiesOptions.DependencyVulnerability],
    risk: {
      summary: 'Dummy risk summary for vulnerable dependency.',
      probability: probabilityOptions[2],
      consequence: consequenceOptions[1],
    },
    remainingRisk: {
      summary: 'Dummy remaining risk summary after patching process.',
      probability: probabilityOptions[1],
      consequence: consequenceOptions[1],
    },
    actions: [
      {
        ID: 'PDEFAction0201',
        title: 'Enable automated dependency scanning',
        description:
          'Dummy action: Turn on Dependabot/automated scanning and triage alerts regularly.',
        status: ActionStatusOptions.NotOK,
        url: '',
        comment: '',
      },
    ],
  },
];

/** IDs of all predefined scenarios, used for presence detection. */
export const predefinedScenarioIds: string[] = predefinedScenarioTemplates.map(
  template => template.ID,
);

/**
 * Materialise the given scenario templates into full {@link Scenario} objects.
 * The templates carry stable, hardcoded IDs; callers must only build templates
 * whose ID is not already present in the target RiSc, so no duplicate IDs are
 * introduced.
 */
export function buildPredefinedScenarios(
  templates: PredefinedScenarioTemplate[],
  profileInfo?: ProfileInfo,
): Scenario[] {
  return templates.map(template => ({
    ...template,
    actions: getActionsWithLastUpdated(
      [],
      template.actions.map(action => ({ ...action })),
      template.actions.map(action => action.ID),
      profileInfo,
    ),
  }));
}
