/**
 * Unit tests for the onboarding Zustand store
 */

import { useOnboardingStore } from '@/lib/state/onboarding-store';
import { act, renderHook } from '@testing-library/react';

describe('useOnboardingStore', () => {
  beforeEach(() => {
    // Clear the store before each test
    const { result } = renderHook(() => useOnboardingStore());
    act(() => {
      result.current.clearPendingPRs();
    });
  });

  it('should initialize with empty pendingPRs', () => {
    const { result } = renderHook(() => useOnboardingStore());
    expect(result.current.pendingPRs).toEqual({});
  });

  it('should set pending PR values', () => {
    const { result } = renderHook(() => useOnboardingStore());
    
    act(() => {
      result.current.setPendingPR('bench', 225);
      result.current.setPendingPR('squat', 315);
      result.current.setPendingPR('deadlift', 405);
    });

    expect(result.current.pendingPRs).toEqual({
      bench: 225,
      squat: 315,
      deadlift: 405
    });
  });

  it('should update existing PR values', () => {
    const { result } = renderHook(() => useOnboardingStore());
    
    act(() => {
      result.current.setPendingPR('bench', 225);
    });

    expect(result.current.pendingPRs.bench).toBe(225);

    act(() => {
      result.current.setPendingPR('bench', 245);
    });

    expect(result.current.pendingPRs.bench).toBe(245);
  });

  it('should clear all pending PRs', () => {
    const { result } = renderHook(() => useOnboardingStore());
    
    act(() => {
      result.current.setPendingPR('bench', 225);
      result.current.setPendingPR('squat', 315);
    });

    expect(Object.keys(result.current.pendingPRs)).toHaveLength(2);

    act(() => {
      result.current.clearPendingPRs();
    });

    expect(result.current.pendingPRs).toEqual({});
  });

  it('should return pending PRs via getPendingPRs', () => {
    const { result } = renderHook(() => useOnboardingStore());
    
    act(() => {
      result.current.setPendingPR('deadlift', 405);
    });

    const pendingPRs = result.current.getPendingPRs();
    expect(pendingPRs).toEqual({ deadlift: 405 });
  });
});
