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

describe('Discount Allocator By Payment Plan (Fixed amount)', () => {
  describe('Given plan is Monthly', () => {
    it('Then it should keep same discount amount', () => {

    })
  });
  describe('Given plan is Bi-Monthly', () => {
    describe('When applies to order', () => {
      it('then it should apply half discount amount to order', () => {

      })
    });
    describe('When Applies to Product', () => {
      it('then it should apply full amount to lines with Monthly plan', () => {

      });
      it('and it should apply half amount to lines with Bi-Monthly plan')
    });
  });
  describe('Every Two Weeks', () => {
    describe('When applies to order', () => {
      it('then it should apply half discount amount to order', () => {

      })
    });
    describe('When Applies to Product', () => {
      it('then it should apply full amount to lines with Monthly plan', () => {

      });
      it('and it should apply half amount to lines with Every Two Weeks plan', () => {

      });
    });
  })
  it('Discount ', () => {
    const { lineDiscounts, displayableErrors } = run(orderFirstBiMonthly);
    const { amount } = first(first(lineDiscounts).allocations);
    expect(displayableErrors?.length).toBe(0);
    expect(amount).toBe(2.5);
  });

  it('should halve fixed discount for order when cart plan')
});