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
  CartLineTarget
} from "../generated/api.ts";

enum PaymentPlan {
  None = "",
  Monthly = "Monthly",
  BiMonthly = "Bi-Monthly",
  EveryTwoWeeks = "Every Two Weeks"
}

type ArrayElement<ArrayType extends readonly unknown[] | null | undefined> = 
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

const ALLOCATIONS = {
  [PaymentPlan.Monthly]: (amount: number) => amount,
  [PaymentPlan.BiMonthly]: (amount: number) => amount / 2,
  [PaymentPlan.EveryTwoWeeks]: (amount: number) => amount / 2
}

function reduceByPaymentPlan(plan: PaymentPlan, amount: number) {
  switch(plan) {
    case PaymentPlan.BiMonthly:
    case PaymentPlan.EveryTwoWeeks:
      return amount / 2;
    default:
      return amount;
  }
}

function fixedAmount(value: Value) {
  return Number((value as FixedAmount).amount);
}

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

 const mapTargetsToAllocations = (targets: CartLineTarget[], amount: Number, proposalHandle: string) => 
  targets.map(({ cartLineId, quantity }) => ({
    cartLineId,
    quantity,
    allocations: [
      {
        amount,
        discountProposalId: `gid://shopify/DiscountProposal/${proposalHandle}`
      }
    ]
  }) as LineDiscount);
  

export function run(input: RunInput): FunctionRunResult {
  const { lines, plan } = input.cart;
  const displayableErrors: DisplayableError[] = [];
  const lineDiscounts: LineDiscount[] = [];
  for( let discount of input.discounts?.sort(({ discountApplicationStrategy}, _) => discountApplicationStrategy === DiscountApplicationStrategy.First ? 1 : -1).reverse() ?? []) {
    switch (discount.discountClass) {
      case DiscountClass.Order:
        allocateOrderDiscount(discount, plan, lineDiscounts, displayableErrors); 
        break;
      case DiscountClass.Product:
        for (let proposal of discount.discountProposals ) {
       
          for( let target of proposal.targets) {
            const line = lines.find(l => l.id === target.cartLineId);
            if(line) {
              const { amount }  = (proposal.value as FixedAmount);
              const allocation =  line.plan && line.plan.value ? ALLOCATIONS[line.plan.value](Number(amount)) : Number(amount);
              lineDiscounts.push({
                cartLineId: line.id,
                quantity: 1,
                allocations: [
                  {
                    amount: allocation,
                    discountProposalId: `gid://shopify/DiscountProposal/${proposal.handle}`
                  }
                ]
              });
  
            } else {
              displayableErrors.push({
                discountId: discount.id,
                reason: `Discount proposal ${proposal.handle} is targetting non existing cart line`
              })
            }
          }
       }
        break;
    }

  }
  return { lineDiscounts, displayableErrors };
}



function allocateOrderDiscount(discount: ArrayElement<RunInput["discounts"]>, cartPlan: PaymentPlan): FunctionRunResult {
  const lineDiscounts: LineDiscount[] = []
  const displayableErrors: DisplayableError[] = []
  for (let proposal of findProposalByStrategy(discount.discountApplicationStrategy, discount.discountProposals as DiscountProposal[])) {
    const amount = fixedAmount(proposal.value);
    const allocation = reduceByPaymentPlan(cartPlan, amount);
    const allocations = mapTargetsToAllocations(proposal.targets, allocation, proposal.handle);
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
