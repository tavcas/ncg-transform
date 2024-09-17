import { describe, it, expect, afterEach } from 'vitest';
import { run, EMPTY_DISCOUNT } from './index';
import { DiscountApplicationStrategy } from '../generated/api';

let result = EMPTY_DISCOUNT;
describe('order discounts by payment plan', () => {
  afterEach(() => {
    expect(result.discountApplicationStrategy).toBe(DiscountApplicationStrategy.First);
  })
  it('Returns empty if payment plan is Monthly', () => {
    const result  = run({
      cart: {
        plan: { value: "Monthly"}
      },
      discount: {}
    });
    expect(result).toBe(EMPTY_DISCOUNT);
  });
  it("Returns empty if no payment plan", () => {
    const result  = run({
      cart: {
        plan: { value: ""}
      },
      discount: {}
    });
    expect(result).toBe(EMPTY_DISCOUNT);
  });
  it('should half fixed amount if payment plan is Bi-Monthly', () => {
    const { discounts }  = run({
      cart: {
        plan: { value: "Bi-Monthly"}
      },
      discount: {
        halfAmount: { value: "2.5"}
      }
    });

    expect(discounts.length).toBe(1);
    expect(discounts[0].value.fixedAmount?.amount).toBe(2.5);
  });
  it("should half fixed if payment plan is Every Two Weeks", () => {
    
    const { discounts }  = run({
      cart: {
        plan: { value: "Every Two Weeks"}
      },
      discount: {
        halfAmount: { value: "2.5"}
      }
    });

    expect(discounts.length).toBe(1);
    expect(discounts[0].value.fixedAmount?.amount).toBe(2.5);
  });

  it('should half percentage if payment plan is Bi-Monthly', () => {
    const { discounts }  = run({
      cart: {
        plan: { value: "Bi-Monthly"}
      },
      discount: {
        halfPercentage: { value: "2.5"}
      }
    });

    expect(discounts.length).toBe(1);
    expect(discounts[0].value.percentage?.value).toBe(2.5);
  });
  it("should percentage if payment plan is Every Two Weeks", () => {
    
    const { discounts }  = run({
      cart: {
        plan: { value: "Every Two Weeks"}
      },
      discount: {
        halfPercentage: { value: "2.5"}
      }
    });

    expect(discounts.length).toBe(1);
    expect(discounts[0].value.percentage?.value).toBe(2.5);
  });
});