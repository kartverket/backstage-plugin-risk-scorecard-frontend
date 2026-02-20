import {
  createTranslationRef,
  createTranslationResource,
} from '@backstage/core-plugin-api/alpha';

export const pluginRiScMessages = {
  currentLanguage: 'en',
  contentHeader: {
    title: 'Risk scorecard',
    createNewButton: 'Create new scorecard',
    editEncryption: 'Edit encryption',
    deleteButton: 'Delete scoreboard',
    multipleRiScs: 'RiSc scorecards',
  },
  dictionary: {
    by: 'By',
    click: 'Click',
    here: 'here',
    rejectedLogin: 'Login rejected by user.',
    yes: 'Yes',
    no: 'No',
    summary: 'Summary',
    noAccess: 'No access',
    optional: 'optional',
    month: 'month',
    week: 'week',
    day: 'day',
    hour: 'hour',
    minute: 'minute',
    second: 'second',
    months: 'months',
    weeks: 'weeks',
    days: 'days',
    hours: 'hours',
    minutes: 'minutes',
    seconds: 'seconds',
    action: 'Action',
    add: 'Add',
    added: 'Added',
    availability: 'Availability',
    copy: 'Copy',
    copied: 'Copied',
    cancel: 'Cancel',
    close: 'Close',
    completed: 'Completed',
    confidentiality: 'Confidentiality',
    confirm: 'Confirm',
    consequence: 'Consequence', // Severity, Impact, Effect or Consequence
    deadline: 'Deadline', // Deadline or Due date
    delete: 'Delete',
    description: 'Description',
    discardChanges: 'Discard changes',
    edit: 'Edit',
    estimatedRisk: 'Estimated risk',
    estimatedInitialRisk: 'Estimated initial risk',
    estimatedRemainingRisk: 'Estimated remaining risk',
    estimatedCurrentRisk: 'Estimated current risk',
    example: 'Example',
    initialRisk: 'Initial risk', // Starting or Initial risk
    integrity: 'Integrity',
    measure: 'Action', // Measure, Action or Initiative
    measures: 'Actions', // Measure, Action or Initiative
    measuresInitialRiSc: 'actions',
    measureOwner: 'Responsible', // Responsible? Measure owner? Initiative owner?
    next: 'Next',
    planned: 'Planned',
    previous: 'Previous',
    probability: 'Probability', // Likelihood or Probability
    restRisk: 'Remaining risk', // Residual or Remaining risk
    currentRisk: 'Current risk',
    removed: 'Removed',
    risk: 'Risk',
    riskExplanation: {
      initial: 'Risk before actions are completed',
      current: 'Current risk based on current action status',
      remaining: 'Risk after all actions are completed',
    },
    save: 'Save',
    saveAndClose: 'Save and close',
    scenario: 'Scenario',
    scope: 'Scope',
    status: 'Status',
    threatActors: 'Threat actors',
    theThreatActor: 'The threat actor',
    theThreatActors: 'The threat actors',
    title: 'Title',
    unknown: 'Unknown',
    url: 'URL',
    emptyField: 'No {{field}} specified',
    valuation: 'Valuation',
    version: 'Version',
    vulnerabilities: 'Vulnerabilities',
    theVulnerability: 'The vulnerability',
    theVulnerabilities: 'The vulnerabilities',
    showOnlyRelevant: 'Show only relevant',
    noRelevantMeasures: 'No relevant actions',
    scenarios: 'scenarios',
    customOrder: 'Custom order',
    searchQuery: 'No result for ',
    actionsWithStatus: 'Actions that are OK',
    refresh: 'Refresh',
    relatedComponents: 'Associated Components',
  },
  encryption: {
    title: 'Encryption',
  },
  rosStatus: {
    statusBadge: {
      missing:
        'Once the draft is complete, the risk owner can review and accept the changes.', // Mangler godkjenning av risikoeier
      approved: 'Accepted by risk owner', // Godkjent av risikoeier
      error: 'Failed to retrieve status', // Kunne ikke hente status
      migration: {
        title: 'You are required to review and save changes',
        description:
          'There has been done changes to the risk scorecard, as a result of a migration to the newest version. The changes may include deletion and modification of information. It will not be possible to save edits of the scorecard without including and accepting the changes.', // Automatisk migrering av ROS
      },
      created: 'Empty scorecard created',
      draft: 'Draft',
      waiting: 'Awaiting approval',
      published: 'Published',
      draftDeletion: 'Marked for deletion',
      waitingDeletion: 'Awaiting deletion',
      deletionApproval: 'The risk owner can review and accept the deletion.',
    },
    updatedStatus: {
      UPDATED: 'Updated status icon',
      LITTLE_OUTDATED: 'Little outdated status icon',
      OUTDATED: 'Outdated status icon',
      VERY_OUTDATED: 'Very outdated status icon',
      error: 'Error status icon',
      disabled: 'Disabled status icon',
      tooltip: {
        OUTDATED: 'This action is outdated',
        VERY_OUTDATED: 'This action is very outdated',
      },
    },
    lastModified: 'Last published: ',
    daysSinceLastModified: '{{days}} days and {{numCommits}} commits ago',
    notPublishedYet: 'RiSc is not published yet',
    errorMessage: 'Failed to retrieve status',
    outdated: 'Outdated',
    veryOutdated: 'Very outdated',
    updated: 'Updated',
    updating: 'Saving...',
    difference: {
      description: 'Summary of changes that will be approved by risk owner.',
      publishDate: 'Last published changes {{date}}',
      fetching: 'Fetching changes',
      error: 'Error while fetching changes',
      newROS: 'No published Risk scorecards to compare with',
      differences: {
        title: 'CHANGES',
        noneRemoved: 'Nothing is removed',
        titleRemoved: 'Removed from risk scorecard',
        titleExisting: 'Changed in existing risk scorecard',
        noneExisting: 'Nothing is changed',
        titleAdded: 'Added to risk scorecard',
        noneAdded: 'Nothing is added',
      },
    },
    editing: 'You can now start editing',
    approveButtonUpdate: 'Accept risks', // Approve RiSc
    approveButtonDelete: 'Accept deletion', // Approve deletion of RiSc
    prStatus: ' Merge the PR in ', // Avventer godkjenning av PR i Github
    prStatus2Update: ' to publish the scorecard.', // Approve RiSc
    prStatus2Delete: ' to delete the scorecard.', // Approve deletion of RiSc
    moreInformationButton: 'More information', // Lagre ROS migrering
    githubLink: 'Go to GitHub',
  },
  publishDialog: {
    titleUpdate: 'Accept risks', // Approve ROS
    titleDelete: 'Accept deletion', // Delete ROS
    checkboxLabelUpdate:
      'I confirm that the risk owner accepts the risks detailed in this risk scorecard.',
    checkboxLabelDelete:
      'I confirm that the risk owner accepts the deletion of this risk scorecard.',
  },
  migrationDialog: {
    description:
      'The changes have been made to adhere to the latest schema version.',
    migrationTitle: 'Migration from {{from}} to {{to}}',
    schemaVersion: 'Schema version',
    schemaChangelog: 'Schema changelog',
    title: 'Save changes', // Lagre ROS migrering
    checkboxLabel:
      'I confirm that I have reviewed and wish to save the changes made during the migration.',
    migration40: {
      changeExplanation:
        'This migration changes preset values for consequence and probability.',
      owner: 'Responsible',
      deadline: 'Deadline',
      existingActions: 'Existing actions',
      vulnerabilitiesTitle: 'Vulnerabilities',
      vulnerabilities: {
        'Compromised admin user': 'Compromised admin user',
        'Denial of service': 'Denial of service',
        'Disclosed secret': 'Disclosed secret',
        'Escalation of rights': 'Escalation of rights',
        'Excessive use': 'Excessive use',
        'Information leak': 'Information leak',
        'User repudiation': 'User repudiation',
        'Unauthorized access': 'Unauthorized use',
        'Unmonitored use': 'Unmonitored use',
      },
    },
    migration41: {
      changeExplanation:
        'This migration removes the owner and deadline fields from actions, removes existing actions and updates values for vulnerabilities.',
      nokPerIncident: 'NOK/incident',
      occurrencesPerYear: 'occurrences/year',
    },
    migration42: {
      changeExplanation: 'This migration adds a last updated field to actions.',
    },
    migration50: {
      changeExplanation:
        'This migration updates the action status to a new naming convention.',
    },
    migration51: {
      changeExplanation:
        'This migration adds a last updated by field to actions.',
      lastUpdatedBy: 'Last updated by:',
      addedLastUpdatedBy:
        'Added field to track who updated an action for {{numberOfChangedActions}} existing actions',
    },
    migration52: {
      changeExplanation:
        'This migration removes the unused concept of valuations from the RiSc document.',
      title: 'Valuations removed',
      oldValue: 'Existing valuations removed',
    },
    removed: 'Removed',
  },
  comparisonDialog: {
    noChanges: 'No changes',
    changes: 'Changes to RiSc',
    noURL: 'No URL provided',
    noDescription: 'No description provided',
    risk: {
      probabilityUnit: 'occurrences/year',
      consequenceUnit: 'NOK/incident',
    },
    valuation: {
      integrity: {
        Insignificant: 'Insignificant',
        Expected: 'Expected',
        Dependent: 'Dependent',
        Critical: 'Critical',
      },
      availability: {
        Insignificant: 'Insignificant',
        '2 days': '2 days',
        '4 hours': '4 hours',
        Immediate: 'Immediate',
      },
      confidentiality: {
        Public: 'Public',
        Internal: 'Internal',
        Confidential: 'Confidential',
        'Strictly confidential': 'Strictly confidential',
      },
    },
  },
  supportDialog: {
    title: 'Support',
    openEntry: 'Open',
    entries: {
      riscFeedbackChannel: {
        title: 'RISC Feedback Channel',
        description: '#kodenær-ros-tilbakemelding',
      },
      riscDocumentation: {
        title: 'RISC Documentation',
        description: 'Confluence - RISC',
      },
    },
  },
  scenarioTable: {
    title: 'Risk scenarios',
    addScenarioButton: 'Add scenario',
    noActions: 'No actions',
    columns: {
      consequenceChar: 'C',
      probabilityChar: 'P',
      completed: 'complete',
    },
    editButton: 'Edit list',
    doneEditing: 'Finish editing',
    noActionsLong: 'The scenario has no actions',
  },
  riskMatrix: {
    title: 'Risk matrix', // Risk matrix or Risk overview
    estimatedRisk: {
      title: 'Estimated risk',
      suffix: {
        thousand: '{{count}} thousand',
        million_one: '{{count}} million',
        million_other: '{{count}} million',
        billion_one: '{{count}} billion',
        billion_other: '{{count}} billion',
        trillion_one: '{{count}} trillion',
        trillion_other: '{{count}} trillion',
      },
      unit: {
        nokPerYear: 'NOK/year',
      },
    },
    tooltip: {
      title: 'Risk scenarios',
    },
    currentRisk: {
      title: 'Risc reduction',
      description:
        "The diagram illustrates the development from today's initial risk to the calculated final risk. <strong>{{actionsOk}}</strong> completed actions represent a reduction of <strong>{{reduction}} NOK/year.</strong>",
    },
  },
  infoDialog: {
    title: 'Estimated risk',
    description:
      'The estimated risk is a calculation based on the risks the different scenarios pose. If there is a high probability that a serious consequence will occur, this could potentially become a large cost for the organization. In other words, the cost is an attempt to make the risk value more tangible and is the sum of the estimated risk for all the risk scenarios in this risk scorecard.',
    calculatedHowTitle: 'How do we calculate the estimated risk?',
    calculatedHow:
      'Probability (P) is measured in incidents per year and consequence (C) is measured in cost (in NOK) per incident. ' +
      'The estimated risk is calculated as 20',
    calculatedHowExponent: 'P+C-1',
    consequenceTitle: 'Consequence (NOK/incident)', // incident, event or occurrence
    consequenceUnit: 'NOK/incident',
    consequenceDescription: {
      oneworkday: '1 workday',
      oneworkmonth: '1 work month',
      oneworkyear: '1 work year',
      '20workyears': '20 work years',
      '400workyears': '400 work years',
    },
    probabilityTitle: 'Probability (incidents/year)',
    probabilityUnit: 'incidents/year',
    probabilityDescription: {
      every400years: 'Once every 400 years',
      every20years: 'Once every 20 years',
      annualy: 'Annually',
      monthly: 'Monthly',
      daily: 'Daily',
    },
    example: {
      part1: 'A risk scenario with probability ',
      part2: ' and consequence ',
      part3: ' has an estimated risk of ',
    },
    currentRisk: {
      title: 'Current risk calculations',
      description:
        'Current risk blends the starting risk, the planned end risk, and how far the mitigation actions have progressed. For each scenario, we first compute the initial risk cost',
      remainingRiskCost: 'and the remaining risk cost',
      actionRatio:
        'Then we measure how many relevant actions are completed (ratio) = (number of completed actions) / (number of actions not marked “Not relevant”). If no relevant actions, ratio = 0.',
      currentRiskCost:
        'The current risk cost interpolates between start and remaining risk based on that ratio',
      aggregated: 'The aggregated current risk is the sum of ',
      aggregatedSums: 'across all scenarios, reported in NOK per year.',
    },
  },
  rosDialog: {
    titleNew: 'New risk scorecard',
    titleEdit: 'Edit scorecard',
    editEncryption: 'Edit encryption',
    titleError: 'The scorecard has to have a title',
    scopeDescription:
      'Describe what the risk analysis will assess. Specify any key areas which are not part of the scope.',
    scopeError: 'The scorecard has to have a description of the scope',
    generateInitialDescription:
      'RiSc Scorecard lets you generate a default RiSc based on information about the codebase in kartverket.dev, security metrics and security controls.',
    generateInitialToggleDescription: 'Do you want to generate a default RiSc?',
    fromScratch: 'Empty',
    generateDefault: 'Default',
    stepRiscDetails: 'Risk Scorecard Details',
    stepEncryption: 'Configure Encryption',
    initialRiscTitle: 'Predefined Risk Scorecard',
    initialRiscScopeDescription:
      'Do you want to generate a RoS with predefined scenarios and actions?',
    initialRiscApplicationType: 'What type of application do you have?',
    generateObsRiScDescription:
      'This RoS contains scenarios that should be considered for build and deploy.',
    generateInternalJobRiScDescription:
      'This RoS contains scenarios that should be considered for internal tools and jobs',
    generateStandardRiScDescription:
      'This RoS is generated from information about the codebase in kartverket.dev, security metrics and security controllers.',
    noInitialRiScFound: 'No default RoS is currently available.',
    applicationType: 'Choose application type',
    titleAndScope: 'Title and scope',
    recommendedForComponentOfType: 'Recommended for components of type',
  },
  sopsConfigDialog: {
    title: 'Encryption',
    description: {
      new: 'The Risc Scorecard will be encrypted to limit access. Below please choose a key from Google Cloud Platform which you and your team can access.',
      edit: 'The Risc Scorecard will be encrypted to limit access. You can change which key is utilized from Google Cloud Platform, make sure the correct people have access to the new key.',
    },
    selectKeysTitle: 'Choose encryption key',
    chooseGcpCryptoKey: 'Choose GCP key',
    gcpCryptoKeyDescription:
      'From the list below, select the GCP crypto key you want to use for encrypting and decrypting the Risk scorecard.',
    cryptoKeyOptionInfo:
      '(Project: {{projectId}}, Permissions: {{permissions}})',
    cryptoKeyPermissionENCRYPT: 'Encrypt',
    cryptoKeyPermissionDECRYPT: 'Decrypt',
    cryptoKeyPermissionUNKNOWN: '⚠️ Unknown - you should switch to another key',
    gcpCryptoKeyNoSelectableKey:
      'You do not have access to any suitable GCP crypto keys.',
    gcpCryptoKeyNonSelectedErrorMessage: 'A GCP crypto key must be selected.',
    publicAgeKeysAlreadyPresent: 'The following age keys are already present:',
    publicAgeKeyQuestion:
      'Does anyone need to write Risk scorecards locally using their editor?',
    writeLocalRiscSuffix: "to learn more about writing RiSc's locally.",
    publicAgeKeyDescription:
      'Provide a public age key below for individuals allowed local editing',
    addPublicAgeKey: 'Add public age key',
    publicAgeKey: 'Public age key',
    update: 'Update',
    createPRTitle: 'Create a Pull Request with the new encryption scheme',
    createPRContent:
      'Your encryption configuration is now ready and has been created in a new branch. Below you can create a PR with these changes. Alternatively, you can move the changes to a different branch by clicking the "Branch" button and selecting another active branch.',
    PRTitle: 'Review and merge the Pull Request',
    SummaryDescription: 'A PR with the encryption scheme has now been created.',
    SummaryGCP: 'The selected GCP key is ',
    SummaryAgeKeys: 'The following public age keys have also been added: ',
    PRContent:
      'Click the button below to view the changes, review them, and merge the PR. After you merge the PR, you can start creating and managing Risk scorecards.',
    required: 'This field is required',
    publicKeyHelperTextKeyAlreadyExists: 'Public key already added',
    publicKeyHelperTextKeyAlreadyExistInSopsConfig:
      'Public key already present in existing SOPS configuration',
    publicKeyHelperTextKeyNotValid: 'Public key is not a valid age public key',
    pendingTitle: 'Pending SOPS configuration',
    pendingDescription:
      'The following pull requests are opened to include a SOPS configuration in the GitHub-repo',
    secondaryPullRequestText: 'Opened _n_ ago by',
    reEncryptTitle: "Re-encryption of existing RiSc's",
    reEncryptDescription:
      "When updating SOPS configuration, you will not be able to decrypt old RiSc's encrypted with the previous SOPS configuration. We therefore encourage you to re-encrypt the existing RiSc's on the default branch of your GitHub-repository for you to be able to use them with your updated SOPS configuration.",
    reEncryptConsentDescription:
      "Do you want to re-encrypt the RiSc's on the default branch of ",
    openPR: 'Create pull request',
    gotoPullRequest: 'Go to pull request',
  },
  scenarioStepper: {
    initialRiskStep: {
      title: 'Initial risk',
      subtitle:
        'The initial risk is defined by the consequence of the scenario and the probability of it occurring.',
      consequenceSubtitle:
        'How severe is the potential impact? If the scenario can impact more than one category, choose the highest level of consequence.',
      probabilitySubtitle:
        'How likely is it that this scenario will occur? If you are between two probability values, choose the higher one.',
    },
    restRiskStep: {
      title: 'Remaining risk',
      subtitle:
        'What is the risk reduced to when all the planned actions have been completed?',
      consequenceSubtitle:
        'How severe is the consequence of this scenario after all actions are complete?',
      probabilitySubtitle:
        'What is the likelihood of this scenario after all actions are complete?',
    },
  },
  scenarioDrawer: {
    action: {
      requiredError: 'Field is required',
      descriptionError: 'Description cannot be empty',
      urlError: 'Invalid URL',
      emptyState: 'This scenario has no defined actions',
      lastUpdated: 'Last updated:',
      notUpdated: 'No date',
    },
    title: 'Risk scenario',
    newTitle: 'New risk scenario',
    titleError: 'Scenario title is required',
    subtitle: 'An unwanted incident that could potentially harm the component.', // harm or affect negatively?
    threatActorSubtitle: 'Someone who attempts to access or abuse the system', // system or component or both?
    vulnerabilitySubtitle:
      'Weakness in the system that the threat actor can exploit',
    createNewScenario: 'Create new scenario',
    saveAsDraft: 'Save as draft',
    riskMatrixModal: {
      startRisk: 'What is the risk before any mitigating actions are taken?',
      restRisk: 'What is the risk after all planned actions are completed?',
      title: 'Risk matrixes',
    },
    consequenceTab: {
      subtitle:
        'How severe is the potential impact? If the scenario can impact more than one category, choose the highest level of consequence.',
    },
    probabilityTab: {
      subtitle:
        'How likely is it that this scenario will occur? If you are between two probability values, choose the higher one.',
    },
    measureTab: {
      subtitle:
        'What actions should be taken to avoid or reduce the risk of this scenario?',
      measureOwnerDescription:
        'Decide who will be responsible for completion of this action',
      addMeasureButton: 'Add planned action',
      plannedMeasures: 'Planned actions',
      addMeasureTitleError: 'Action title is required',
      urlDescription: 'For example, link to Jira task',
    },
    restRiskTab: {
      subtitle:
        'Define the remaining risk for the scenario. Remaining risk is the consequence and probability for this ' +
        'scenario after all planned actions have been completed.',
    },
    deleteScenarioButton: 'Delete scenario',
    deleteScenarioConfirmation:
      'Are you sure you want to delete this scenario?',
    deleteActionButton: 'Delete action',
    deleteActionConfirmation: 'Are you sure you want to delete this action?',
    closeConfirmation: 'Do you want to save your changes?',
    errors: {
      remainingProbabilityTooHigh:
        'Remaining probability cannot be higher than initial probability',
      remainingConsequenceTooHigh:
        'Remaining consequence cannot be higher than initial consequence',
    },
  },
  consequenceTable: {
    rows: {
      '1': 'Negligible', // Insignificant, negligible (ubetydelig)
      '2': 'Small', // Liten
      '3': 'Moderate',
      '4': 'Severe', // Alvorlig
      '5': 'Critical', // Catastrophic eller Critical
    },
    columns: {
      health: 'Life and health', // Health and safety, Life and limb, Health and lives (Liv og helse)
      economical: 'Financial', // Financial consequences, economic implications
      privacy: 'Privacy', // Personvern
      reputation: 'Reputation and trust', // Reputation and trust, confidence, faith (Omdømme og tillit)
    },
    cells: {
      health: {
        '1': 'Impact on life and health cannot be rated less severe than 3', // Liv og helse kan ikke være mindre alvorlig enn 3
        '2': 'Impact on life and health cannot be rated less severe than 3',
        '3': 'Temporary or less severe health implications. Temporary or minor damage to local environment.', // implications, effects or consequence? Temporary or minor? Midlertidige eller mindre alvorlige helsemessige konsekvenser. Midlertidig eller mindre skade på miljøet
        '4': 'Permanent or severe health implications for a few people. Moderate damage to the environment in a limited area.',
        '5': 'Death or permanent severe health implications for many people. Severe damage to the environment across large areas.',
      },
      economical: {
        '1': 'Temporary minor financial loss.\n\nMay be fixed with 1 workday.',
        '2': 'Temporary financial loss.\n\nMay be fixed with 1 work month.',
        '3': 'Financial loss of some duration.\n\nMay be fixed with 1 work year.',
        '4': 'Financial loss of considerable duration for the organization and any third parties.\n\nMay be fixed with 20 work years.',
        '5': 'Permanent and severe financial loss.\n\nMay be fixed with 400 work years.',
      },
      privacy: {
        '1': 'The right to privacy is violated for a very short period and does not involve sensitive categories or vulnerable groups', // særlige kategorier = sensitive kategorier? special/particular/sensitive categories
        '2': 'The right to privacy is violated for a longer period and involves sensitive categories or vulnerable groups.',
        '3': 'Violations of the rights and freedoms for the registered people.',
        '4': 'Severe violations and breaches of the rights and freedoms for the registered people, as well as violations of the law.',
        '5': 'Impact on privacy cannot be rated more severe than 4',
      },
      reputation: {
        '1': 'Temporary loss of reputation and little impact on trust',
        '2': 'Negative attention in national media that leads to loss of reputation.\n\nMay reduce trust.',
        '3': 'Lasting negative attention in national and international media that leads to severe loss of reputation.\n\nSevere loss of trust from authorities.\n\nUsers who do not dare or want to use the services.', // lasting, severe, severe loss, severe loss of trust, do not dare or want to use the services
        '4': 'Impact on reputation and trust cannot be rated more severe than 3',
        '5': 'Impact on reputation and trust cannot be rated more severe than 3',
      },
    },
  },
  probabilityTable: {
    rows: {
      '1': 'Very low', // svært liten
      '2': 'Low', // liten
      '3': 'Moderate', // moderat
      '4': 'High', // stor
      '5': 'Very high', // svært stor
    },
    cells: {
      '1': 'The scenario is unlikely to occur.\n\nIt occurs less often than every 400 years',
      '2': 'The scenario is unlikely to occur.\n\nIt can occur every 20 years',
      '3': 'The scenario can occur.\n\nIt can occur yearly',
      '4': 'The scenario will very likely occur.\n\nIt can occur monthly',
      '5': 'The scenario is almost guaranteed to occur.\n\nIt can occur daily',
    },
  },
  threatActors: {
    'Script kiddie': 'Script kiddie',
    Hacktivist: 'Hacktivist',
    'Reckless employee': 'Reckless employee',
    Insider: 'Insider',
    'Organised crime': 'Organised crime',
    'Terrorist organisation': 'Terrorist organisation',
    'Nation/government': 'Nation/government',
  },
  vulnerabilities: {
    'Flawed design': 'Flawed design',
    Misconfiguration: 'Misconfiguration',
    'Dependency vulnerability': 'Dependency vulnerability',
    'Unauthorized access': 'Unauthorized use',
    'Unmonitored use': 'Unmonitored use',
    'Input tampering': 'Input tampering',
    'Information leak': 'Information leak',
    'Excessive use': 'Excessive use',
  },
  threatActorsAndVulnerabilities: {
    title: 'Threat Actors and Vulnerabilities',
    allCovered: 'All {{kind}} are covered in at least one scenario.',
    oneNotCovered:
      '{{kind}} <b>{{notCovered}}</b> is not covered in any scenario.',
    twoNotCovered:
      '{{kind}} <b>{{notCovered1}}</b> and <b>{{notCovered2}}</b> is not covered in any scenario.',
    multipleNotCovered:
      'Multiple {{kind}} are not covered. This includes <b>{{notCovered1}}</b>, <b>{{notCovered2}}</b> and <b>{{notCovered3}}</b>.',
    showMoreInfo: 'Show more information',
    dialogHeader: 'Scenarios covering vulnerabilities and threat actors',
    vulnerabilityCoverage: 'Vulnerabilities covered',
    threatActorCoverage: 'Threat actors covered',
    coverageRatio: '{{covered}} of {{total}}',
    tableColumnThreatActor: 'Threat actor',
    tableColumnVulnerability: 'Vulnerability',
    tableColumnScenarios: 'Number of scenarios',
  },
  actionStatus: {
    OK: 'OK',
    'Not OK': 'Not OK',
    'Not relevant': 'Not relevant',
  },
  errorMessages: {
    DefaultErrorMessage: 'An error occurred',
    ErrorWhenNoWriteAccessToRepository:
      'Unable to update RiSc. You do not have write access to {{owner}}/{{name}}.',
    ErrorWhenUpdatingRiSc: 'Failed to update risk scorecard',
    ErrorWhenDeletingRiSc: 'Failed to delete risk scorecard',
    ErrorWhenCreatingPullRequest: 'Failed to save approval of risk scorecard',
    ErrorWhenCreatingRiSc: 'Failed to create risk scorecard',
    ErrorWhenFetchingRiScs: 'Failed to fetch risk scorecards with ids: ',
    FailedToFetchRiScs: 'Failed to fetch risk scorecards',
    RiScDoesNotExist:
      'The risk scorecard you are trying to open does not exist',
    ScenarioDoesNotExist: 'The scenario you are trying to open does not exist',
    ErrorWhenFetchingSopsConfig: 'Could not fetch SOPS configuration',
    FailedToCreateSops: 'Failed to create SOPS configuration',
    FailedToUpdateSops: 'SOPS configuration could not be updated',
    ErrorWhenFetchingGcpCryptoKeys: 'Failed to fetch GCP crypto keys',
  },
  infoMessages: {
    OpenedPullRequest: 'Successfully opened pull request',
    CreatedPullRequest: 'Successfully saved approval of risk scorecard ',
    DeletedRiSc: 'Risk scorecard deleted',
    DeletedRiScRequiresApproval:
      'Risk scorecard staged for deletion, requires approval',
    UpdatedRiSc: 'Risk scorecard updated',
    UpdatedSops: 'SOPS configuration updated',
    UpdatedRiScRequiresNewApproval:
      'Risk scorecard update and requires new approval',
    CreatedRiSc: 'Created new risk scorecard successfully',
    UpdatedRiScAndCreatedPullRequest:
      'Risk scorecard updated and ready for approval in Github',
    NoSopsConfigFound:
      'No SOPS configuration present on default branch of the GitHub repository',
    CreatedSops: 'SOPS configuration created successfully',
    UpdateAction: 'Updating action ...',
    UpdateInfoMessage:
      'Please wait a few seconds while the changes are being saved.',
  },
  deleteDialog: {
    title: 'Delete Risk Scorecard',
    confirmationMessage: 'Are you sure you want to delete this risk scorecard?',
  },
  feedbackDialog: {
    title: 'Give us your feedback!',
    description: 'Your feedback',
    confirmationMessage: 'Thank you for your feedback.',
    feedbackButton: 'Give feedback',
    errorMessage: 'An error occurred while sending your feedback.',
    sendButton: 'Send',
  },
  filterButton: {
    veryOutdated: 'Very outdated actions',
    outdated: 'Outdated actions',
    listUpdatedActions: 'Recently updated actions',
  },
  firstRiScCard: {
    noRiScYet: 'No RiSc analyses created yet',
    getStarted:
      'Get started with risk and vulnerability analysis for your team',
  },
  filter: {
    title: 'Title (a-z)',
    initialRisk: 'Initial risk (high-low)',
    completedActions: 'Most completed actions',
    remainingActions: 'Most remaining actions',
  },
} as const;

