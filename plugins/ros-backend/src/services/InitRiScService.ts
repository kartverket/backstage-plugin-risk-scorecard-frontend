import type { GitHubService, GithubContentResponse } from './GitHubService';
import { GithubStatus } from './GitHubService';
import { InitRiScConfigFetchError, InitRiScFetchError } from '../lib/errors';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Configuration for the InitRiSc template repository. */
export interface InitRiScConfig {
  repoOwner: string;
  repoName: string;
}

/** Descriptor config as stored in the template repo's init-risc-def.json. */
export interface InitRiScDescriptorConfig {
  id: string;
  priorityIndex: number;
  listName: string;
  listDescription: string;
  preferredBackstageComponentType?: string | null;
}

/** Full descriptor with resolved metadata from the template RiSc. */
export interface RiScTypeDescriptor {
  id: string;
  listName: string;
  listDescription: string;
  defaultTitle: string;
  defaultScope: string;
  numberOfScenarios: number | null;
  numberOfActions: number | null;
  preferredBackstageComponentType: string | null;
  priorityIndex: number | null;
}

/** Minimal v5.x RiSc shape for template processing. */
interface RiSc5XTemplate {
  schemaVersion: string;
  title: string;
  scope: string;
  unencryptedMetadata?: {
    appliesTo?: string[] | null;
  } | null;
  scenarios: Array<{
    title: string;
    scenario: {
      ID: string;
      description: string;
      threatActors: string[];
      vulnerabilities: string[];
      risk: Record<string, unknown>;
      remainingRisk?: Record<string, unknown>;
      actions: Array<{
        title: string;
        action: {
          ID: string;
          description: string;
          status: string;
          url: string;
          lastUpdated?: string | null;
          lastUpdatedBy?: string | null;
          comment?: string | null;
        };
      }>;
    };
  }>;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export interface InitRiScServiceOptions {
  githubService: GitHubService;
  config: InitRiScConfig;
}

/**
 * Service for fetching initial RiSc templates from a configured GitHub repository.
 * Provides template descriptors (list of available templates) and cleaned template content.
 */
export class InitRiScService {
  private readonly github: GitHubService;
  private readonly config: InitRiScConfig;
  constructor(options: InitRiScServiceOptions) {
    this.github = options.githubService;
    this.config = options.config;
  }

  /** The template repository this service reads from. */
  get templateRepo(): InitRiScConfig {
    return this.config;
  }

  /**
   * Fetches the list of available InitRiSc descriptors from the template repo.
   * For each descriptor config, resolves its template to extract metadata.
   */
  async getInitRiScDescriptors(
    githubToken: string,
  ): Promise<RiScTypeDescriptor[]> {
    const configs = await this.fetchDescriptorConfigs(githubToken);

    const descriptors = await Promise.all(
      configs.map(async config => {
        const risc = await this.fetchRiScTemplate(config.id, githubToken);
        const numberOfScenarios = risc.scenarios.length;
        const numberOfActions = risc.scenarios.reduce(
          (sum, s) => sum + s.scenario.actions.length,
          0,
        );

        return {
          id: config.id,
          listName: config.listName,
          listDescription: config.listDescription,
          defaultTitle: risc.title,
          defaultScope: risc.scope,
          numberOfScenarios,
          numberOfActions,
          preferredBackstageComponentType:
            config.preferredBackstageComponentType ?? null,
          priorityIndex: config.priorityIndex,
        } satisfies RiScTypeDescriptor;
      }),
    );

    return descriptors.sort(
      (a, b) => (a.priorityIndex ?? 0) - (b.priorityIndex ?? 0),
    );
  }

  /**
   * Gets a cleaned InitRiSc template, ready for use.
   * Strips lastUpdated/lastUpdatedBy fields and sets all action statuses to "Not OK".
   * Applies the provided title and scope from initialContent.
   */
  async getInitRiSc(
    initRiScId: string,
    initialContent: string,
    githubToken: string,
  ): Promise<string> {
    const parsedInitial = JSON.parse(initialContent) as {
      title?: string;
      scope?: string;
      unencryptedMetadata?: RiSc5XTemplate['unencryptedMetadata'];
    };

    const template = await this.fetchRiScTemplate(initRiScId, githubToken);
    const cleaned = this.cleanTemplate(template);

    // Override title and scope from initial content
    cleaned.title = parsedInitial.title ?? cleaned.title;
    cleaned.scope = parsedInitial.scope ?? cleaned.scope;
    cleaned.unencryptedMetadata = parsedInitial.unencryptedMetadata;

    return JSON.stringify(cleaned);
  }

  /** Cleans a template: strips timestamps, sets statuses to "Not OK". */
  private cleanTemplate(template: RiSc5XTemplate): RiSc5XTemplate {
    return {
      ...template,
      scenarios: template.scenarios.map(scenario => ({
        ...scenario,
        scenario: {
          ...scenario.scenario,
          actions: scenario.scenario.actions.map(action => ({
            ...action,
            action: {
              ...action.action,
              status: 'Not OK',
              lastUpdated: undefined,
              lastUpdatedBy: undefined,
            },
          })),
        },
      })),
    };
  }

  /** Fetches the descriptor configs list from the template repo. */
  private async fetchDescriptorConfigs(
    githubToken: string,
  ): Promise<InitRiScDescriptorConfig[]> {
    const response: GithubContentResponse = await this.github.fetchFileContent(
      this.config.repoOwner,
      this.config.repoName,
      'init-risc-def.json',
      githubToken,
    );

    if (response.status !== GithubStatus.Success || !response.data) {
      throw new InitRiScConfigFetchError(
        `Failed to fetch InitRiSc descriptor configs from GitHub. Status: ${response.status}`,
      );
    }

    return JSON.parse(response.data) as InitRiScDescriptorConfig[];
  }

  /** Fetches a specific RiSc template from the template repo. */
  async fetchRiScTemplate(
    id: string,
    githubToken: string,
    ref?: string,
  ): Promise<RiSc5XTemplate> {
    const response: GithubContentResponse = await this.github.fetchFileContent(
      this.config.repoOwner,
      this.config.repoName,
      `initial-riscs/${id}.json`,
      githubToken,
      ref,
    );

    if (response.status !== GithubStatus.Success || !response.data) {
      throw new InitRiScFetchError(
        `Failed to fetch InitRiSc template '${id}' from GitHub. Status: ${response.status}`,
      );
    }

    return JSON.parse(response.data) as RiSc5XTemplate;
  }
}
