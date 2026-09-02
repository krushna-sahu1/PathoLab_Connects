import { describe, expect, it } from 'vitest';
import {
  assignmentCandidateIds,
  isAgentEligibleForAssignment,
  selectFirstEligibleId,
} from '@/lib/logistics/assignment';

describe('assignment engine', () => {
  it('uses primary then backup, skipping duplicates', () => {
    expect(assignmentCandidateIds('a', 'b')).toEqual(['a', 'b']);
    expect(assignmentCandidateIds('a', 'a')).toEqual(['a']);
    expect(assignmentCandidateIds(null, 'b')).toEqual(['b']);
    expect(assignmentCandidateIds(null, null)).toEqual([]);
  });

  it('rejects inactive, leave, offline, unavailable, and over-capacity agents', () => {
    const base = { dailyCapacity: 2, availability: { isAvailable: true, currentLoad: 0 } };
    expect(isAgentEligibleForAssignment({ ...base, status: 'available' })).toBe(true);
    expect(isAgentEligibleForAssignment({ ...base, status: 'busy' })).toBe(true);
    expect(isAgentEligibleForAssignment({ ...base, status: 'inactive' })).toBe(false);
    expect(isAgentEligibleForAssignment({ ...base, status: 'on_leave' })).toBe(false);
    expect(isAgentEligibleForAssignment({ ...base, status: 'offline' })).toBe(false);
    expect(
      isAgentEligibleForAssignment({
        status: 'available',
        dailyCapacity: 2,
        availability: { isAvailable: false, currentLoad: 0 },
      })
    ).toBe(false);
    expect(
      isAgentEligibleForAssignment({
        status: 'available',
        dailyCapacity: 2,
        availability: { isAvailable: true, currentLoad: 2 },
      })
    ).toBe(false);
  });

  it('treats missing availability as empty load', () => {
    expect(
      isAgentEligibleForAssignment({
        status: 'available',
        dailyCapacity: 1,
        availability: null,
      })
    ).toBe(true);
  });

  it('picks the first eligible candidate', () => {
    expect(
      selectFirstEligibleId([
        { id: 'primary', eligible: false },
        { id: 'backup', eligible: true },
      ])
    ).toBe('backup');
    expect(selectFirstEligibleId([{ id: 'primary', eligible: false }])).toBeNull();
  });
});
