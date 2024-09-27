import type { DiscountMethod, RequirementType } from "@shopify/discount-app-components";
import type { Field } from "@shopify/react-form";

export type DiscountSubmit = (form: any) => { status: 'success' | 'failed' | '' };
export type DiscountType = "fixedAmount" | "percentage" | string;

export type DiscountInput = {
    discountTitle: string,
    discountMethod: DiscountMethod,
    discountCode: string,
    combinesWith: {
        orderDiscounts: boolean,
        productDiscounts: boolean,
        shippingDiscounts: boolean,
    },
    requirementType: RequirementType,
    requirementSubtotal: string,
    requirementQuantity: string,
    usageLimit: string | null,
    appliesOncePerCustomer: boolean,
    startDate: Date ,
    endDate: Date | null,
    configuration: {
        discountType: DiscountType,
        "": number,
        "Monthly": number,
        "Bi-Monthly": number,
        "Every Two Weeks": number
    },
};

export type DiscountFields = {
    [key in keyof Omit<DiscountInput, 'configuration'>]: Field<DiscountInput[key]>;
} & {
    configuration: {
        [key in keyof DiscountInput['configuration']]: Field<DiscountInput['configuration'][key]>
    }
}