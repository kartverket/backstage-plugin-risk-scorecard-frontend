import { ProfileInfo } from '@backstage/core-plugin-api';
import { dtoToRiSc, riScToDTOString, RiScDTO, SopsConfigDTO } from './DTOs';
import { RiSc } from './types';

describe('RiSc DTO mapping', () => {
  it('keeps unencryptedMetadata.appliesTo from DTOs', () => {
    const riScDTO: RiScDTO = {
      schemaVersion: '5.3',
      title: 'System RoS',
      scope: 'Applies to multiple entities',
      unencryptedMetadata: {
        appliesTo: [
          'backstage:component:default/component-a',
          'backstage:system:default/system-a',
        ],
      },
      scenarios: [],
    };

    expect(dtoToRiSc(riScDTO).unencryptedMetadata?.appliesTo).toEqual([
      'backstage:component:default/component-a',
      'backstage:system:default/system-a',
    ]);
  });

  it('keeps unencryptedMetadata.appliesTo in serialized save payloads when there is a system RiSc scope', () => {
    const riSc: RiSc = {
      schemaVersion: '5.3',
      title: 'System RoS',
      scope: 'Applies to multiple entities',
      unencryptedMetadata: {
        appliesTo: [
          'backstage:component:default/component-a',
          'backstage:system:default/system-a',
        ],
      },
      scenarios: [],
    };
    const profile: ProfileInfo = {
      displayName: 'User',
      email: 'user@example.com',
    };
    const sopsConfig = {
      shamir_threshold: 2,
      gcp_kms: [],
    } as SopsConfigDTO;

    const payload = JSON.parse(
      riScToDTOString(riSc, true, profile, sopsConfig),
    );
    const serializedRiSc = JSON.parse(payload.riSc);

    expect(serializedRiSc.unencryptedMetadata.appliesTo).toEqual([
      'backstage:component:default/component-a',
      'backstage:system:default/system-a',
    ]);
  });

  it('keeps unencryptedMetadata.appliesTo in serialized save payloads when only one entity is selected', () => {
    const riSc: RiSc = {
      schemaVersion: '5.3',
      title: 'Component RoS',
      scope: 'Applies to one entity',
      unencryptedMetadata: {
        appliesTo: ['backstage:component:default/component-a'],
      },
      scenarios: [],
    };
    const profile: ProfileInfo = {
      displayName: 'User',
      email: 'user@example.com',
    };
    const sopsConfig = {
      shamir_threshold: 2,
      gcp_kms: [],
    } as SopsConfigDTO;

    const payload = JSON.parse(
      riScToDTOString(riSc, true, profile, sopsConfig),
    );
    const serializedRiSc = JSON.parse(payload.riSc);

    expect(serializedRiSc.unencryptedMetadata.appliesTo).toEqual([
      'backstage:component:default/component-a',
    ]);
  });
});
