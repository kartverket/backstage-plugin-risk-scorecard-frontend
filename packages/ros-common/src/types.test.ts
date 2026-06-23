import {
  isGcpCryptoKeyErrorStatus,
  isNonErrorProcessingStatus,
  isProcessingStatus,
  ProcessingStatus,
} from './types';

describe('processing status guards', () => {
  it('recognizes processing statuses and their severity', () => {
    expect(isProcessingStatus(ProcessingStatus.CreatedRiSc)).toBe(true);
    expect(isNonErrorProcessingStatus(ProcessingStatus.CreatedRiSc)).toBe(true);
    expect(
      isNonErrorProcessingStatus(ProcessingStatus.InvalidGcpAccessToken),
    ).toBe(false);
    expect(isProcessingStatus('FutureProcessingStatus')).toBe(false);
  });

  it('recognizes only errors returned by the GCP crypto-key endpoint', () => {
    expect(
      isGcpCryptoKeyErrorStatus(
        ProcessingStatus.FailedToFetchGCPOAuth2TokenInformation,
      ),
    ).toBe(true);
    expect(
      isGcpCryptoKeyErrorStatus(ProcessingStatus.InvalidGitHubAccessToken),
    ).toBe(false);
    expect(isGcpCryptoKeyErrorStatus('FutureProcessingStatus')).toBe(false);
  });
});
