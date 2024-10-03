import { useCallback, useState } from "react";
import { useSubmit } from "@remix-run/react";
import { DiscountMethod, RequirementType } from "@shopify/discount-app-components";
import { useForm, useField } from "@shopify/react-form";
import type { DiscountFields, DiscountInput, DiscountSubmit } from "../types";
import type { ErrorBannerProps } from "../components/ErrorBanner";

type errors = ErrorBannerProps["errors"]
export const useDiscountForm = (onSubmit: DiscountSubmit, startDate: Date) => useForm<DiscountFields>({
    onSubmit: (fields: any) => {
        onSubmit(fields);
        return fields;
    },
    fields: {
        discountTitle: useField(""),
        discountMethod: useField(DiscountMethod.Code),
        discountCode: useField(""),
        combinesWith: useField({
          orderDiscounts: false,
          productDiscounts: false,
          shippingDiscounts: false,
        }),
        requirementType: useField(RequirementType.None),
        requirementSubtotal: useField("0"),
        requirementQuantity: useField("0"),
        usageLimit: useField(null),
        appliesOncePerCustomer: useField(false),
        startDate: useField(startDate.toISOString()),
        endDate: useField(null),
        // [START build-the-ui.add-configuration]
        configuration: {
          discountType: useField("fixedAmount"),
          "": useField(0),
          "Monthly": useField(0),
          "Bi-Monthly": useField(0),
          "Every Two Weeks": useField(0)
        },
        // [END build-the-ui.add-configuration]
      },
})

export type DiscountSubmitCallback = (form: DiscountInput) => {
  status: string;
  errors: {
      field: string[];
      message: string;
  }[];
} | {
  status: string;
  errors?: undefined;
};

export const useDiscountFormSubmit: [DiscountSubmitCallback, errors] = () => {
    const submitForm = useSubmit();
    const [submitErrors, setSubmitErrors] = useState<errors>([]);
    const submit: DiscountSubmitCallback = useCallback((form: DiscountInput) => {
        setSubmitErrors([]);
        const errors: errors = [];
        const discount = {
          title: form.discountTitle,
          method: form.discountMethod,
          code: form.discountCode,
          combinesWith: form.combinesWith,
          usageLimit: form.usageLimit == null ? null : Number(form.usageLimit),
          appliesOncePerCustomer: form.appliesOncePerCustomer,
          startsAt: form.startDate,
          endsAt: form.endDate,
          configuration: {
              discountType: form.configuration.discountType,
              "": form.configuration[""],
              "Monthly": form.configuration["Monthly"],
              "Bi-Monthly": form.configuration["Bi-Monthly"],
              "Every Two Weeks": form.configuration["Every Two Weeks"],
            },
        };

        if(Object.entries(discount.configuration).filter(([k, v]) => k !== "discountType" && Number(v) > 0).length === 0) {
          errors.push({ field: ["configuration"], message: "Please submit a value for at least one Payment Plan"});
        }
    
        if(errors.length > 0) {
          setSubmitErrors(errors);
          return { status: 'error', errors }
        }

        submitForm({ discount: JSON.stringify(discount) }, { method: "post" });
        return { status: "success" };

      },[submitForm]);

      return [submit, submitErrors];
}