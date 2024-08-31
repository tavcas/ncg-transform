import type {
  RunInput,
  FunctionRunResult,
  LineDiscount,
  DisplayableError,
  FixedAmount
} from "../generated/api.ts";

const ALLOCATIONS = {
  "Monthly": (amount: number) => amount,
  "Bi-Monthly": (amount: number) => amount / 2,
  "Every Two Weeks": (amount: number) => amount / 2
}

export function run(input: RunInput): FunctionRunResult {
  const { lines, plan } = input.cart;
  const displayableErrors: DisplayableError[] = [];
  const lineDiscounts: LineDiscount[] = [];
  const allocation = ALLOCATIONS[plan?.value ?? ""];
  for( let discount of input.discounts ?? []) {
    if(allocation) {
      for (let proposal of discount.discountProposals ) {
       
        for( let target of proposal.targets) {
          const line = lines.find(l => l.id === target.cartLineId);
          if(line) {
            const amount = allocation(Number((proposal.value as FixedAmount).amount));
            lineDiscounts.push({
              cartLineId: line.id,
              quantity: 1,
              allocations: [
                {
                  amount,
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
    } else {
      displayableErrors.push({ discountId: discount.id, reason: `'${plan?.value}' is not a valid payment plan`});
      break;
    }
  }
  return { lineDiscounts, displayableErrors };
}