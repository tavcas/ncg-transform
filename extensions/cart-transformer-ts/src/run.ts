import type {
  RunInput,
  FunctionRunResult,
  UpdateOperationPriceAdjustment,
} from "../generated/api";

export enum PaymentPlan {
  Cash = "",
  Monthly = "Monthly",
  BiMonthly = "Bi-Monthly",
  EveryTwoWeeks = "Every Two Weeks",
}

const monthly_price = 0.888888;

const bi_weekly_price = 0.944444;

const EMPTY_RESULT: FunctionRunResult = {
  operations: [],
};

function percentageFromPaymentPlan(paymentPlan: string): number {
  switch (paymentPlan) {
    case PaymentPlan.Monthly:
      return monthly_price;
    case PaymentPlan.BiMonthly:
    case PaymentPlan.EveryTwoWeeks:
      return bi_weekly_price;
    case PaymentPlan.Cash:
    default:
      return 0;
  }
}

function calculatePriceUpdate(
  amount: number,
  quantity: number,
  paymentPlan: string
): UpdateOperationPriceAdjustment | null {
  const percentage = percentageFromPaymentPlan(paymentPlan);
  if (percentage > 0 && quantity > 0) {
    return {
      adjustment: {
        fixedPricePerUnit: {
          amount: Math.round(
            amount / quantity - (amount / quantity) * percentage
          ),
        },
      },
    };
  }
  return null;
}

export function run(input: RunInput): FunctionRunResult {
  const result = EMPTY_RESULT;
  const { plan, lines } = input.cart;

  for (const l of lines) {
    const paymentPlan = l.plan?.value
      ? l.plan.value
      : plan?.value
      ? plan.value
      : "";
    const price = calculatePriceUpdate(
      l.cost.subtotalAmount.amount,
      l.quantity,
      paymentPlan
    );
    if (price) {
      result.operations.push({
        update: {
          cartLineId: l.id,
          price,
        },
      });
    }
  }
  return result;
}
