// @ts-ignore
// [START build-the-ui.create-the-ui]
import { useEffect, useMemo, useRef, useState } from "react";
import { json } from "@remix-run/node";
import { useForm, useField } from "@shopify/react-form";
import {CurrencyCode} from '@shopify/react-i18n';
import {
  Form,
  useActionData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import {
  ActiveDatesCard,
  CombinationCard,
  DiscountClass,
  DiscountMethod,
  MethodCard,
  DiscountStatus,
  RequirementType,
  SummaryCard,
  UsageLimitsCard,
} from "@shopify/discount-app-components";
import {
  Banner,
  Card,
  Text,
  Layout,
  Page,
  PageActions,
  TextField,
  Box,
  Select,
  LegacyStack,
  BlockStack,
  Icon,
  Button
} from "@shopify/polaris";
import { useDiscountFormSubmit, useNow, useDiscountForm } from "../hooks/index.js";
import React from "react";
import saveOrderDiscount from "../actions/saveOrderDiscount.js";
import ErrorBanner from "../components/ErrorBanner.js";
import { TitleBar } from "@shopify/app-bridge-react";
import DiscountConfiguration from "../components/DiscountConfiguration.js";

const returnToDiscounts = () => open("shopify://admin/discounts", "_top");

export async function action(context) {
  return saveOrderDiscount(context);
}

export default function OrderDiscountNew() {
  const navigation = useNavigation();
  const data = useActionData();
  const isLoading = navigation.state === "submitting";
  const currencyCode = CurrencyCode.Usd;
    const now = useNow();
    const [discountSubmit, submitErrors] = useDiscountFormSubmit();
    const {
        fields: {
          discountTitle,
          discountCode,
          discountMethod,
          combinesWith,
          requirementType,
          requirementSubtotal,
          requirementQuantity,
          usageLimit,
          appliesOncePerCustomer,
          startDate,
          endDate,
          // [START build-the-ui.add-configuration]
          configuration,
          // [END build-the-ui.add-configuration]
        },
        submit,
      } = useDiscountForm(discountSubmit, now);

      const errors = submitErrors.concat(data?.errors ?? []);

  return (
    <Page  >
      <input type="hidden" />
      <TitleBar title="Create order discount by payment plan">
      {/* <button variant="base" onClick={returnToDiscounts}>
        Discard
        </button>
        <button variant="primary" onClick={submit}>
          Save discount
        </button> */}
      </TitleBar>
      <Layout>
      <ErrorBanner errors={errors} />
        <Layout.Section>
            <Form method="post">
            <BlockStack align="space-around" gap="200">
                <MethodCard
                title="General"
                discountTitle={discountTitle}
                discountClass={DiscountClass.Order}
                discountCode={discountCode}
                discountMethod={discountMethod}
              />
              <DiscountConfiguration {...configuration} />
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
              status: DiscountStatus.Scheduled,
              usageCount: 0,
              isEditing: false,
            }}
            minimumRequirements={{
              requirementType: requirementType.value,
              subtotal: requirementSubtotal.value,
              quantity: requirementQuantity.value,
              currencyCode: currencyCode,
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
                onAction: returnToDiscounts,
              },
            ]}
          />
        </Layout.Section>
      </Layout>
    </Page>
  );
}

