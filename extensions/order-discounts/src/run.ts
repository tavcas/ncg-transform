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

export type DiscountValue = {
  type: "fixedAmount" | "percentage";
  half: number;
  full: number;
}

function strToPaymentPlan(convertingStr: string): PaymentPlan {
  if (Object.values(PaymentPlan).includes(convertingStr as PaymentPlan)) {
      return (convertingStr as PaymentPlan);
  } else {
      throw new Error(` '${convertingStr}' is not a valid Payment Plan. valid options ${Object.values(PaymentPlan).join(", ")}`);
  }
}

function customDiscountValues(discount: RunInput["discount"], plan: PaymentPlan): FunctionRunResult["discounts"][0]["value"] | undefined {
  try {
    const { full, half, type } = JSON.parse(discount.configuration?.value ?? "") as DiscountValue
    var value = [PaymentPlan.Monthly, PaymentPlan.None].includes(plan) ? full: half
    return type === "fixedAmount"
    ? { fixedAmount: {amount: value}}
    : { percentage: { value } };
  } catch(error) {
    console.log(JSON.stringify(error));
  }
}

export function run(input: RunInput): FunctionRunResult {
  try {
    console.log(JSON.stringify(input));
    const plan = strToPaymentPlan(input.cart.plan?.value ?? "");
    const value = customDiscountValues(input.discount, plan);
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