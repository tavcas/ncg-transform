// @ts-ignore
// [START build-the-ui.create-the-ui]
import { useEffect, useMemo, useState } from "react";
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
  BlockStack
} from "@shopify/polaris";

import { authenticate } from "../shopify.server.js";
import { useDiscountFormSubmit, useNow, useDiscountForm } from "../hooks/index.js";
import React from "react";

const returnToDiscounts = () => open("shopify://admin/discounts", "_top");

export default function OrderDiscountCode() {
  const navigation = useNavigation();

  const isLoading = navigation.state === "submitting";
  const currencyCode = CurrencyCode.Usd;
    const now = useNow();
    const discountSubmit = useDiscountFormSubmit();
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
  return (
    <Page>
      <ui-title-bar title="Create order discount by payment plan">
        <button variant="breadcrumb" onClick={returnToDiscounts}>
          Discounts
        </button>
        <button variant="primary" onClick={submit}>
          Save discount
        </button>
      </ui-title-bar>
      <Layout>
        {/**TODO: Add error banner */}
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
              <Box paddingBlockEnd="300">
                <Card>
                  <BlockStack gap={300}>
                  <Text variant="headingMd" as="h3">
                      Value Type
                    </Text>
                    <Select
                    label=""
                    options={[
                        { label: 'Fixed amount', value: 'fixedAmount'},
                        { label: 'Percentage', value: 'percentage'},
                    ]}
                    {...configuration.discountType}
                     />
                     <Text variant="headingMd" as="h3">
                      Value by payment plan
                    </Text>
                    {Object.entries(configuration).filter(k => k[0] !== 'discountType').map(([k, f]) => (
                       <TextField
                       key={k}
                       label={k || "None"}
                       autoComplete="on"
                       {...f}
                       suffix={configuration.discountType.value === "percentage" ? "%" : ""}
                     />
                    ))}
                  </BlockStack>
                </Card>
              </Box>
              {/* [START build-the-ui.other-components] */}
              {discountMethod.value === DiscountMethod.Code && (
                <UsageLimitsCard
                  totalUsageLimit={usageLimit}
                  oncePerCustomer={appliesOncePerCustomer}
                />
              )}
              <CombinationCard
                combinableDiscountTypes={combinesWith}
                discountClass={DiscountClass.Product}
                discountDescriptor={"Discount"}
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
              appDiscountType: "Volume",
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
      </Layout>
    </Page>
  );
}

