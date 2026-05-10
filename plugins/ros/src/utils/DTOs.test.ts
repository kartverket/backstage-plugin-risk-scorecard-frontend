import { ProfileInfo } from '@backstage/core-plugin-api';
import { dtoToRiSc, riScToDTOString, RiScDTO, SopsConfigDTO } from './DTOs';
import { RiSc } from './types';

describe('RiSc DTO mapping', () => {
  it('keeps appliesTo from DTOs', () => {
    const riScDTO: RiScDTO = {
      schemaVersion: '5.2',
      title: 'System RoS',
      scope: 'Applies to multiple entities',
      appliesTo: [
        'backstage:component:default/component-a',
        'backstage:system:default/system-a',
      ],
      scenarios: [],
    };

    expect(dtoToRiSc(riScDTO).appliesTo).toEqual([
      'backstage:component:default/component-a',
      'backstage:system:default/system-a',
    ]);
  });

  it('keeps appliesTo in serialized save payloads when there is a system RiSc scope', () => {
    const riSc: RiSc = {
      schemaVersion: '5.2',
      title: 'System RoS',
      scope: 'Applies to multiple entities',
      appliesTo: [
        'backstage:component:default/component-a',
        'backstage:system:default/system-a',
      ],
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

    expect(serializedRiSc.appliesTo).toEqual([
      'backstage:component:default/component-a',
      'backstage:system:default/system-a',
    ]);
  });

  it('keeps appliesTo in serialized save payloads when only one entity is selected', () => {
    const riSc: RiSc = {
      schemaVersion: '5.2',
      title: 'Component RoS',
      scope: 'Applies to one entity',
      appliesTo: ['backstage:component:default/component-a'],
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

    expect(serializedRiSc.appliesTo).toEqual([
      'backstage:component:default/component-a',
    ]);
  });
});
