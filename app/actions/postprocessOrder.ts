import type { DataFunctionArgs } from "@remix-run/node";
import { Response } from "@remix-run/node";
import type { LineItem, OrderCreatePayload, OrderDetailNote } from "../types/orders";
import { PaymentPlan } from "../constants";
import type { KeyNumberMap, MaybeUserError } from "../types/common";
import shopify from "../shopify.server";
import {
  ADD_DISCOUNT_MUTATION,
  ADD_VARIANT_MUTATION,
  BEGIN_EDIT_MUTATION,
  COMMIT_ORDER_MUTATION,
  EDIT_QUANTITY_MUTATION,
} from "../graphql";
import { CurrencyCode} from "../graphql/generated/graphql";
import type { Mutation } from "../graphql/generated/graphql";
import { shopifyId } from "../lib/shopify";
import type { ProductDetails } from "../types";

type OrderAddVariantResponse = Exclude<
  Mutation["orderEditAddVariant"],
  null | undefined
>;
type OrderSetQuantity = Mutation["orderEditSetQuantity"];
type OrderLineItem = OrderCreatePayload["line_items"][0];

const discountsByPaymentPlan = {
  [PaymentPlan.None]: 0,
  [PaymentPlan.Monthly]: 88.888888,
  [PaymentPlan.BiMonthly]: 94.444444,
  [PaymentPlan.EveryTwoWeeks]: 94.444444,
};

const paymentPlanFromNotes = (note_attributes: any[]) => {
  const { value: paymentPlan } = note_attributes.find(
    (n) => n.name === "Payment Plan"
  );
  if (!paymentPlan) {
    return new Response("Order ignored cause it doesn't have a payment plan", {
      status: 304,
    });
  }

  console.log(`My payment plan is ${paymentPlan}`);
  return paymentPlan;
};

const discountFromPaymentPlan = (paymentPlan: string) => {
  const discount_percentage = discountsByPaymentPlan[paymentPlan];
  if (discount_percentage < 0) {
    return new Response("No order line needs a price adjustment", {
      status: 304,
    });
  }

  console.log(`Discount percentage is ${discount_percentage}%`);
  return discount_percentage;
};

const orderDetailsFromNotes = (note_attributes: any[]) => {
  const orderDetails: string = note_attributes.find(
    (n) => n.name === "Order details"
  )?.value;
  if (!orderDetails) {
    throw new Response("Order doesn't have a order details", {
      status: 400,
    });
  }

  console.log(`Order details are: ${orderDetails}`);
  return JSON.parse(orderDetails) as OrderDetailNote[];
};

const primaryProductFromNotes = (note_attributes: any[]) => {
  const primaryProduct: string = note_attributes.find(
    (n) => n.name === "Primary Product Details"
  )?.value;
  if (!primaryProduct) {
    throw new Response("Order doesn't have a primary product", {
      status: 400,
    });
  }

  console.log(`Order details are: ${primaryProduct}`);
  return JSON.parse(primaryProduct) as ProductDetails;
};

const summarizeQuantities = (orderDetails: OrderDetailNote[]) => {
  //aggregating quantities to variants
  const quantitiesByVariant: KeyNumberMap = orderDetails.reduce(
    (p, c) => ({
      ...p,
      [c.variant]: p[c.variant] ? p[c.variant] + c.quantity : c.quantity,
    }),
    {}
  );
  console.log("Quantities by variant");
  console.table(quantitiesByVariant);
  return quantitiesByVariant;
};

const checkIsProcessed = (note_attributes: any[], orderId: number) => {
  if (note_attributes.findIndex((n) => n.name === "Processed at")) {
    throw new Response(`Order already processed: ${orderId}`, {
      status: 304,
    });
  }
  console.log(note_attributes);
};

const variantDiscountMap = (lines: OrderLineItem[]) => {
  const discountsByVariant: KeyNumberMap = lines.reduce(
    (p, l) => ({
      ...p,
      [String(l.variant_id)]: p[String(l.variant_id)]
        ? p[String(l.variant_id)] +
          l.discount_allocations.reduce((s, d) => s + Number(d.value), 0)
        : l.discount_allocations.reduce((s, d) => s + Number(d.value), 0),
    }),
    {}
  );
  console.log("Discounts by variant");
  console.table(discountsByVariant);

  return discountsByVariant;
};

