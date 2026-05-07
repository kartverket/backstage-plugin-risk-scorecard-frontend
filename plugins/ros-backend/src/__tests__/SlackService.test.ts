import { SlackService } from '../services/SlackService';

// ─── Mock Logger ──────────────────────────────────────────────────────────────

const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  child: jest.fn().mockReturnThis(),
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('SlackService', () => {
  let service: SlackService;
  let mockFetch: jest.Mock;
  const webhookUrl = 'https://hooks.slack.com/services/T00/B00/xxx';

  beforeEach(() => {
    mockFetch = jest.fn();
    service = new SlackService({
      webhookUrl,
      logger: mockLogger as any,
      fetchFn: mockFetch,
    });
  });

  it('sends a POST request with JSON body to the webhook URL', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
    } as Response);

    await service.sendFeedback('Hello from RiSc!');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Hello from RiSc!' }),
    });
  });

  it('throws when webhook returns non-ok status', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    await expect(service.sendFeedback('test')).rejects.toThrow(
      'Failed to send feedback to Slack',
    );
  });

  it('throws and logs when fetch rejects', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network failure'));

    await expect(service.sendFeedback('test')).rejects.toThrow(
      'Failed to send feedback to Slack: Network failure',
    );
    expect(mockLogger.error).toHaveBeenCalled();
  });
});
