import { getSystemRiScsNotInSelector } from './riscIndex';
import type { LockedRiSc, RiScWithMetadata } from './types';

describe('getSystemRiScsNotInSelector', () => {
  it('excludes RiScs that are already available or locked in the selector', () => {
    const systemRiScs = [
      {
        id: 'risc-1',
        componentRef: 'component:default/source-1',
        sourceUrl: 'https://example.org/risc-1.risc.yaml',
      },
      {
        id: 'risc-2',
        componentRef: 'component:default/source-2',
        sourceUrl: 'https://example.org/risc-2.risc.yaml',
      },
      {
        id: 'risc-3',
        componentRef: 'component:default/source-3',
        sourceUrl: 'https://example.org/risc-3.risc.yaml',
      },
    ];

    expect(
      getSystemRiScsNotInSelector(
        systemRiScs,
        [{ id: 'risc-1' } as RiScWithMetadata],
        [{ id: 'risc-2', encryptionKeyId: null } as LockedRiSc],
      ),
    ).toEqual([
      {
        id: 'risc-3',
        componentRef: 'component:default/source-3',
        sourceUrl: 'https://example.org/risc-3.risc.yaml',
      },
    ]);
  });
});
