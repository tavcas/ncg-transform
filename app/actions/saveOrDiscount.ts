import { json } from "@remix-run/node";
import { DiscountMethod } from "@shopify/discount-app-components";
import shopify from "../shopify.server";

export const action = async ({ params, request }) => {
    const { functionId } = params;
    const { admin } = await shopify.authenticate.admin(request);
    const formData = await request.formData();
    const {
      title,
      method,
      code,
      combinesWith,
      usageLimit,
      appliesOncePerCustomer,
      startsAt,
      endsAt,
      configuration,
    } = JSON.parse(formData.get("discount"));
  
    const baseDiscount = {
      functionId,
      title,
      combinesWith,
      startsAt: new Date(startsAt),
      endsAt: endsAt && new Date(endsAt),
    };
  
    const metafields = [
      {
        namespace: "$app:paymentplan-discount",
        key: "value",
        type: "json",
        value: JSON.stringify(configuration),
      },
    ];
  
    if (method === DiscountMethod.Code) {
      const baseCodeDiscount = {
        ...baseDiscount,
        title: code,
        code,
        usageLimit,
        appliesOncePerCustomer,
      };
  
      const response = await admin.graphql(
        `#graphql
            mutation CreateCodeDiscount($discount: DiscountCodeAppInput!) {
              discountCreate: discountCodeAppCreate(codeAppDiscount: $discount) {
                codeAppDiscount{
                  discountId
                }
                userErrors {
                  code
                  message
                  field
                }
              }
            }`,
        {
          variables: {
            discount: {
              ...baseCodeDiscount,
              metafields,
            },
          },
        },
      );
  
      const responseJson = await response.json();
  
      const errors = responseJson.data.discountCreate?.userErrors;
      const discount = responseJson.data.discountCreate?.codeAppDiscount;
      return json({ errors, discount: { ...discount, functionId } });
    } else {
      const response = await admin.graphql(
        `#graphql
            mutation CreateAutomaticDiscount($discount: DiscountAutomaticAppInput!) {
              discountCreate: discountAutomaticAppCreate(automaticAppDiscount: $discount) {
                automaticAppDiscount {
                  discountId
                }
                userErrors {
                  code
                  message
                  field
                }
              }
            }`,
        {
          variables: {
            discount: {
              ...baseDiscount,
              metafields,
            },
          },
        },
      );
  
      const responseJson = await response.json();
      const errors = responseJson.data.discountCreate?.userErrors;
      return json({ errors });
    }
  };