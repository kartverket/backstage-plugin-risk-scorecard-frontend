import {
  ActionStatusOptions,
  ThreatActorsOptions,
  VulnerabilitiesOptions,
} from './constants';
import { pluginRiScMessages } from './translations';

describe('translations for schema options', () => {
  it('should have translation keys for all values in threatActorOptions', () => {
    const threatActorEnumValues = Object.values(ThreatActorsOptions);
    const threatActorTranslationKeys = Object.keys(
      pluginRiScMessages.threatActors,
    );

    expect(threatActorTranslationKeys.sort()).toEqual(
      threatActorEnumValues.sort(),
    );
  });

  it('should have translation keys for all values in vulnerabilitiesOptions', () => {
    const vulnerabilitiesEnumValues = Object.values(VulnerabilitiesOptions);
    const vulnerabilitiesTranslationKeys = Object.keys(
      pluginRiScMessages.vulnerabilities,
    );

    expect(vulnerabilitiesTranslationKeys.sort()).toEqual(
      vulnerabilitiesEnumValues.sort(),
    );
  });

  it('should have translation keys for all values in actionStatusOptions', () => {
    const actionStatusEnumValues = [...Object.values(ActionStatusOptions)];
    const actionStatusTranslationKeys = Object.keys(
      pluginRiScMessages.actionStatus,
    );

    expect(actionStatusTranslationKeys.sort()).toEqual(
      actionStatusEnumValues.sort(),
    );
  });
});
