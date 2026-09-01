// TODO Phase 5 — Collection service + assignment engine
export const collectionService = {
  async createCollection(_data: unknown) {
    throw new Error('Not implemented — Phase 5');
  },
  async assignAgent(_collectionId: string) {
    // Phase 5 — Assignment engine:
    // 1. Resolve zone from address
    // 2. Find primary agent
    // 3. Check availability & capacity
    // 4. Fall back to backup agent
    // 5. Fall back to operations queue
    throw new Error('Not implemented — Phase 5');
  },
  async updateStatus(_collectionId: string, _status: string, _actorId?: string) {
    throw new Error('Not implemented — Phase 5');
  },
};
