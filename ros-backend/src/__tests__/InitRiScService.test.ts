import { InitialRiScService } from '../services/risc/initial/InitialRiScService.ts';
import { GithubStatus } from '../services/risc/storage/GitHubAdapter.ts';
import type {
  GitHubAdapter,
  GithubContentResponse,
} from '../services/risc/storage/GitHubAdapter.ts';

// ─── Test Data ────────────────────────────────────────────────────────────────

const TEMPLATE_DATA_1 = JSON.stringify({
  schemaVersion: '5.2',
  title: 'Initiell RoS - web-app',
  scope: 'Denne RoSen er generert fra opplysninger...',
  scenarios: [
    {
      title: 'Produktet mangler avtaler',
      scenario: {
        ID: 'QQrIA',
        description: 'Scenario description',
        threatActors: ['Reckless employee'],
        vulnerabilities: ['Misconfiguration'],
        risk: { consequence: 1000000, probability: 1 },
        remainingRisk: { consequence: 0, probability: 0 },
        actions: [
          {
            title: 'Inngå sikkerhetsavtale',
            action: {
              ID: 'cvqIP',
              description: 'Action description',
              status: 'Not OK',
              url: '',
            },
          },
        ],
      },
    },
    {
      title: 'Annet scenario',
      scenario: {
        ID: 'QQrIA2',
        description: 'Beskrivelse',
        threatActors: ['Reckless employee'],
        vulnerabilities: ['Misconfiguration'],
        risk: { consequence: 0, probability: 0 },
        remainingRisk: { consequence: 0, probability: 0 },
        actions: [
          {
            title: 'Action 1',
            action: {
              ID: 'cvqIP2',
              description: 'desc',
              status: 'OK',
              url: '',
              lastUpdated: '2026-02-13T14:43:50.92Z',
              lastUpdatedBy: 'Kari Nordmann',
            },
          },
          {
            title: 'Action 2',
            action: {
              ID: 'cvqIP3',
              description: 'desc',
              status: 'Not relevant',
              url: '',
              lastUpdated: '2026-02-13T14:43:50.92Z',
              lastUpdatedBy: 'Ola',
            },
          },
        ],
      },
    },
  ],
});

const DESCRIPTOR_CONFIG = JSON.stringify([
  {
    id: 'risc-example',
    priorityIndex: 1,
    listName: 'RiSc Example',
    listDescription: 'Description',
    preferredBackstageComponentType: 'service',
  },
  {
    id: 'risc-example-x2',
    priorityIndex: 2,
    listName: 'RiSc Example 2',
    listDescription: 'Description 2',
    preferredBackstageComponentType: null,
  },
]);

const TEMPLATE_DATA_2 = JSON.stringify({
  schemaVersion: '5.2',
  title: 'Template 2',
  scope: 'Scope 2',
  scenarios: [
    {
      title: 'Scenario',
      scenario: {
        ID: 'abc',
        description: 'desc',
        threatActors: [],
        vulnerabilities: [],
        risk: { consequence: 0, probability: 0 },
        actions: [],
      },
    },
  ],
});

// ─── Mock GitHub Service ──────────────────────────────────────────────────────

function createMockGitHubService(
  responses: Record<string, GithubContentResponse>,
): GitHubAdapter {
  return {
    fetchFileContent: jest.fn(
      async (
        _owner: string,
        _repo: string,
        path: string,
      ): Promise<GithubContentResponse> => {
        return responses[path] ?? { data: null, status: GithubStatus.NotFound };
      },
    ),
  } as unknown as GitHubAdapter;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('InitialRiScService', () => {
  let service: InitialRiScService;
  let mockGithub: GitHubAdapter;

  beforeEach(() => {
    mockGithub = createMockGitHubService({
      'init-risc-def.json': {
        data: DESCRIPTOR_CONFIG,
        status: GithubStatus.Success,
      },
      'initial-riscs/risc-example.json': {
        data: TEMPLATE_DATA_1,
        status: GithubStatus.Success,
      },
      'initial-riscs/risc-example-x2.json': {
        data: TEMPLATE_DATA_2,
        status: GithubStatus.Success,
      },
    });

    service = new InitialRiScService({
      githubService: mockGithub,
      config: { repoOwner: 'kartverket', repoName: 'ros-templates' },
    });
  });

  describe('getInitRiScDescriptors', () => {
    it('returns descriptors with resolved metadata sorted by priority', async () => {
      const descriptors = await service.getInitRiScDescriptors('gh-token');

      expect(descriptors).toHaveLength(2);

      const first = descriptors[0];
      expect(first.id).toBe('risc-example');
      expect(first.listName).toBe('RiSc Example');
      expect(first.listDescription).toBe('Description');
      expect(first.defaultTitle).toBe('Initiell RoS - web-app');
      expect(first.defaultScope).toBe(
        'Denne RoSen er generert fra opplysninger...',
      );
      expect(first.numberOfScenarios).toBe(2);
      expect(first.numberOfActions).toBe(3);
      expect(first.preferredBackstageComponentType).toBe('service');
      expect(first.priorityIndex).toBe(1);

      const second = descriptors[1];
      expect(second.id).toBe('risc-example-x2');
      expect(second.numberOfScenarios).toBe(1);
      expect(second.numberOfActions).toBe(0);
    });

    it('throws when descriptor config fetch fails', async () => {
      mockGithub = createMockGitHubService({});
      service = new InitialRiScService({
        githubService: mockGithub,
        config: { repoOwner: 'owner', repoName: 'repo' },
      });

      await expect(service.getInitRiScDescriptors('token')).rejects.toThrow(
        'Failed to fetch InitRiSc descriptor configs',
      );
    });
  });

  describe('getInitRiSc', () => {
    it('returns cleaned template with overridden title and scope', async () => {
      const initialContent = JSON.stringify({
        schemaVersion: '5.2',
        title: 'My Custom Title',
        scope: 'My Custom Scope',
        scenarios: [],
      });

      const result = await service.getInitRiSc(
        'risc-example',
        initialContent,
        'gh-token',
      );
      const parsed = JSON.parse(result);

      expect(parsed.title).toBe('My Custom Title');
      expect(parsed.scope).toBe('My Custom Scope');
      expect(parsed.scenarios).toHaveLength(2);
      expect(parsed.scenarios[0].scenario.actions[0].action.ID).toBe('cvqIP');
    });

    it('sets all action statuses to "Not OK" and strips timestamps', async () => {
      const initialContent = JSON.stringify({
        title: 'Title',
        scope: 'Scope',
      });

      const result = await service.getInitRiSc(
        'risc-example',
        initialContent,
        'gh-token',
      );
      const parsed = JSON.parse(result);

      // Check all actions across all scenarios
      for (const scenario of parsed.scenarios) {
        for (const action of scenario.scenario.actions) {
          expect(action.action.status).toBe('Not OK');
          expect(action.action.lastUpdated).toBeUndefined();
          expect(action.action.lastUpdatedBy).toBeUndefined();
        }
      }
    });

    it('throws when template fetch fails', async () => {
      const initialContent = JSON.stringify({
        title: 'T',
        scope: 'S',
      });

      await expect(
        service.getInitRiSc('nonexistent', initialContent, 'token'),
      ).rejects.toThrow("Failed to fetch InitRiSc template 'nonexistent'");
    });
  });
});
