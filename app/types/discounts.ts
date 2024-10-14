import type { DiscountMethod, DiscountStatus, RequirementType } from "@shopify/discount-app-components";
import type { Field } from "@shopify/react-form";

export type DiscountSubmit = (form: DiscountInput) => {
    status: 'success' | 'failed';
    errors: {
        field: string[];
        message: string;
    }[];
  } | {
    status: string;
  };
export type DiscountType = "fixedAmount" | "percentage" | string;

export type DiscountConfigurationInput = {
    discountType: DiscountType,
    "": number,
    "Monthly": number,
    "Bi-Monthly": number,
    "Every Two Weeks": number
};

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
    startDate: string ,
    endDate: string | null,
    configuration: DiscountConfigurationInput,
    usageCount: number | null,
    status: DiscountStatus
    
};

export type AsField<T, O extends keyof T | void > = O extends keyof T ? {
  [key in keyof Omit<T, O>]: Field<T[key]>
} : {
    [key in keyof T]: Field<T[key]>
}


export type DiscountConfigurationFields = AsField<DiscountConfigurationInput, void>
export type DiscountFields = AsField<DiscountInput, "configuration"> & {
    configuration: DiscountConfigurationFields
}