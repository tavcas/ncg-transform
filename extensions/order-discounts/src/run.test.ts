import { describe, it, expect, afterEach, } from 'vitest';
import { run, EMPTY_DISCOUNT, DiscountValue, DiscountRequirements, RequirementType, PaymentPlan } from './index';
import { DiscountApplicationStrategy, RunInput } from '../generated/api';

const fixedAmountConfiguration: DiscountValue = {
  discountType: "fixedAmount",
  "": 5,
  "Monthly": 5,
  "Bi-Monthly": 2.5,
  "Every Two Weeks": 2.5
};

const percentageConfiguration: DiscountValue =  {
  ...fixedAmountConfiguration,
  discountType: "percentage"
};

const requirementQuantity: DiscountRequirements = {
   requirementQuantity: "1",
   requirementType: RequirementType.Quantity
}

const requirementSubTotal: DiscountRequirements = {
  requirementSubtotal: "10",
  requirementType: RequirementType.Subtotal
}

const requirementNone: DiscountRequirements = {
  requirementType: RequirementType.None
}

function cartWithPaymentPlan(paymentPlan: string, subtotal = 10, quantity = 1): RunInput["cart"] {
  return {
    plan: { value: paymentPlan ?? "" },
    cost: { subtotal: { amount: subtotal }},
    lines: [{ quantity }]
  }
}

let result = EMPTY_DISCOUNT;
describe('order discounts by payment plan', () => {
  afterEach(() => {
    expect(result.discountApplicationStrategy).toBe(DiscountApplicationStrategy.First);
  })
  
  describe('applies to all payment plans', () => {
    for(const p in PaymentPlan) {
      describe(p, () => {
        it('Should apply fixedAmount', () => {
          const result = run({
            cart: cartWithPaymentPlan(PaymentPlan[p]),
            discount: {
              configuration: { value: JSON.stringify(fixedAmountConfiguration)}
            }
          });
  
          expect(result.discounts.length).toBe(1);
          expect(result.discounts[0].value === fixedAmountConfiguration[PaymentPlan[p]]);
        });
  
        it('Should apply percentage', () => {
          const result = run({
            cart: cartWithPaymentPlan(PaymentPlan[p]),
            discount: {
              configuration: { value: JSON.stringify(percentageConfiguration)}
            }
          });
  
          expect(result.discounts.length).toBe(1);
          expect(result.discounts[0].value === percentageConfiguration[PaymentPlan[p]]);
        })

        describe('Requirements', () => {
          it('None', () => {
            const result = run({
              cart: cartWithPaymentPlan(PaymentPlan[p]),
              discount: {
                configuration: { value: JSON.stringify(percentageConfiguration)},
                requirements: { value: JSON.stringify(requirementNone)}
              }
            });
    
            expect(result.discounts.length).toBe(1);
          }); 

          it('Subtotal', () => {
            const result = run({
              cart: cartWithPaymentPlan(PaymentPlan[p], 5),
              discount: {
                configuration: { value: JSON.stringify(percentageConfiguration)},
                requirements: { value: JSON.stringify(requirementSubTotal)}
              }
            });
    
            expect(result.discounts.length).toBe(0);
          })

          it('Quantity', () => {
            const result = run({
              cart: cartWithPaymentPlan(PaymentPlan[p], 10, 0),
              discount: {
                configuration: { value: JSON.stringify(percentageConfiguration)},
                requirements: { value: JSON.stringify(requirementQuantity)}
              }
            });
    
            expect(result.discounts.length).toBe(0);
          })
          
        });
      })
    }
  })
});