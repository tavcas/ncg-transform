import { FixedAmount, FunctionRunResult, InputMaybe, RunInput, Value } from "../generated/api";

export enum ShopifyEntity {
    Discount = "Discount", CartLine = "CartLine", DiscountProposal = "DiscountProposal"
}
export type GID = {
    handle: string;
    entity: ShopifyEntity;
}

export type ArrayElement<ArrayType extends readonly unknown[] | null | undefined> = 
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export enum PaymentPlan {
    None = "",
    Monthly = "Monthly",
    BiMonthly = "Bi-Monthly",
    EveryTwoWeeks = "Every Two Weeks"
  }
  

  
export type DiscountInput = ArrayElement<RunInput["discounts"]>;
export type LineInput = ArrayElement<RunInput["cart"]["lines"]>;

export function reduceByPaymentPlan(plan: PaymentPlan, amount: number) {
    switch(plan) {
      case PaymentPlan.BiMonthly:
      case PaymentPlan.EveryTwoWeeks:
        return amount / 2;
      default:
        return amount;
    }
  }
  
export function fixedAmount(value: Value) {
    return Number((value as FixedAmount).amount);
  }

export const shopifyGid = (entity: ShopifyEntity, handle: string) => `gid://shopify/${entity}/${handle}`;
export function decomposeGid(gid: string): GID {
    const [handle, entity] = gid.split("/").reverse();
    return { handle, entity: ShopifyEntity[entity] };
}

export function first<T>(collection: T[] | InputMaybe<T[]> | undefined ): T {
    return collection?.pop() as T;
}

export function strToPaymentPlan(convertingStr: string): PaymentPlan {
    if (Object.values(PaymentPlan).includes(convertingStr as PaymentPlan)) {
        return (convertingStr as PaymentPlan);
    } else {
        throw new Error(` '${convertingStr}' is not a valid Payment Plan. valid options ${Object.values(PaymentPlan).join(", ")}`);
    }
}

export function mergeResults(results: FunctionRunResult[]) {
    const result: FunctionRunResult = { lineDiscounts: [], displayableErrors: []};
    results.forEach(({ lineDiscounts, displayableErrors}) => {
        result.displayableErrors?.push(...(displayableErrors ?? []));
        result.lineDiscounts?.push(...(lineDiscounts ?? []));
    })
    return result;
 }