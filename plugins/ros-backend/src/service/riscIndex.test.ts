/**
 * @jest-environment node
 */

import type { LoggerService } from '@backstage/backend-plugin-api';
import { parseCoversComponentRefs } from './riscIndex';

describe('parseCoversComponentRefs', () => {
  const logger = createLogger();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('accepts a single string component ref', () => {
    expect(
      parseCoversComponentRefs(
        'coversComponentRefs: component:default/kv-ros-test-2\n',
        'https://example.org/risc.risc.yaml',
        logger,
      ),
    ).toEqual(['component:default/kv-ros-test-2']);
  });

  it('accepts an array of component refs', () => {
    expect(
      parseCoversComponentRefs(
        'coversComponentRefs:\n  - component:default/kv-ros-test-2\n  - component:default/kv-ros-test-3\n',
        'https://example.org/risc.risc.yaml',
        logger,
      ),
    ).toEqual([
      'component:default/kv-ros-test-2',
      'component:default/kv-ros-test-3',
    ]);
  });

  it('returns undefined when coversComponentRefs is missing', () => {
    expect(
      parseCoversComponentRefs(
        'title: test\nversion: 1\n',
        'https://example.org/risc.risc.yaml',
        logger,
      ),
    ).toBeUndefined();
  });

  it('returns an empty array and warns when coversComponentRefs has an invalid type', () => {
    expect(
      parseCoversComponentRefs(
        'coversComponentRefs:\n  invalid: true\n',
        'https://example.org/risc.risc.yaml',
        logger,
      ),
    ).toEqual([]);
    expect(logger.warn).toHaveBeenCalledWith(
      'RiSc file has invalid coversComponentRefs',
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
