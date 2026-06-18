import { act, renderHook } from '@testing-library/react';
import { usePredefinedScenariosBannerDismissal } from './PredefinedScenariosBannerStore';

describe('usePredefinedScenariosBannerDismissal', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('stores dismissal for the selected RiSc', () => {
    const { result } = renderHook(() =>
      usePredefinedScenariosBannerDismissal('risc-1'),
    );

    expect(result.current.isDismissed).toBe(false);

    act(() => result.current.dismiss());

    expect(result.current.isDismissed).toBe(true);
    expect(localStorage.getItem('predefinedScenariosBannerDismissed')).toBe(
      '["risc-1"]',
    );
  });

  it('keeps dismissal state separate between RiScs', () => {
    const { result, rerender } = renderHook(
      ({ riScId }) => usePredefinedScenariosBannerDismissal(riScId),
      { initialProps: { riScId: 'risc-1' } },
    );

    act(() => result.current.dismiss());

    expect(result.current.isDismissed).toBe(true);

    rerender({ riScId: 'risc-2' });

    expect(result.current.isDismissed).toBe(false);
  });
});
