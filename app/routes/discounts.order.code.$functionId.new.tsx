// @ts-ignore
// [START build-the-ui.create-the-ui]
import { useEffect, useMemo } from "react";
import { json } from "@remix-run/node";
import { useForm, useField } from "@shopify/react-form";
import { CurrencyCode } from "@shopify/react-i18n";
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
  VerticalStack,
} from "@shopify/polaris";

import { authenticate } from "../shopify.server.js";
import { useDiscountFormSubmit, useNow } from "../hooks/index.js";

const returnToDiscounts = () => open("shopify://admin/discounts", "_top");

export default function OrderDiscountCode() {
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
                <VerticalStack>
                    <MethodCard
                    title="General"
                     />
                </VerticalStack>
            </Form>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
function useDiscountForm(discountSubmit: (form: import("../types/discounts.js").DiscountInput) => { status: string; }, now: Date): { fields: { discountTitle: any; discountCode: any; discountMethod: any; combinesWith: any; requirementType: any; requirementSubtotal: any; requirementQuantity: any; usageLimit: any; appliesOncePerCustomer: any; startDate: any; endDate: any; configuration: any; }; submit: any; } {
    throw new Error("Function not implemented.");
}

