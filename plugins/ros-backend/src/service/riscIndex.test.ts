/**
 * @jest-environment node
 */

import type { LoggerService } from '@backstage/backend-plugin-api';
import { getLastSavedAtFromGitHubCommits, parseAppliesTo } from './riscIndex';

describe('parseAppliesTo', () => {
  const logger = createLogger();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns decoded Backstage entity refs from appliesTo entries', () => {
    expect(
      parseAppliesTo(
        'appliesTo:\n  - backstage:component:default/kv-ros-test-2\n  - service:example-ticket-1\n',
        'https://example.org/risc.risc.yaml',
        logger,
      ),
    ).toEqual(['component:default/kv-ros-test-2']);
  });

  it('returns undefined when appliesTo is missing', () => {
    expect(
      parseAppliesTo(
        'title: test\nversion: 1\n',
        'https://example.org/risc.risc.yaml',
        logger,
      ),
    ).toBeUndefined();
  });

  it('returns an empty array and warns when appliesTo has an invalid type', () => {
    expect(
      parseAppliesTo(
        'appliesTo:\n  invalid: true\n',
        'https://example.org/risc.risc.yaml',
        logger,
      ),
    ).toEqual([]);
    expect(logger.warn).toHaveBeenCalledWith(
      'RiSc file has invalid appliesTo',
      expect.objectContaining({
        sourceUrl: 'https://example.org/risc.risc.yaml',
      }),
    );
  });
});

describe('getLastSavedAtFromGitHubCommits', () => {
  it('uses the latest commit committer date', () => {
    expect(
      getLastSavedAtFromGitHubCommits([
        {
          commit: {
            committer: { date: '2026-05-01T08:30:00Z' },
          },
        },
      ]),
    ).toBe('2026-05-01T08:30:00Z');
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
