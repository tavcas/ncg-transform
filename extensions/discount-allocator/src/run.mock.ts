import { DiscountApplicationStrategy, DiscountClass, FixedAmount, RunInput } from "../generated/api";
import { DiscountInput } from "./utils";
export const FIXED_AMOUNT: FixedAmount = { amount: 5, appliesToEachItem: false }
export const ORDER_DISCOUNT: DiscountInput = {
    id: "gid://shopify/Discount/1",
    code: "ORDER",
    discountClass: DiscountClass.Order,
    discountApplicationStrategy: DiscountApplicationStrategy.All,
    discountProposals: [
        {
            handle: "1",
            value: FIXED_AMOUNT,
            targets: [

            ]
        }
    ]
}
export const MONTHLY_PLAN: RunInput["cart"]["plan"] = { value: "Monthly" };
export const MONTHLY_LINE = {
    id: "gid://shopify/CartLine/1",
    plan: { value: "Monthly" }
};
export const MONTHLY_CART = {
    plan: MONTHLY_PLAN,
    lines: [MONTHLY_LINE]
}
export const MONTHLY_INPUT = {
    cart: MONTHLY_CART,
    discounts: [
        {
            id: "gid://shopify/Discount/1"
        }

    ]
}