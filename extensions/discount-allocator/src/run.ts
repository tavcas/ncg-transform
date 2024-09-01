import {
  type RunInput,
  type FunctionRunResult,
  type LineDiscount,
  type DisplayableError,
  type FixedAmount,
  DiscountClass,
  DiscountApplicationStrategy,
  DiscountProposal,
  Value,
  CartLineTarget,
} from "../generated/api.ts";
import { DiscountInput, fixedAmount, LineInput, mergeResults, PaymentPlan, reduceByPaymentPlan, ShopifyEntity, shopifyGid, strToPaymentPlan } from "./utils.ts";

 function findProposalByStrategy(strategy: DiscountApplicationStrategy, proposals: DiscountProposal[]): DiscountProposal[] {
  switch(strategy) {
    case DiscountApplicationStrategy.First:
      return proposals.slice(0, 1);
    case DiscountApplicationStrategy.Maximum: 
      return proposals.sort((p1, p2) => fixedAmount(p1.value) - fixedAmount(p2.value)).reverse().slice(0, 1);
    case DiscountApplicationStrategy.All:
    default:
      return proposals;
    
  }
}

 const mapTargetsToOrderAllocation = (targets: CartLineTarget[], amount: Number, proposalHandle: string) => 
  targets.map(({ cartLineId, quantity }) => ({
    cartLineId,
    quantity,
    allocations: [
      {
        amount,
        discountProposalId: shopifyGid(ShopifyEntity.DiscountProposal, proposalHandle)
      }
    ]
  }) as LineDiscount);






function allocateOrderDiscount(discount: DiscountInput, cartPlan: PaymentPlan): FunctionRunResult {
  console.log({ cartPlan });
  const lineDiscounts: LineDiscount[] = []
  const displayableErrors: DisplayableError[] = []
  for (let proposal of findProposalByStrategy(discount.discountApplicationStrategy, discount.discountProposals as DiscountProposal[])) {
    const amount = fixedAmount(proposal.value);
    const allocation = reduceByPaymentPlan(cartPlan, amount);
    const allocations = mapTargetsToOrderAllocation(proposal.targets, allocation, proposal.handle);
    if (allocations && allocations.length > 0) {
      lineDiscounts.push(...allocations);
    } else {
      displayableErrors.push({
        discountId: discount.id,
        reason: "No valid allocations for this discount"
      });
    }
  }

  return { lineDiscounts, displayableErrors }
}



function allocateProductDiscount(discount: DiscountInput, lines: LineInput[]): FunctionRunResult {
  const lineDiscounts: LineDiscount[] = []
  const displayableErrors: DisplayableError[] = []
  for (let proposal of findProposalByStrategy(discount.discountApplicationStrategy, discount.discountProposals as DiscountProposal[])) {
    const proposalDiscounts = proposal.targets
    .filter(({ cartLineId }) => lines.findIndex(l => l.id === cartLineId))
    .map(({ cartLineId, quantity }) => {
      const { plan } = lines.find(({ id }) => id === cartLineId) ?? {};
      const amount = fixedAmount(proposal.value);
      const linePlan = strToPaymentPlan(plan?.value ?? "");
      const allocation = reduceByPaymentPlan(linePlan, amount);
      return {
        cartLineId,
        quantity,
        allocations: [
          {
            amount: allocation,
            discountProposalId: shopifyGid(ShopifyEntity.DiscountProposal, proposal.handle)
          }
        ]
      } as LineDiscount
    });
    if(proposalDiscounts && proposalDiscounts.length > 0) {
      lineDiscounts.push(...proposalDiscounts);
    } else {
      displayableErrors.push({
        discountId: discount.id,
        reason: `No valid allocations for "${proposal.message}"`
      });
    }
  }

  return { lineDiscounts, displayableErrors }
}
  

export function run(input: RunInput): FunctionRunResult {
  const { plan, lines } = input.cart;
  try {
    const result = input.discounts?.map(d => {
      switch(d.discountClass) {
        case DiscountClass.Order: 
        return allocateOrderDiscount(d, strToPaymentPlan(plan?.value ?? ""))
        case DiscountClass.Product:
          return allocateProductDiscount(d, lines);
      }
    }) ?? [];
    return mergeResults(result);
  } catch(e) {
    console.error(e.message, e);
    return { displayableErrors: [{ discountId: "", reason: e.message }]};
  }
}