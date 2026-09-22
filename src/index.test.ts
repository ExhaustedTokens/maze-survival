import { describe, expect, it } from 'vitest';

import { describeWorld, WORLD_NAME } from './index.js';

describe('describeWorld', () => {
  it('include il nome del mondo', () => {
    expect(describeWorld()).toContain(WORLD_NAME);
  });
});
