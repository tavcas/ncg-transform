import type {
  RunInput,
  FunctionRunResult
} from "../generated/api";
import {
  DiscountApplicationStrategy,
} from "../generated/api";

export enum PaymentPlan {
  None = "",
  Monthly = "Monthly",
  BiMonthly = "Bi-Monthly",
  EveryTwoWeeks = "Every Two Weeks"
}

export const EMPTY_DISCOUNT: FunctionRunResult = {
  discountApplicationStrategy: DiscountApplicationStrategy.First,
  discounts: [],
};

function strToPaymentPlan(convertingStr: string): PaymentPlan {
  if (Object.values(PaymentPlan).includes(convertingStr as PaymentPlan)) {
      return (convertingStr as PaymentPlan);
  } else {
      throw new Error(` '${convertingStr}' is not a valid Payment Plan. valid options ${Object.values(PaymentPlan).join(", ")}`);
  }
}

function customDiscountValues(discount: RunInput["discount"]): FunctionRunResult["discounts"][0]["value"] | undefined {
  if(discount.halfAmount?.value) {
    return { fixedAmount : { amount: Number(discount.halfAmount?.value) } };
  }
  else if(discount.halfPercentage?.value) {
    return {percentage: {
      value: Number(discount.halfPercentage?.value)
    }}
  }

}

export function run(input: RunInput): FunctionRunResult {
  try {
    const plan = strToPaymentPlan(input.cart.plan?.value ?? "");
    const value = customDiscountValues(input.discount);
    if(plan in [PaymentPlan.Monthly, PaymentPlan.None]) {
      return EMPTY_DISCOUNT;
    }
    if (!value) {
      return EMPTY_DISCOUNT;
    }

    return {
      discountApplicationStrategy: DiscountApplicationStrategy.First,
      discounts:[
        {
          value,
          targets:[
            {
              orderSubtotal: {
                excludedVariantIds: []
              }
            }
          ]
        }
      ]
    }
  } catch(e) {

  }
  
  return EMPTY_DISCOUNT;
};