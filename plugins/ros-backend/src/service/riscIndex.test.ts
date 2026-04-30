/**
 * @jest-environment node
 */

import type { LoggerService } from '@backstage/backend-plugin-api';
import { parseAppliesToBackstageEntityRefs } from './riscIndex';

describe('parseAppliesToBackstageEntityRefs', () => {
  const logger = createLogger();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('accepts an array of entity refs', () => {
    expect(
      parseAppliesToBackstageEntityRefs(
        'appliesToBackstageEntityRefs:\n  - component:default/kv-ros-test-2\n  - system:default/kv-ros-test-system\n',
        'https://example.org/risc.risc.yaml',
        logger,
      ),
    ).toEqual([
      'component:default/kv-ros-test-2',
      'system:default/kv-ros-test-system',
    ]);
  });

  it('returns undefined when appliesToBackstageEntityRefs is missing', () => {
    expect(
      parseAppliesToBackstageEntityRefs(
        'title: test\nversion: 1\n',
        'https://example.org/risc.risc.yaml',
        logger,
      ),
    ).toBeUndefined();
  });

  it('returns an empty array and warns when appliesToBackstageEntityRefs has an invalid type', () => {
    expect(
      parseAppliesToBackstageEntityRefs(
        'appliesToBackstageEntityRefs:\n  invalid: true\n',
        'https://example.org/risc.risc.yaml',
        logger,
      ),
    ).toEqual([]);
    expect(logger.warn).toHaveBeenCalledWith(
      'RiSc file has invalid appliesToBackstageEntityRefs',
      expect.objectContaining({
        sourceUrl: 'https://example.org/risc.risc.yaml',
      }),
    );
  });
});

function createLogger(): LoggerService {
  return {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    child: jest.fn(),
  } as unknown as LoggerService;
}
