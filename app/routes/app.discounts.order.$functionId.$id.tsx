// @ts-ignore
// [START build-the-ui.create-the-ui]
import {
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import {
  Page} from "@shopify/polaris";
import type { DataFunctionArgs } from "@remix-run/node";
import { useDiscountFormSubmit, useDiscountForm } from "../hooks/index.js";
import React from "react";
import saveOrderDiscount from "../actions/saveOrderDiscount.js";
import { TitleBar } from "@shopify/app-bridge-react";
import OrderDiscountForm from "../components/OrderDiscountForm.js";
import queryOrderDiscount from "../actions/queryOrderDiscount.js";
import type { DiscountInput } from "../types/discounts.js";
import type { ErrorBannerProps } from "../components/ErrorBanner.js";

const returnToDiscounts = () => open("shopify://admin/discounts", "_top");

export async function loader(args: DataFunctionArgs) {
  return  queryOrderDiscount(args);
}

export async function action(args: DataFunctionArgs) {
  return saveOrderDiscount(args);
}

export default function OrderDiscountApp() {
  const navigation = useNavigation();
  const result =  useActionData<{ discount?: DiscountInput, errors: ErrorBannerProps["errors"]}>();
  const data = useLoaderData<{ discount?: DiscountInput, functionId: string, errors?: ErrorBannerProps["errors"]}>();
  const isLoading = navigation.state === "submitting";
  const [discountSubmit, submitErrors] = useDiscountFormSubmit();
  const form = useDiscountForm(discountSubmit, result?.discount ?? data.discount ?? {});
  const errors: ErrorBannerProps["errors"] = [...submitErrors, ...(result?.errors ?? []), ...(data?.errors ?? [])];

  return (
    <Page >
      <TitleBar title="Create order discount by payment plan">
      </TitleBar>
      <OrderDiscountForm 
      {...form} 
      isLoading={isLoading}
      errors={errors}
      onDiscard={returnToDiscounts} />
    </Page>
  );
}

