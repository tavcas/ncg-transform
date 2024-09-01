import {describe, it, expect} from 'vitest';
import {run} from './run';
import { DiscountApplicationStrategy, DiscountClass, FixedAmount, RunInput } from '../generated/api';
import { DiscountInput, first, ShopifyEntity, shopifyGid } from './utils';
import { LineDiscount } from '../generated/api';

const value = { amount: 5} as FixedAmount;
const orderFirstDiscount: DiscountInput = {
  id: shopifyGid(ShopifyEntity.Discount, "order-first"),
  code: "TEST1",
  discountClass: DiscountClass.Order,
  discountApplicationStrategy: DiscountApplicationStrategy.First,
  discountProposals: [
    {
      handle: "order-first-proposal",
      value,
      targets: [
        {
          cartLineId: shopifyGid(ShopifyEntity.CartLine, "order-first-line"),
          quantity: 1
        }
      ]
    }
  ]

}

const orderFirstBiMonthly: RunInput = {
  cart: {
    plan: { value: "Bi-Monthly"},
    lines: []
  },
  discounts:[
   orderFirstDiscount
  ]
}

describe('discounts allocator function', () => {
  it('should halve fixed discount for order when cart plan is Bi-Monthly and discountClass is ORDER and discountStrategy is FIRST', () => {
    const { lineDiscounts, displayableErrors } = run(orderFirstBiMonthly);
    const { amount } = first(first(lineDiscounts).allocations);
    expect(displayableErrors?.length).toBe(0);
    expect(amount).toBe(2.5);
  })
});