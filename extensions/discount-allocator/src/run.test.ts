import {describe, it, expect} from 'vitest';
import {run} from './run';
import fs from "fs";
import { RunInput } from '../generated/api';

describe('discounts allocator function', () => {
  it('input.json', () => {
    const input = JSON.parse(fs.readFileSync('input.json').toString()) as RunInput;
    const result = run(input);
    expect(result.lineDiscounts?.pop()?.allocations.pop()?.amount ?? 0).toBe(2.5)
  })
});