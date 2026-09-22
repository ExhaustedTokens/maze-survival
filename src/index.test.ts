import { describe, expect, it } from 'vitest';

import { describeWorld, WORLD_NAME } from './index.js';

describe('describeWorld', () => {
  it('includes the world name', () => {
    expect(describeWorld()).toContain(WORLD_NAME);
  });
});
