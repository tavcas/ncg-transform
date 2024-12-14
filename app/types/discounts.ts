import type { DiscountMethod, DiscountStatus, RequirementType } from "@shopify/discount-app-components";
import type { Field } from "@shopify/react-form";
import type {CurrencyCode} from '@shopify/react-i18n';

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

type DiscountMetadataInput = {
    id?:string;
}

export type DiscountConfigurationInput = DiscountMetadataInput & {
    discountType: DiscountType,
    "": number,
    "Monthly": number,
    "Bi-Monthly": number,
    "Every Two Weeks": number
};

export type DiscountRequirementsInput = DiscountMetadataInput & {
    requirementType: RequirementType,
    requirementSubtotal: string,
    requirementQuantity: string,
    currencyCode: CurrencyCode
}

export type DiscountInput = {
    discountTitle: string,
    discountMethod: DiscountMethod,
    discountCode: string,
    combinesWith: {
        orderDiscounts: boolean,
        productDiscounts: boolean,
        shippingDiscounts: boolean,
    },
    usageLimit: string | null,
    appliesOncePerCustomer: boolean,
    startDate: string ,
    endDate: string | null,
    configuration: DiscountConfigurationInput,
    requirements: DiscountRequirementsInput,
    usageCount: number | null,
    status: DiscountStatus
    
};

export type AsField<T, O extends keyof T | void > = O extends keyof T ? {
  [key in keyof Omit<T, O>]: Field<T[key]>
} : {
    [key in keyof T]: Field<T[key]>
}


export type DiscountConfigurationFields = AsField<DiscountConfigurationInput, void>
export type DiscountRequirementsFields = AsField<DiscountRequirementsInput, void>;
export type DiscountFields = AsField<DiscountInput, "configuration" | "requirements"> & {
    configuration: DiscountConfigurationFields;
    requirements: DiscountRequirementsFields;
}