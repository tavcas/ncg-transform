import { describe, it, expect } from 'vitest';
import { run } from './run';
import { FunctionRunResult, RunInput } from '../generated/api';

describe('cart transform function', () => {
  it('returns no operations', () => {
    const result = run({
      cart: {
        lines: []
      }
    });
    const expected: FunctionRunResult = { operations: [] };

    expect(result).toEqual(expected);
  });
  it('always use cart plan if exists', () => {
    const result = run({
      "cart": {
        "plan": {
          "value": "Bi-Monthly"
        },
        "lines": [
          {
            "id": "gid://shopify/CartLine/1ad0c242-d9da-4f05-937e-8409fe919c08",
            "quantity": 1,
            "cost": {
              "subtotalAmount": {
                "amount": "2070.0"
              }
            },
            "plan": {
              "value": "Monthly"
            }
          }
        ]
      }
    });
    expect(result.operations.length).toBe(1);
    expect(result.operations[0].update?.price?.adjustment.fixedPricePerUnit.amount).toBe(115);
  });

  it('use line plan if doesnt exists on cart', () => {
    const result = run({
      "cart": {
        "lines": [
          {
            "id": "gid://shopify/CartLine/1ad0c242-d9da-4f05-937e-8409fe919c08",
            "quantity": 1,
            "cost": {
              "subtotalAmount": {
                "amount": "2070.0"
              }
            },
            "plan": {
              "value": "Monthly"
            }
          }
        ]
      }
    });
    expect(result.operations[1].update?.price?.adjustment.fixedPricePerUnit.amount).toBe(230);
  });
});