import { LoggerService } from '@backstage/backend-plugin-api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SlackServiceOptions {
  webhookUrl: string;
  logger: LoggerService;
  fetchFn?: typeof fetch;
}

// ─── Service ──────────────────────────────────────────────────────────────────

/**
 * Service for sending messages to Slack via a configured webhook URL.
 */
export class SlackAdapter {
  private readonly webhookUrl: string;
  private readonly logger: LoggerService;
  private readonly fetchFn: typeof fetch;

  constructor(options: SlackServiceOptions) {
    this.webhookUrl = options.webhookUrl;
    this.logger = options.logger;
    this.fetchFn = options.fetchFn ?? globalThis.fetch;
  }

  /**
   * Sends a feedback message to the configured Slack webhook.
   * The message is posted as a JSON body with a `text` field.
   */
  async sendFeedback(message: string): Promise<void> {
    try {
      const response = await this.fetchFn(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message }),
      });

      if (!response.ok) {
        throw new Error(`Slack webhook returned status ${response.status}`);
      }
    } catch (e) {
      this.logger.error('Failed to send feedback to Slack');
      throw new Error(
        `Failed to send feedback to Slack: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }
}
