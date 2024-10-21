import type { Form  as FormType} from "@shopify/react-form";
import type { DiscountFields } from "../types";
import { Form } from "@remix-run/react";
import { MethodCard, DiscountClass, DiscountMethod, UsageLimitsCard, CombinationCard, ActiveDatesCard, SummaryCard, DiscountStatus } from "@shopify/discount-app-components";
import { Layout, BlockStack, PageActions } from "@shopify/polaris";
import DiscountConfiguration from "./DiscountConfiguration";
import type { ErrorBannerProps } from "./ErrorBanner";
import React from "react";
import ErrorBanner from "./ErrorBanner";
import DiscountRequirements from "./DiscountRequirements";
import { NEW_ID } from "../constants";

type OrderDiscountFormProps = FormType<DiscountFields> & ErrorBannerProps & {
    isLoading: boolean;
    onDiscard: () => void
    id?: string
};

export default function OrderDiscountForm({
    id,
    fields: {
      discountTitle,
      discountCode,
      discountMethod,
      combinesWith,
      requirements,
      usageLimit,
      appliesOncePerCustomer,
      startDate,
      endDate,
      configuration,
      usageCount,
      status
    },
    submit,
    errors,
    isLoading,
    onDiscard
  }: OrderDiscountFormProps) {
    return (<Layout>
    <ErrorBanner errors={errors} />
        <Layout.Section>
            <Form method="post">
            <BlockStack align="space-around" gap="200">
                <MethodCard
                discountMethodHidden={id && id !== NEW_ID ? true : false}
                title="General"
                discountTitle={discountTitle}
                discountClass={DiscountClass.Order}
                discountCode={discountCode}
                discountMethod={discountMethod}
                
              />
              <DiscountConfiguration {...configuration} />
              <DiscountRequirements {...requirements} />
              {/* [START build-the-ui.other-components] */}
              {discountMethod.value === DiscountMethod.Code && (
                <UsageLimitsCard
                  totalUsageLimit={usageLimit}
                  oncePerCustomer={appliesOncePerCustomer}
                />
              )}
              <CombinationCard
                combinableDiscountTypes={combinesWith}
                discountClass={DiscountClass.Order}
                discountDescriptor={discountMethod.value === DiscountMethod.Automatic ? discountTitle.value : discountCode.value}
              />
              <ActiveDatesCard
                startDate={startDate}
                endDate={endDate}
                timezoneAbbreviation="EST"
              />
            </BlockStack>
            </Form>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          {/* [START build-the-ui.summary-card] */}
          <SummaryCard
            header={{
              discountMethod: discountMethod.value,
              discountDescriptor:
                discountMethod.value === DiscountMethod.Automatic
                  ? discountTitle.value
                  : discountCode.value,
              appDiscountType: "Amount off Order By Payment Plan",
              isEditing: false,
            }}
            performance={{
              status: status.value ?? DiscountStatus.Scheduled,
              usageCount: usageCount.value ?? 0,
            }}
            minimumRequirements={{
              requirementType: requirements.requirementType.value,
              subtotal: requirements.requirementSubtotal.value,
              quantity: requirements.requirementQuantity.value,
              currencyCode: requirements.currencyCode.value,
            }}
            usageLimits={{
              oncePerCustomer: appliesOncePerCustomer.value,
              totalUsageLimit: usageLimit.value,
            }}
            activeDates={{
              startDate: startDate.value,
              endDate: endDate.value,
            }}
          />
          {/* [END build-the-ui.summary-card] */}
        </Layout.Section>
        <Layout.Section>
          <PageActions
            primaryAction={{
              content: "Save discount",
              onAction: submit,
              loading: isLoading,
            }}
            secondaryActions={[
              {
                content: "Discard",
                onAction: onDiscard,
              },
            ]}
          />
        </Layout.Section>
      </Layout>);
}