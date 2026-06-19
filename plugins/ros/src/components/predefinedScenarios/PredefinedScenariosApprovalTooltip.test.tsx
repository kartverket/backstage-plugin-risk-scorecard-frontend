import { render, screen } from '@testing-library/react';
import { RiScStatus, RiScWithMetadata } from '../../utils/types';
import { PredefinedScenariosApprovalTooltip } from './PredefinedScenariosApprovalTooltip';

jest.mock('@backstage/core-plugin-api/alpha', () => ({
  ...jest.requireActual('@backstage/core-plugin-api/alpha'),
  useTranslationRef: () => ({ t: (key: string) => key }),
}));
jest.mock('../../utils/featureFlags', () => ({
  usePredefinedScenariosFeatureFlag: () => false,
}));
jest.mock('../../hooks/usePredefinedScenarios', () => ({
  usePredefinedScenarios: () => ({ data: undefined }),
}));

function renderApprovalButton(status: RiScStatus) {
  const selectedRiSc = { id: 'risc-1', status } as RiScWithMetadata;

  render(
    <PredefinedScenariosApprovalTooltip
      selectedRiSc={selectedRiSc}
      isDismissed={false}
    >
      {isDisabled => <button disabled={isDisabled}>Approve</button>}
    </PredefinedScenariosApprovalTooltip>,
  );

  return screen.getByRole('button', { name: 'Approve' }) as HTMLButtonElement;
}

describe('PredefinedScenariosApprovalTooltip', () => {
  it('allows deletion approval while predefined scenarios are unavailable', () => {
    expect(renderApprovalButton(RiScStatus.DeletionDraft).disabled).toBe(false);
  });

  it('blocks ordinary approval while predefined scenarios are unavailable', () => {
    expect(renderApprovalButton(RiScStatus.Draft).disabled).toBe(true);
  });
});