function parseOrderInfoFromNotes(note_attributes: any[], line_items: LineItem[]) {
    const paymentPlan = paymentPlanFromNotes(note_attributes);
    const discount_percentage = discountFromPaymentPlan(paymentPlan);
    const orderDetails = orderDetailsFromNotes(note_attributes);
    const quantitiesByVariant = summarizeQuantities(orderDetails);
    const discountsByVariant = variantDiscountMap(line_items);
    const primaryProduct = primaryProductFromNotes(note_attributes);
    return { quantitiesByVariant, discount_percentage, primaryProduct, discountsByVariant };
}

export default async function postProcessOrder({ request }: DataFunctionArgs) {
  try {
    const { admin } = await shopify.authenticate.admin(request);
    async function graphql<T extends MaybeUserError>(
      query: string,
      variables: any
    ): Promise<T> {
      const response = await admin.graphql(query, { variables });
      if (!response.ok) {
        throw response;
      }

      const result = (await response.json()) as T;
      if (result?.userErrors) {
        throw new Response(JSON.stringify(result), {
          status: 400,
        });
      }
      return result;
    }

    const order = (await request.json()) as OrderCreatePayload;
    const { id: orderId, note_attributes, line_items, discount_codes } = order;
    checkIsProcessed(note_attributes, orderId);
    const { quantitiesByVariant, discount_percentage, primaryProduct } = parseOrderInfoFromNotes(note_attributes, line_items);

    await (async function processAsync() {
      const logLabel = `Processing order ${orderId}`;
      try {
        console.time(logLabel);
        //begin edit
        const beginData = await graphql<Mutation["orderEditBegin"]>(
          BEGIN_EDIT_MUTATION,
          { orderId: shopifyId(orderId, "Order") }
        );
        const lines = beginData?.calculatedOrder?.lineItems?.edges.map(
          ({ node }) => node
        );
        let calculatedOrderId = beginData?.calculatedOrder?.id;
        // delete all lines
        // by setting quantity to zero
        console.timeLog(
          logLabel,
          `Started order edit, calculated id: ${calculatedOrderId}`
        );
        console.timeLog(logLabel, `Deleting existing lines to be recreated`);
        for (const { id } of lines ?? []) {
          await graphql<Mutation["orderEditSetQuantity"]>(
            EDIT_QUANTITY_MUTATION,
            {
              id: calculatedOrderId,
              lineitemId: id,
              quantity: 0,
            }
          );

          console.timeLog(logLabel, `Line '${id}' has been deleted`);
        }
        console.timeLog(logLabel, `Started recreating lines`);
        for (const [variant, quantity] of Object.entries(quantitiesByVariant)) {
            console.timeLog(logLabel, `Creating line for variant ${variant}`);
          const {
            calculatedLineItem: { id: lineItemId },
          } = await graphql<OrderAddVariantResponse>(ADD_VARIANT_MUTATION, {
            id: calculatedOrderId,
            variantId: shopifyId(Number(variant), "ProductVariant"),
            quantity,
          }).then((r) => r ?? {});
          await graphql<OrderSetQuantity>(ADD_DISCOUNT_MUTATION, {
            discount_percentage,
            id: calculatedOrderId,
            lineItemId,
            discountDescription: "Payment Plan",
          });
          await graphql<OrderSetQuantity>(ADD_DISCOUNT_MUTATION, {
            discount_percentage,
            id: calculatedOrderId,
            lineItemId,
            discountDescription: "Payment Plan",
          });

          console.timeLog(logLabel, `succesfully created ${lineItemId}`);

          // adding existing discount code with their amount to the line of the primary product
          if (variant === String(primaryProduct.variant)) {
            console.timeLog(logLabel, `Reapplying code discounts`);
            for (const { code: description, amount, type } of discount_codes) {
              const discount =
                type === "fixed_amount"
                  ? {
                      description,
                      fixedValue: { amount, currencyCode: CurrencyCode.Usd },
                    }
                  : { description, percentValue: amount };
              await graphql<OrderSetQuantity>(ADD_DISCOUNT_MUTATION, {
                discount,
                id: calculatedOrderId,
                lineItemId,
              });
              console.timeLog(logLabel, discount);
            }
          }

          // TODO: Add discounts by variant

          // Commit
          console.timeLog(logLabel, 'Commiting order');
          await graphql<Mutation["orderEditCommit"]>(COMMIT_ORDER_MUTATION, {
            calculatedOrderId,
          });

          console.timeEnd(logLabel);
        }
      } catch (e) {
        console.error(JSON.stringify(e));
      }
    })();

    return new Response(
        "Order processed",
        { status: 200 }
    );
  } catch (e) {
    console.error(JSON.stringify(e));
  }

  return null;
}


