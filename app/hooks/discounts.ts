import { useCallback, useState } from "react";
import { useSubmit } from "@remix-run/react";
import { useForm, useField } from "@shopify/react-form";
import type { DiscountFields, DiscountInput, DiscountSubmit } from "../types";
import type { ErrorBannerProps } from "../components/ErrorBanner";
import { DiscountMethod, DiscountStatus, RequirementType } from "@shopify/discount-app-components";
import {CurrencyCode} from '@shopify/react-i18n';

type errors = ErrorBannerProps["errors"]
export const useDiscountForm = (onSubmit: DiscountSubmit, initial: Partial<DiscountInput>) => useForm<DiscountFields>({
    onSubmit: (fields: any) => {
        onSubmit(fields);
        return fields;
    },
    fields: {
        discountTitle: useField(initial.discountTitle ?? ""),
        discountMethod: useField(initial.discountMethod ?? DiscountMethod.Code),
        discountCode: useField(initial.discountCode ?? ""),
        combinesWith: useField(initial.combinesWith ?? { productDiscounts: false, orderDiscounts: false, shippingDiscounts: false}),
        
        usageLimit: useField(initial.usageLimit ?? "0"),
        appliesOncePerCustomer: useField(initial.appliesOncePerCustomer ?? false),
        startDate: useField(initial.startDate ?? new Date().toISOString()),
        endDate: useField(initial.endDate ?? ""),
        status: useField(initial.status ?? DiscountStatus.Scheduled),
        usageCount: useField(initial.usageCount ?? null),
        // [START build-the-ui.add-configuration]
        configuration: {
          ...(initial.configuration?.id ? { id: useField(initial.configuration.id) } : {}),
          discountType: useField(initial.configuration?.discountType ?? "fixedAmount"),
          "": useField(initial.configuration?.[""] ?? 0),
          "Monthly": useField(initial.configuration?.["Monthly"] ?? 0),
          "Bi-Monthly": useField(initial.configuration?.["Bi-Monthly"] ?? 0),
          "Every Two Weeks": useField(initial.configuration?.["Every Two Weeks"] ?? 0)
        },
        requirements: {
          ...(initial.requirements?.id ? { id: useField(initial.requirements.id) } : {}),
          currencyCode: useField(initial.requirements?.currencyCode ?? CurrencyCode.Usd),
          requirementType: useField(initial.requirements?.requirementType ?? RequirementType.None),
          requirementQuantity: useField(initial.requirements?.requirementQuantity ?? "0"),
          requirementSubtotal: useField(initial.requirements?.requirementSubtotal ?? "0")
        },
        // [END build-the-ui.add-configuration]
      },
})


export const useDiscountFormSubmit = (): [DiscountSubmit, errors] => {
    const submitForm = useSubmit();
    const [submitErrors, setSubmitErrors] = useState<errors>([]);
    const submit: DiscountSubmit = useCallback((form: DiscountInput) => {
        setSubmitErrors([]);
        const errors: errors = [];
        const discount = {
          title: form.discountTitle,
          method: form.discountMethod,
          code: form.discountCode,
          combinesWith: form.combinesWith,
          usageLimit: form.usageLimit === null ? null : Number(form.usageLimit),
          appliesOncePerCustomer: form.appliesOncePerCustomer,
          startsAt: form.startDate,
          endsAt: form.endDate,
          configuration: {
              id: form.configuration.id,
              discountType: form.configuration.discountType,
              "": form.configuration[""],
              "Monthly": form.configuration["Monthly"],
              "Bi-Monthly": form.configuration["Bi-Monthly"],
              "Every Two Weeks": form.configuration["Every Two Weeks"],
            },
          requirements: form.requirements
        };

        if(discount.method === DiscountMethod.Code && !discount.code) {
          errors.push({ field: ["code"], message: "Code cannot be empty"});
        }

        if(discount.method === DiscountMethod.Automatic && !discount.title) {
          errors.push({ field: ['title'], message: 'Discount requires a title' });
        }

        if(Object.entries(discount.configuration).filter(([k, v]) => k !== "discountType" && Number(v) > 0).length === 0) {
          errors.push({ field: ["configuration"], message: "Please submit a value for at least one Payment Plan"});
        }

        if(discount.requirements.requirementType === RequirementType.Quantity && !discount.requirements.requirementQuantity) {
          errors.push({ field: ['requirements', 'requirementQuantity'], message: 'Must input a non zero value for quantity'});
        }

        if(discount.requirements.requirementType === RequirementType.Subtotal && !discount.requirements.requirementSubtotal) {
          errors.push({ field: ['requirements', 'requirementSubtotal'], message: 'Must input a non zero value for subtotal'});
        }
    
        if(errors.length > 0) {
          setSubmitErrors(errors);
          return { status: 'error', errors }
        }

        submitForm({ discount: JSON.stringify(discount) }, { method: "post" });
        return { status: "success" };

      },[submitForm]);

      return [submit, submitErrors] satisfies [DiscountSubmit, errors];
}