export const pluginRiScTranslationRef = createTranslationRef({
  id: 'plugin.riSc',
  messages: pluginRiScMessages,
});

export const pluginRiScNorwegianTranslation = createTranslationResource({
  ref: pluginRiScTranslationRef,
  translations: {
    no: () =>
      Promise.resolve({
        default: {
          currentLanguage: 'no',
          'contentHeader.title': 'Risiko- og sårbarhetsanalyse',
          'contentHeader.createNewButton': 'Opprett ny analyse',
          'contentHeader.editEncryption': 'Rediger kryptering',
          'contentHeader.deleteButton': 'Slett analyse',
          'contentHeader.multipleRiScs': 'RoS-analyser',
          'dictionary.rejectedLogin': 'Innlogging avbrutt av bruker.',
          'dictionary.by': 'Av',
          'dictionary.click': 'Klikk',
          'dictionary.here': 'her',
          'dictionary.yes': 'Ja',
          'dictionary.no': 'Nei',
          'dictionary.noAccess': 'Ingen tilgang',
          'dictionary.summary': 'Oppsummering',
          'dictionary.optional': 'valgfritt',
          'dictionary.month': 'måned',
          'dictionary.week': 'uke',
          'dictionary.day': 'dag',
          'dictionary.hour': 'time',
          'dictionary.minute': 'minutt',
          'dictionary.second': 'sekund',
          'dictionary.months': 'måneder',
          'dictionary.weeks': 'uker',
          'dictionary.days': 'dager',
          'dictionary.hours': 'timer',
          'dictionary.minutes': 'minutter',
          'dictionary.seconds': 'sekunder',
          'dictionary.action': 'Tiltak',
          'dictionary.add': 'Legg til',
          'dictionary.added': 'Lagt til',
          'dictionary.availability': 'Tilgjengelighet',
          'dictionary.copy': 'Kopier',
          'dictionary.copied': 'Kopiert',
          'dictionary.cancel': 'Avbryt',
          'dictionary.close': 'Lukk',
          'dictionary.completed': 'Fullført',
          'dictionary.confidentiality': 'Konfidensialitet',
          'dictionary.confirm': 'Bekreft',
          'dictionary.consequence': 'Konsekvens',
          'dictionary.deadline': 'Frist',
          'dictionary.delete': 'Slett',
          'dictionary.description': 'Beskrivelse',
          'dictionary.discardChanges': 'Forkast endringer',
          'dictionary.edit': 'Rediger',
          'dictionary.estimatedRisk': 'Estimert risiko',
          'dictionary.estimatedInitialRisk': 'Estimert startrisiko',
          'dictionary.estimatedRemainingRisk': 'Estimert restrisiko',
          'dictionary.estimatedCurrentRisk': 'Estimert nårisiko',
          'dictionary.example': 'Eksempel',
          'dictionary.initialRisk': 'Startrisiko',
          'dictionary.integrity': 'Integritet',
          'dictionary.measure': 'Tiltak',
          'dictionary.measures': 'Tiltak',
          'dictionary.measureOwner': 'Tiltakseier',
          'dictionary.next': 'Neste',
          'dictionary.planned': 'Planlagt',
          'dictionary.previous': 'Forrige',
          'dictionary.probability': 'Sannsynlighet',
          'dictionary.restRisk': 'Restrisiko',
          'dictionary.currentRisk': 'Nårisiko',
          'dictionary.removed': 'Fjernet',
          'dictionary.risk': 'Risiko',
          'dictionary.riskExplanation.initial': 'Risiko før tiltak er fullført',
          'dictionary.riskExplanation.current':
            'Nåværende risiko basert på faktisk tiltaksstatus',
          'dictionary.riskExplanation.remaining':
            'Risiko etter at alle tiltak er fullført',
          'dictionary.save': 'Lagre',
          'dictionary.saveAndClose': 'Lagre og lukk',
          'dictionary.scenario': 'Scenario',
          'dictionary.scope': 'Omfang',
          'dictionary.status': 'Status',
          'dictionary.threatActors': 'Trusselaktører',
          'dictionary.theThreatActor': 'Trusselaktøren',
          'dictionary.theThreatActors': 'Trusselaktørene',
          'dictionary.title': 'Tittel',
          'dictionary.unknown': 'Ukjent',
          'dictionary.url': 'URL',
          'dictionary.emptyField': 'Ingen {{field}} spesifisert',
          'dictionary.valuation': 'Verdi',
          'dictionary.version': 'Versjon',
          'dictionary.vulnerabilities': 'Sårbarheter',
          'dictionary.theVulnerability': 'Sårbarheten',
          'dictionary.theVulnerabilities': 'Sårbarhetene',
          'dictionary.showOnlyRelevant': 'Vis kun relevante',
          'dictionary.noRelevantMeasures': 'Ingen relevante tiltak',
          'dictionary.scenarios': 'scenarioer',
          'dictionary.measuresInitialRiSc': 'tiltak',
          'dictionary.customOrder': 'Egendefinert rekkefølge',
          'dictionary.searchQuery': 'Ingen resultater for ',
          'dictionary.actionsWithStatus': 'Tiltak som er OK',
          'dictionary.refresh': 'Prøv igjen',
          'dictionary.relatedComponents': 'Tilhørende komponenter',

          'scenarioDrawer.action.descriptionError':
            'Beskrivelse kan ikke være tom',
          'scenarioDrawer.action.urlError': 'Ugyldig URL',
          'scenarioDrawer.action.requiredError': 'Feltet er påkrevd',
          'scenarioDrawer.action.emptyState':
            'Scenariet har ingen definerte tiltak',
          'scenarioDrawer.errors.remainingConsequenceTooHigh':
            'Restkonsekvens kan ikke være høyere enn startkonsekvens',
          'scenarioDrawer.errors.remainingProbabilityTooHigh':
            'Restsannsynlighet kan ikke være høyere enn startsannsynlighet',
          'scenarioDrawer.action.lastUpdated': 'Sist oppdatert:',
          'scenarioDrawer.action.notUpdated': 'Ingen dato',

          'encryption.title': 'Kryptering',

          'rosStatus.statusBadge.missing':
            'Når utkastet er ferdig, kan risikoeier gå gjennom og godkjenne endringene.',
          'rosStatus.outdated': 'Utdatert',
          'rosStatus.updated': 'Oppdatert',
          'rosStatus.veryOutdated': 'Veldig utdatert',
          'rosStatus.updating': 'Lagrer...',
          'rosStatus.statusBadge.approved': 'Godkjent av risikoeier',
          'rosStatus.statusBadge.error': 'Kunne ikke hente status',
          'rosStatus.statusBadge.migration.title':
            'Gjennomgang og lagring av endringer kreves',
          'rosStatus.statusBadge.migration.description':
            'Det har blitt gjort endringer i risiko- og sårbarhetsanalysen, som følge av en migrering til nyeste versjon. Endringene kan være både sletting og endring av informsasjon. Det vil ikke være mulig å lagre endringer av analysen uten å inkludere og godta endringene.',
          'rosStatus.statusBadge.created': 'Opprettet tom ROS',
          'rosStatus.statusBadge.draft': 'Utkast',
          'rosStatus.statusBadge.waiting': 'Avventer godkjenning',
          'rosStatus.statusBadge.published': 'Publisert',
          'rosStatus.statusBadge.draftDeletion': 'Markert for sletting',
          'rosStatus.statusBadge.waitingDeletion': 'Venter på sletting',
          'rosStatus.statusBadge.deletionApproval':
            'Risikoeier kan gå igjennom og godkjenne slettingen.',
          'rosStatus.lastModified': 'Sist publisert: ',
          'rosStatus.daysSinceLastModified':
            '{{days}} dager og {{numCommits}} commits siden',
          'rosStatus.notPublishedYet': 'RoS er ikke publisert enda',
          'rosStatus.errorMessage': 'Kunne ikke hente status',
          'rosStatus.editing': 'Du kan nå gjøre endringer',
          'rosStatus.approveButtonUpdate': 'Godkjenn ROS',
          'rosStatus.approveButtonDelete': 'Godkjenn sletting',
          'rosStatus.prStatus': ' Merge pull requesten i ',
          'rosStatus.prStatus2Update': " for å publisere ROS'en.",
          'rosStatus.prStatus2Delete': " for å slette ROS'en.",
          'rosStatus.moreInformationButton': 'Mer informasjon',
          'rosStatus.difference.description':
            'Oppsummering av endringer som må godkjennes av risikoeier.',
          'rosStatus.difference.publishDate':
            'Siste publiserte endringer {{date}}',
          'rosStatus.difference.fetching': 'Henter endringer',
          'rosStatus.difference.error': 'Feil med uthenting av endringer',
          'rosStatus.difference.newROS':
            'Ingen publiserte ROS-analyser å sammenligne med',
          'rosStatus.difference.differences.title': 'ENDRINGER',
          'rosStatus.difference.differences.titleRemoved':
            'Fjernet fra ROS-analyse',
          'rosStatus.difference.differences.noneRemoved':
            'Ingenting er fjernet',
          'rosStatus.difference.differences.titleExisting':
            'Endret i eksisterende ROS-analyse',
          'rosStatus.difference.differences.noneExisting':
            'Ingenting er endret',
          'rosStatus.difference.differences.titleAdded':
            'Lagt til i ROS-analyse',
          'rosStatus.difference.differences.noneAdded': 'Ingenting er lagt til',
          'rosStatus.updatedStatus.UPDATED': 'Oppdatert statusikon',
          'rosStatus.updatedStatus.LITTLE_OUTDATED': 'Litt utdatert statusikon',
          'rosStatus.updatedStatus.OUTDATED': 'Utdatert statusikon',
          'rosStatus.updatedStatus.VERY_OUTDATED': 'Veldig utdatert statusikon',
          'rosStatus.updatedStatus.error': 'Feil statusikon',
          'rosStatus.updatedStatus.disabled': 'Deaktivert statusikon',
          'rosStatus.updatedStatus.tooltip.OUTDATED':
            'Dette tiltaket er utdatert',
          'rosStatus.updatedStatus.tooltip.VERY_OUTDATED':
            'Dette tiltaket er veldig utdatert',
          'rosStatus.githubLink': 'Gå til GitHub',
          'publishDialog.titleUpdate': 'Godkjenn ROS-analyse',
          'publishDialog.titleDelete': 'Godkjenn sletting',
          'publishDialog.checkboxLabelUpdate':
            'Jeg bekrefter at risikoeier godtar risikoen beskrevet i denne risiko- og sårbarhetsanalysen.',
          'publishDialog.checkboxLabelDelete':
            'Jeg bekrefter at risikoeier godtar slettingen av denne risiko- og sårbarhetsanalysen.',

          'migrationDialog.title': 'Lagre endringer',
          'migrationDialog.description':
            'Endringene er gjort for å følge den nyeste skjemaversjonen.',
          'migrationDialog.migrationTitle': 'Migrering fra {{from}} til {{to}}',
          'migrationDialog.schemaVersion': 'Skjemaversjon',
          'migrationDialog.schemaChangelog': 'Endringslogg for skjema',
          'migrationDialog.checkboxLabel':
            'Jeg bekrefter at jeg har gjennomgått og ønsker å lagre endringene som er gjort under migreringen.',
          'migrationDialog.migration40.changeExplanation':
            'Denne migreringen endrer standard verdiene for konsekvens og sannsynlighet.',
          'migrationDialog.migration40.owner': 'Ansvarlig',
          'migrationDialog.migration40.deadline': 'Frist',
          'migrationDialog.migration40.existingActions': 'Eksisterende tiltak',
          'migrationDialog.migration40.vulnerabilitiesTitle': 'Sårbarheter',
          'migrationDialog.migration40.vulnerabilities.Compromised admin user':
            'Kompromittert adminbruker',
          'migrationDialog.migration40.vulnerabilities.Denial of service':
            'Tjenestenekt',
          'migrationDialog.migration40.vulnerabilities.Disclosed secret':
            'Lekket hemmelighet',
          'migrationDialog.migration40.vulnerabilities.Escalation of rights':
            'Rettighetseskalering',
          'migrationDialog.migration40.vulnerabilities.Excessive use':
            'Overdreven bruk',
          'migrationDialog.migration40.vulnerabilities.Information leak':
            'Informasjonslekkasje',
          'migrationDialog.migration40.vulnerabilities.Unauthorized access':
            'Uautorisert tilgang',
          'migrationDialog.migration40.vulnerabilities.Unmonitored use':
            'Uovervåket bruk',
          'migrationDialog.migration40.vulnerabilities.User repudiation':
            'Benekte brukerhandling',
          'migrationDialog.migration41.changeExplanation':
            'Denne migreringen fjerner ansvarlig («owner») og frist («deadline») feltene fra tiltak, fjerner eksisterende tiltak feltet og oppdaterer verdier for sårbarheter.',
          'migrationDialog.migration41.nokPerIncident': 'NOK/hendelse',
          'migrationDialog.migration41.occurrencesPerYear': 'hendelser/år',
          'migrationDialog.migration42.changeExplanation':
            'Denne migreringen legger til et sist oppdatert felt ("lastUpdated") på tiltak.',
          'migrationDialog.migration50.changeExplanation':
            'Denne migreringen oppdaterer tiltakets status til en ny navnekonvensjon.',
          'migrationDialog.migration51.changeExplanation':
            'Denne migreringen legger til et sist oppdater av felt ("lastUpdatedBy") på tiltak.',
          'migrationDialog.migration51.lastUpdatedBy': 'Sist oppdatert av:',
          'migrationDialog.migration51.addedLastUpdatedBy':
            'La til felt for å spore hvem som oppdaterte et tiltak for {{numberOfChangedActions}} eksisterende tiltak',
          'migrationDialog.migration52.changeExplanation':
            'Denne migreringen fjerner det ubrukte konseptet verdivurderinger ("valuations") fra RiSc-dokumentet.',
          'migrationDialog.migration52.title': 'Verdivurderinger fjernet',
          'migrationDialog.migration52.oldValue':
            'Fjernet eksisterende verdivurderinger',
          'migrationDialog.removed': 'Fjernet',
          'comparisonDialog.noChanges': 'Ingen endringer',
          'comparisonDialog.changes': 'Endringer av RoSen',
          'comparisonDialog.noDescription': 'Ingen beskrivelse spesifisert',
          'comparisonDialog.noURL': 'Ingen URL spesifisert',
          'comparisonDialog.risk.consequenceUnit': 'NOK/hendelse',
          'comparisonDialog.risk.probabilityUnit': 'hendelser/år',
          'comparisonDialog.valuation.integrity.Insignificant': 'Insignifikant',
          'comparisonDialog.valuation.integrity.Expected': 'Forventet',
          'comparisonDialog.valuation.integrity.Dependent': 'Avhengig',
          'comparisonDialog.valuation.integrity.Critical': 'Kritisk',
          'comparisonDialog.valuation.availability.Insignificant':
            'Insignifikant',
          'comparisonDialog.valuation.availability.2 days': '2 dager',
          'comparisonDialog.valuation.availability.4 hours': '4 timer',
          'comparisonDialog.valuation.availability.Immediate': 'Umiddelbart',
          'comparisonDialog.valuation.confidentiality.Public': 'Offentlig',
          'comparisonDialog.valuation.confidentiality.Internal': 'Intern',
          'comparisonDialog.valuation.confidentiality.Confidential':
            'Konfidensielt',
          'comparisonDialog.valuation.confidentiality.Strictly confidential':
            'Strengt konfidensielt',
          'supportDialog.title': 'Support',
          'supportDialog.openEntry': 'Åpne',
          'supportDialog.entries.riscFeedbackChannel.title':
            'RoS tilbakemeldingskanal',
          'supportDialog.entries.riscFeedbackChannel.description':
            '#kodenær-ros-tilbakemelding',
          'supportDialog.entries.riscDocumentation.title': 'RoS dokumentasjon',
          'supportDialog.entries.riscDocumentation.description':
            'Confluence - RISC',
          'scenarioTable.title': 'Risikoscenarioer',
          'scenarioTable.addScenarioButton': 'Legg til scenario',
          'scenarioTable.noActions': 'Ingen tiltak',
          'scenarioTable.columns.consequenceChar': 'K',
          'scenarioTable.columns.probabilityChar': 'S',
          'scenarioTable.columns.completed': 'fullført',
          'scenarioTable.editButton': 'Rediger liste',
          'scenarioTable.doneEditing': 'Avslutt redigering',
          'scenarioTable.noActionsLong': 'Scenarioet har ingen tiltak',

          'riskMatrix.title': 'Risikomatrise',
          'riskMatrix.estimatedRisk.title': 'Estimert risiko',
          'riskMatrix.estimatedRisk.suffix.thousand': '{{count}} tusen',
          'riskMatrix.estimatedRisk.suffix.million_one': '{{count}} million',
          'riskMatrix.estimatedRisk.suffix.million_other':
            '{{count}} millioner',
          'riskMatrix.estimatedRisk.suffix.billion_one': '{{count}} milliard',
          'riskMatrix.estimatedRisk.suffix.billion_other':
            '{{count}} milliarder',
          'riskMatrix.estimatedRisk.suffix.trillion_one': '{{count}} billion',
          'riskMatrix.estimatedRisk.suffix.trillion_other':
            '{{count}} billioner',
          'riskMatrix.estimatedRisk.unit.nokPerYear': 'kr/år',
          'riskMatrix.tooltip.title': 'Risikoscenarioer',
          'riskMatrix.currentRisk.title': 'Reduksjon i risiko',
          'riskMatrix.currentRisk.description':
            'Diagrammet illustrerer utviklingen fra dagens startrisiko mot beregnet sluttrisiko. <strong>{{actionsOk}}</strong> fullførte tiltak utgjør en reduksjon på <strong>{{reduction}} kr/år.</strong>',

          'infoDialog.title': 'Estimert risiko',
          'infoDialog.description':
            'Den estimerte risikoen er basert på hvor stor risiko de forskjellige scenariene utgjør. Hvis det er stor sannsynlighet for at en alvorlig konsekvens skjer er det høy risiko for at det kan bli en stor kostnad for organisasjonen. Kostnaden er med andre ord et forsøk på å konkretisere verdien av risiko og er summen av den estimerte risikoen for alle risikoscenariene i denne ROS-analysen.',
          'infoDialog.calculatedHowTitle':
            'Hvordan regner vi ut estimert risiko?',
          'infoDialog.calculatedHow':
            'Sannsynlighet (S) måles i hendelser per år og konsekvens (K) måles i kroner per hendelse. Den estimerte risikoen blir da: 20',
          'infoDialog.calculatedHowExponent': 'S+K-1',
          'infoDialog.consequenceTitle': 'Konsekvens (kr/hendelse)',
          'infoDialog.consequenceUnit': 'kr/hendelse',
          'infoDialog.consequenceDescription.oneworkday': '1 dagsverk',
          'infoDialog.consequenceDescription.oneworkmonth': '1 månedsverk',
          'infoDialog.consequenceDescription.oneworkyear': '1 årsverk',
          'infoDialog.consequenceDescription.20workyears': '20 årsverk',
          'infoDialog.consequenceDescription.400workyears': '400 årsverk',
          'infoDialog.probabilityTitle': 'Sannsynlighet (hendelser/år)',
          'infoDialog.probabilityUnit': 'hendelse/år',
          'infoDialog.probabilityDescription.every400years':
            '1 gang hvert 400. år',
          'infoDialog.probabilityDescription.every20years':
            '1 gang hvert 20. år',
          'infoDialog.probabilityDescription.annualy': 'Årlig',
          'infoDialog.probabilityDescription.monthly': 'Månedlig',
          'infoDialog.probabilityDescription.daily': 'Daglig',
          'infoDialog.example.part1': 'Et risikoscenario med sannsynlighet ',
          'infoDialog.example.part2': ' og konsekvens ',
          'infoDialog.example.part3': ' har en estimert risiko på ',
          'infoDialog.units.nokPerIncident': 'kr/hendelse',
          'infoDialog.units.incidentsPerYear': 'hendelser/år',
          'infoDialog.units.nokPerYear': 'kr/år',
          'infoDialog.currentRisk.title': 'Nårisiko utregning',
          'infoDialog.currentRisk.description':
            'Nåværende risiko kombinerer startrisikoen, den planlagte sluttrisikoen og hvor langt risikoreduserende tiltak har kommet. For hvert scenario beregnes startrisiko: ',
          'infoDialog.currentRisk.actionRatio':
            'Så måler vi hvor mange relevante tiltak som er fullført (ratio) = (antall fullførte tiltak) / (antall tiltak som ikke er merket «Ikke relevant»). Hvis det ikke finnes relevante tiltak, settes forholdet til 0.',
          'infoDialog.currentRisk.aggregated':
            'Den aggregerte nåværende risikoen er summen ',
          'infoDialog.currentRisk.currentRiskCost':
            'Den Aggregert nårisiko kostnaden interpolerer mellom start- og restrisiko basert på forholdet',
          'infoDialog.currentRisk.aggregatedSums':
            'på tvers av alle scenarier, rapportert i NOK per år.',
          'infoDialog.currentRisk.remainingRiskCost': 'og sluttrisiko',
          'rosDialog.titleNew': 'Ny risiko- og sårbarhetsanalyse',
          'rosDialog.titleEdit': 'Rediger tittel og omfang',
          'rosDialog.initialRiscScopeDescription':
            'Vil du generere en RoS med forhåndsdefinerte scenarioer og tiltak?',
          'rosDialog.initialRiscApplicationType':
            'Hva slags applikasjon har du?',
          'rosDialog.noInitialRiScFound':
            'Ingen forhåndsdefinert RoS er tilgjengelig for øyeblikket.',
          'rosDialog.editEncryption': 'Rediger kryptering',
          'rosDialog.titleError': 'ROS-analysen må ha en tittel',
          'rosDialog.scopeDescription':
            'Beskriv hva analysen skal vurdere. Hva som ikke inngår som en del av omfanget må også defineres.', // TODO
          'rosDialog.scopeError': 'ROS-analysen må ha et omfang',
          'rosDialog.generateInitialDescription':
            'Kodenær RoS lar deg opprette en initiell RoS basert på opplysninger om kodebasen i kartverket.dev, sikkerhetsmetrikker og sikkerhetskontrollere.',
          'rosDialog.generateInitialToggleDescription':
            'Vil du generere initiell RoS?',
          'rosDialog.generateObsRiScDescription':
            "Denne RoS'en inneholder scenarier som bør vurderes for bygg og deploy.",
          'rosDialog.generateInternalJobRiScDescription':
            "Denne RoS'en inneholder scenarier som bør vurderes for interne verktøy og jobber.",
          'rosDialog.generateStandardRiScDescription':
            "Denne RoS'en er generert fra opplysninger om kodebasen i kartverket.dev, sikkerhetsmetrikker og sikkerhetskontrollere.",
          'rosDialog.fromScratch': 'Tom',
          'rosDialog.generateDefault': 'Initiell',
          'rosDialog.stepRiscDetails': 'RoS-detaljer',
          'rosDialog.initialRiscTitle': 'Forhåndsdefinert RoS',
          'rosDialog.stepEncryption': 'Konfigurer kryptering',
          'rosDialog.applicationType': 'Velg type applikasjon',
          'rosDialog.titleAndScope': 'Tittel og omfang',
          'rosDialog.recommendedForComponentOfType':
            'Anbefalt for komponenter av typen',
          'sopsConfigDialog.title': 'Kryptering',
          'sopsConfigDialog.writeLocalRiscSuffix':
            'for å lære mer om å skrive kodenær RoS lokalt.',
          'sopsConfigDialog.description.new':
            'For å bruke kodenær RoS må du først aktivere en krypteringsløsning ved å velge en nøkkel fra Google Cloud Platform (GCP) for kryptering og dekryptering. Følg trinnene under for å fullføre oppsettet:',
          'sopsConfigDialog.description.edit':
            'Risiko og sårbarhetsanalysen vil bli kryptert for å sørge for konfidiensialitet. Du kan endre hvilken krypteringsnøkkel fra Google Cloud Platform (GCP) som skal bli brukt her:',
          'sopsConfigDialog.selectKeysTitle': 'Velg krypteringsnøkkel',
          'sopsConfigDialog.chooseGcpCryptoKey': 'Velg GCP-nøkkel',
          'sopsConfigDialog.gcpCryptoKeyDescription':
            "Fra listen under kan du velge hvilken GCP-nøkkel du vil bruke for å kryptere og dekryptere RoS'en.",
          'sopsConfigDialog.cryptoKeyOptionInfo':
            '(Prosjekt: {{projectId}}, Tilganger: {{permissions}})',
          'sopsConfigDialog.cryptoKeyPermissionENCRYPT': 'Kryptere',
          'sopsConfigDialog.cryptoKeyPermissionDECRYPT': 'Dekryptere',
          'sopsConfigDialog.cryptoKeyPermissionUNKNOWN':
            '⚠️ Ukjent - du bør bytte til en annen nøkkel',
          'sopsConfigDialog.gcpCryptoKeyNoSelectableKey':
            'Du har ikke tilgang til noe egnede GCP-nøkler.',
          'sopsConfigDialog.gcpCryptoKeyNonSelectedErrorMessage':
            'En GCP-nøkkel må være valgt.',
          'sopsConfigDialog.publicAgeKeysAlreadyPresent':
            'Følgende age-nøkler er allerede til stede:',
          'sopsConfigDialog.publicAgeKeyQuestion':
            'Trenger noen å skrive RoS lokalt i sin editor?',
          'sopsConfigDialog.publicAgeKeyDescription':
            'Legg ved offentlige age-nøkkel til personer som ønsker å skrive kodenær RoS lokalt',
          'sopsConfigDialog.addPublicAgeKey': 'Legg til nøkkel',
          'sopsConfigDialog.publicAgeKey': 'Offentlig age-nøkkel',
          'sopsConfigDialog.update': 'Oppdater',
          'sopsConfigDialog.createPRTitle':
            'Lag en Pull Request med det nye krypteringsskjemaet',
          'sopsConfigDialog.createPRContent':
            'Krypteringskonfigurasjonen er nå klar og har blitt lagt til i en ny branch. Nedenfor kan du opprette en PR med disse endringene. Alternativt kan du flytte endringene til en annen branch ved å klikke på "Branch"-knappen og velge en annen aktiv branch.',
          'sopsConfigDialog.PRTitle': "Se gjennom og merge Pull Request'en",
          'sopsConfigDialog.SummaryDescription':
            'En PR med det nye krypteringsskjemaet har nå blitt opprettet.',
          'sopsConfigDialog.SummaryGCP': 'Den valgte GCP-nøkkelen er ',
          'sopsConfigDialog.SummaryAgeKeys':
            ' Følgende offentlige age nøkler har også blitt lagt ved: ',
          'sopsConfigDialog.PRContent':
            "Klikk på knappen nedenfor for å se gjennom endringene og merge PR-en. Etter at du har merget PR-en, kan du begynne å opprette og administrere RoS'er.",
          'sopsConfigDialog.required': 'Dette feltet er påkrevd',
          'sopsConfigDialog.publicKeyHelperTextKeyAlreadyExists':
            'Offentlig møkkel allerede lagt til',
          'sopsConfigDialog.publicKeyHelperTextKeyAlreadyExistInSopsConfig':
            'Offentlig nøkkel er allerede i eksisterende SOPS-konfigurasjon',
          'sopsConfigDialog.publicKeyHelperTextKeyNotValid':
            'Offentlig nøkkel er ikke en gyldig age offentlig nøkkel',
          'sopsConfigDialog.pendingTitle': 'Avventende SOPS-konfigurasjon',
          'sopsConfigDialog.pendingDescription':
            'Følgende pull requests er åpnet for å inkludere en SOPS-konfigurasjon i GitHub-repoet',
          'sopsConfigDialog.secondaryPullRequestText': 'Åpnet _n_ siden av',
          'sopsConfigDialog.reEncryptTitle':
            "Rekryptering av eksisterende RoS'er",
          'sopsConfigDialog.reEncryptDescription':
            "Ved å oppdatere SOPS-konfigurasjonen, vil du ikke lenger kunne dekryptere gamle RoS'er kryptert med den forrige SOPS-konfigurasjonen. Vi anbefaler derfor på det sterkeste å rekryptere eksisterende RoS'er på hoved-branchen i ditt GitHub-repo for at du skal kunne fortsette å lese dem med din oppdaterte SOPS-konfigurasjon.",
          'sopsConfigDialog.reEncryptConsentDescription':
            "Vil du rekryptere eksisterende RoS'er på hoved-branchen til",
          'sopsConfigDialog.openPR': 'Åpne pull request',
          'sopsConfigDialog.gotoPullRequest': 'Gå til pull request',
          'scenarioStepper.initialRiskStep.title': 'Startrisiko',
          'scenarioStepper.initialRiskStep.subtitle':
            'Risikoen er kombinasjonen av konsekvensen av scenarioet og sannsynligheten for at det inntreffer.',
          'scenarioStepper.initialRiskStep.consequenceSubtitle':
            'Hvor alvorlig er den potensielle konsekvensen? Hvis konsekvensen gjelder flere kategorier velg det høyeste konsekvensnivået av disse.',
          'scenarioStepper.initialRiskStep.probabilitySubtitle':
            'Hvor stor sannsynlighet er det for at dette scenarioet vil forekomme. Dersom du er mellom to sannsynlighetsverdier velg den høyeste.',
          'scenarioStepper.restRiskStep.title': 'Restrisiko',
          'scenarioStepper.restRiskStep.subtitle':
            'Hvordan endrer risikoen seg fra startrisikoen etter alle tiltakene er fullført?',
          'scenarioStepper.restRiskStep.consequenceSubtitle':
            'Hva blir konsekvensen etter alle tiltakene er fullført?',
          'scenarioStepper.restRiskStep.probabilitySubtitle':
            'Hva blir sannsynligheten etter alle tiltakene er fullført?',

          'scenarioDrawer.title': 'Risikoscenario',
          'scenarioDrawer.newTitle': 'Nytt risikoscenario',
          'scenarioDrawer.titleError': 'Scenarioet må ha en tittel',
          'scenarioDrawer.createNewScenario': 'Opprett nytt scenario',
          'scenarioDrawer.saveAsDraft': 'Lagre som utkast',
          'scenarioDrawer.subtitle':
            'En uønsket hendelse som potensielt kan ramme komponenten',
          'scenarioDrawer.riskMatrixModal.title': 'Risikomatriser',
          'scenarioDrawer.riskMatrixModal.startRisk':
            'Hvor stor er risikoen før man utfører noen tiltak?',
          'scenarioDrawer.riskMatrixModal.restRisk':
            'Hvor stor er risikoen etter at alle tiltakene er fullført?',

          'scenarioDrawer.threatActorSubtitle':
            'Noen som prøver å få tilgang til eller misbruke systemet',
          'scenarioDrawer.vulnerabilitySubtitle':
            'Svakhet i systemet som kan utnyttes av trusselaktøren',
          'scenarioDrawer.consequenceTab.subtitle':
            'Hvor alvorlig er den potensielle konsekvensen? Hvis scenarioet kan få konsekvenser i flere kategorier velg det høyeste konsekvensnivået av disse.',
          'scenarioDrawer.probabilityTab.subtitle':
            'Hvor stor sannsynlighet er det for at dette scenarioet vil forekomme. Dersom du er mellom to sannsynlighetsverdier velg den høyeste.',
          'scenarioDrawer.measureTab.subtitle':
            'Hvilke tiltak bør gjøres for å unngå scenarioet?',
          'scenarioDrawer.measureTab.measureOwnerDescription':
            'De eller den som er ansvarlig for at tiltaket blir gjennomført',
          'scenarioDrawer.measureTab.addMeasureButton': 'Legg til tiltak',
          'scenarioDrawer.measureTab.plannedMeasures': 'Planlagte tiltak',
          'scenarioDrawer.restRiskTab.subtitle':
            'Sett restrisiko for scenarioet. Restrisiko er konsekvens og sannsynlighet for scenarioet etter at alle tiltak i listen er gjennomført.',
          'scenarioDrawer.deleteScenarioButton': 'Slett scenario',
          'scenarioDrawer.deleteScenarioConfirmation':
            'Er du sikker på at du vil slette scenario?',
          'scenarioDrawer.deleteActionButton': 'Slett tiltak',
          'scenarioDrawer.deleteActionConfirmation':
            'Er du sikker på at du vil slette tiltak?',
          'scenarioDrawer.closeConfirmation': 'Vil du lagre endringene dine?',
          'scenarioDrawer.measureTab.addMeasureTitleError':
            'Tiltak må ha en tittel',
          'scenarioDrawer.measureTab.urlDescription':
            'For eksempel lenke til Jira-oppgave',
          'consequenceTable.rows.1': 'Ubetydelig',
          'consequenceTable.rows.2': 'Liten',
          'consequenceTable.rows.3': 'Moderat',
          'consequenceTable.rows.4': 'Alvorlig',
          'consequenceTable.rows.5': 'Kritisk',
          'consequenceTable.columns.health': 'Liv og helse',
          'consequenceTable.columns.economical': 'Økonomi og drift',
          'consequenceTable.columns.privacy': 'Personvern',
          'consequenceTable.columns.reputation': 'Omdømme og tillit',
          'consequenceTable.cells.health.1':
            'Liv og helse kan ikke være mindre alvorlig enn 3',
          'consequenceTable.cells.health.2':
            'Liv og helse kan ikke være mindre alvorlig enn 3',
          'consequenceTable.cells.health.3':
            'Lettere skade på personer.\n\nNoe skade på lokalt miljø.',
          'consequenceTable.cells.health.4':
            'Et fåtall alvorlige personskader.\n\nModerat skade på miljø på et begrenset område.',
          'consequenceTable.cells.health.5':
            'Dødsfall. Svært alvorlig skade på miljø over store områder.',
          'consequenceTable.cells.economical.1':
            'Ubetydelig økonomisk tap.\n\nKan fikses med 1 dagsverk.',
          'consequenceTable.cells.economical.2':
            'Mindre økonomisk tap.\n\nKan fikses med 1 månedsverk.',
          'consequenceTable.cells.economical.3':
            'Moderat økonomisk tap.\n\nKan fikses med 1 årsverk.',
          'consequenceTable.cells.economical.4':
            'Større økonomisk tap.\n\nKan fikses med 20 årsverk.',
          'consequenceTable.cells.economical.5':
            'Kritisk økonomisk tap.\n\nKan fikses med 400 årsverk.',
          'consequenceTable.cells.privacy.1': 'Ingen brudd.',
          'consequenceTable.cells.privacy.2': 'Mindre brudd.',
          'consequenceTable.cells.privacy.3':
            'Brudd på registrertes rettigheter og friheter.',
          'consequenceTable.cells.privacy.4':
            'Meget alvorlige brudd på registrertes rettigheter og friheter, samt lovbrudd.',
          'consequenceTable.cells.privacy.5':
            'Personvern kan ikke være mer alvorlig enn 4',
          'consequenceTable.cells.reputation.1':
            'Liten fare for omdømmetap og liten innvikrning på tillit',
          'consequenceTable.cells.reputation.2':
            'Negativ oppmerksomhet i regionale og nasjonale medier som fører til omdømmetap.\n\nKan redusere tillit.',
          'consequenceTable.cells.reputation.3':
            'Negativ oppmerksomhet i nasjonale og internasjonale medier som fører til alvorlig omdømmetap.\n\nAlvorlig redusert tillit fra myndigheter.\n\nBrukere som ikke tør / vil bruke tjenestene.',
          'consequenceTable.cells.reputation.4':
            'Omdømme og tillit kan ikke være mer alvorlig enn 3',
          'consequenceTable.cells.reputation.5':
            'Omdømme og tillit kan ikke være mer alvorlig enn 3',

          'probabilityTable.rows.1': 'Svært liten',
          'probabilityTable.rows.2': 'Liten',
          'probabilityTable.rows.3': 'Moderat',
          'probabilityTable.rows.4': 'Stor',
          'probabilityTable.rows.5': 'Svært stor',
          'probabilityTable.cells.1':
            'Scenarioet er usannsynlig å inntreffe.\n\nDet inntreffer sjeldnere enn hvert 400. år',
          'probabilityTable.cells.2':
            'Scenarioet er usannsynlig å inntreffe.\n\nDet kan inntreffe hvert 20. år',
          'probabilityTable.cells.3':
            'Scenarioet kan inntreffe.\n\nDet kan inntreffe nærmest årlig',
          'probabilityTable.cells.4':
            'Scenarioet vil med stor sannsynlighet inntreffe.\n\nDet kan inntreffe nærmest månedlig',
          'probabilityTable.cells.5':
            'Scenarioet er nesten garantert å inntreffe.\n\nDet kan inntreffe nærmest daglig',
          'threatActors.Script kiddie': 'Datasnok',
          'threatActors.Hacktivist': 'Hacktivist',
          'threatActors.Reckless employee': 'Uheldig ansatt',
          'threatActors.Insider': 'Innside-aktør',
          'threatActors.Organised crime': 'Organiserte kriminelle',
          'threatActors.Terrorist organisation': 'Terroristorganisasjon',
          'threatActors.Nation/government': 'Nasjon/stat',

          'vulnerabilities.Flawed design': 'Mangelfullt design',
          'vulnerabilities.Misconfiguration': 'Feilkonfigurering',
          'vulnerabilities.Dependency vulnerability': 'Sårbarhet i avhengighet',
          'vulnerabilities.Unauthorized access': 'Uautorisert tilgang',
          'vulnerabilities.Unmonitored use': 'Uovervåket bruk',
          'vulnerabilities.Input tampering': 'Klussing med input',
          'vulnerabilities.Information leak': 'Informasjonslekkasje',
          'vulnerabilities.Excessive use': 'Overdreven bruk',

          'threatActorsAndVulnerabilities.title':
            'Trusselaktører og sårbarheter',
          'threatActorsAndVulnerabilities.allCovered':
            'Alle {{kind}} er dekket i minst ett scenario.',
          'threatActorsAndVulnerabilities.oneNotCovered':
            '{{kind}} <b>{{notCovered}}</b> er ikke dekket i noen scenarioer',
          'threatActorsAndVulnerabilities.twoNotCovered':
            '{{kind}} <b>{{notCovered1}}</b> og <b>{{notCovered2}}</b> er ikke dekket i noen scenarioer.',
          'threatActorsAndVulnerabilities.multipleNotCovered':
            'Flere {{kind}} er ikke dekket. Dette inkluderer <b>{{notCovered1}}</b>, <b>{{notCovered2}}</b> og <b>{{notCovered3}}</b>',
          'threatActorsAndVulnerabilities.showMoreInfo': 'Vis mer informasjon',
          'threatActorsAndVulnerabilities.dialogHeader':
            'Scenarier som dekker sårbarheter og trusselaktører',
          'threatActorsAndVulnerabilities.vulnerabilityCoverage':
            'Sårbarheter dekket',
          'threatActorsAndVulnerabilities.threatActorCoverage':
            'Trusselaktører dekket',
          'threatActorsAndVulnerabilities.coverageRatio': '{{covered}} av {{total}}',
          'threatActorsAndVulnerabilities.tableColumnThreatActor': 'Trusselaktør',
          'threatActorsAndVulnerabilities.tableColumnVulnerability': 'Sårbarhet',
          'threatActorsAndVulnerabilities.tableColumnScenarios':
            'Antall scenarioer',
          'actionStatus.Not started': 'Ikke startet',
          'actionStatus.In progress': 'Startet',
          'actionStatus.On hold': 'På vent',
          'actionStatus.Completed': 'Fullført',
          'actionStatus.Aborted': 'Avbrutt',
          'actionStatus.OK': 'OK',
          'actionStatus.Not OK': 'Ikke OK',
          'actionStatus.Not relevant': 'Ikke relevant',
          'errorMessages.DefaultErrorMessage': 'Det oppstod en feil',
          'errorMessages.ErrorWhenNoWriteAccessToRepository':
            'Kunne ikke oppdatere ROS. Du har ikke skrivetilgang til {{owner}}/{{name}}.',
          'errorMessages.ErrorWhenUpdatingRiSc':
            'Kunne ikke lagre risiko- og sårbarhetsanalyse',
          'errorMessages.ErrorWhenDeletingRiSc':
            'Kunne ikke slette risiko- og sårbarhetsanalyse',
          'errorMessages.ErrorWhenCreatingRiSc':
            'Kunne ikke opprette risiko- og sårbarhetsanalyse',
          'errorMessages.RiScDoesNotExist':
            'Risiko- og sårbarhetsanalysen du prøver å åpne eksisterer ikke',
          'errorMessages.ScenarioDoesNotExist':
            'Scenariet du prøver å åpne eksisterer ikke',
          'errorMessages.ErrorWhenCreatingPullRequest':
            'Kunne ikke lagre godkjenning av risiko- og sårbarhetsanalysen',
          'errorMessages.ErrorWhenFetchingRiScs':
            'Kunne ikke hente risiko- og sårbarhetsanalyser med id-er: ',
          'errorMessages.FailedToFetchRiScs':
            'Kunne ikke hente risiko- og sårbarhetsanalyser',
          'errorMessages.ErrorWhenFetchingSopsConfig':
            'Kunne ikke hente SOPS-konfigurasjon',
          'errorMessages.FailedToCreateSops':
            'Kunne ikke opprette SOPS-konfigurasjon',
          'errorMessages.FailedToUpdateSops':
            'SOPS-konfigurasjon kunne ikke oppdateres',
          'errorMessages.ErrorWhenFetchingGcpCryptoKeys':
            'Kunne ikke hente GCP-krypteringsnøkler',
          'infoMessages.OpenedPullRequest': 'Åpnet pull request',
          'infoMessages.CreatedPullRequest':
            'Godkjenning av risiko- og sårbarhetsanalysen ble lagret',
          'infoMessages.DeletedRiSc':
            'Risiko- og sårbarhetsanalysen ble slettet',
          'infoMessages.DeletedRiScRequiresApproval':
            'Risiko- og sårbarhetsanalysen ble markert for sletting og trenger godkjenning',
          'infoMessages.UpdatedRiSc':
            'Risiko- og sårbarhetsanalysen ble oppdatert',
          'infoMessages.UpdatedSops': 'SOPS-konfigurasjon oppdatert',
          'infoMessages.UpdatedRiScRequiresNewApproval':
            'Risiko- og sårbarhetsanalysen ble oppdatert og trenger ny godkjenning',
          'infoMessages.CreatedRiSc':
            'Risiko- og sårbarhetsanalyse ble opprettet',
          'infoMessages.UpdatedRiScAndCreatedPullRequest':
            'Risiko- og sårbarhetsanalysen ble oppdatert og er klar for godkjenning i Github',
          'infoMessages.NoSopsConfigFound':
            'Ingen SOPS-konfigurasjon funnet på default branchen til GitHub-repoet',
          'infoMessages.CreatedSops': 'SOPS-konfigurasjon opprettet',
          'infoMessages.UpdateAction': 'Oppdaterer tiltak ...',
          'infoMessages.UpdateInfoMessage':
            'Vennligst vent et par sekunder mens endringene lagres.',
          'deleteDialog.title': 'Slett risiko- og sårbarhetsanalyse',
          'deleteDialog.confirmationMessage':
            'Er du sikker på at du vil slette denne risiko- og sårbarhetsanalysen?',
          'feedbackDialog.title': 'Gi oss en tilbakemelding!',
          'feedbackDialog.description': 'Din tilbakemelding',
          'feedbackDialog.confirmationMessage': 'Takk for din tilbakemelding.',
          'feedbackDialog.feedbackButton': 'Gi tilbakemelding',
          'feedbackDialog.errorMessage': 'Kunne ikke sende tilbakemelding.',
          'feedbackDialog.sendButton': 'Send',
          'filterButton.veryOutdated': 'Veldig utdaterte tiltak',
          'filterButton.outdated': 'Utdaterte tiltak',
          'filterButton.listUpdatedActions': 'Nylig oppdaterte tiltak',
          'firstRiScCard.noRiScYet': 'Ingen RoS-analyser opprettet enda',
          'firstRiScCard.getStarted':
            'Kom igang med risiko- og sårbarhetsanalyse for ditt team',
          'filter.title': 'Tittel (a-å)',
          'filter.initialRisk': 'Startrisiko (høy-lav)',
          'filter.completedActions': 'Flest fullførte tiltak',
          'filter.remainingActions': 'Flest gjennværende tiltak',
        },
      }),
  },
});
