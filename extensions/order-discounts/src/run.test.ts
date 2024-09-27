import { describe, it, expect, afterEach } from 'vitest';
import { run, EMPTY_DISCOUNT, DiscountValue } from './index';
import { DiscountApplicationStrategy } from '../generated/api';

const fixedAmountConfiguration: DiscountValue = {
  type: "fixedAmount",
  full: 5,
  half: 2.5
};

const percentageConfiguration: DiscountValue =  {
  ...fixedAmountConfiguration,
  type: "percentage"
};

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
        configuration: { value: JSON.stringify(fixedAmountConfiguration) }
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
        configuration: { value: JSON.stringify(fixedAmountConfiguration) }
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
        configuration: { value: JSON.stringify(percentageConfiguration) }
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
        configuration: { value: JSON.stringify(percentageConfiguration) }
      }
    });

    expect(discounts.length).toBe(1);
    expect(discounts[0].value.percentage?.value).toBe(2.5);
  });
});