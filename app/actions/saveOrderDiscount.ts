import { json, redirect } from "@remix-run/node";
import type { DataFunctionArgs } from "@remix-run/node";
import { DiscountMethod } from "@shopify/discount-app-components";
import shopify from "../shopify.server";
import { NEW_ID } from "../constants";
import { redirectDocument } from "@remix-run/react";

const CODE_DISCOUNT_UPDATE = `#graphql
            mutation UpdateCodeDiscount($discount: DiscountCodeAppInput!, $id: ID!) {
              discount: discountCodeAppUpdate(codeAppDiscount: $discount, id: $id) {
                codeAppDiscount{
                  discountId
                  appDiscountType {
                      appBridge {
                        detailsPath
                      }
                    }
                }
                userErrors {
                  code
                  message
                  field
                }
              }
            }`;
const AUTOMATIC_DISCOUNT_UPDATE = `#graphql
            mutation UpdateAutomaticDiscount($discount: DiscountAutomaticAppInput!, $id: ID!) {
              discount: discountAutomaticAppUpdate(automaticAppDiscount: $discount, id: $id) {
                automaticAppDiscount {
                  discountId
                  appDiscountType {
                      appBridge {
                        detailsPath
                      }
                    }
                }
                userErrors {
                  code
                  message
                  field
                }
              }
            }`;

const CODE_DISCOUNT_CREATE = `#graphql
            mutation CreateCodeDiscount($discount: DiscountCodeAppInput!) {
              discount: discountCodeAppCreate(codeAppDiscount: $discount) {
                codeAppDiscount{
                  discountId
                  appDiscountType {
                      appBridge {
                        detailsPath
                      }
                  }
                }
                userErrors {
                  code
                  message
                  field
                }
              }
            }`;
const AUTOMATIC_DISCOUNT_CREATE = `#graphql
            mutation CreateAutomaticDiscount($discount: DiscountAutomaticAppInput!) {
              discount: discountAutomaticAppCreate(automaticAppDiscount: $discount) {
                automaticAppDiscount {
                  discountId
                  appDiscountType {
                      appBridge {
                        detailsPath
                      }
                  }
                }
                userErrors {
                  code
                  message
                  field
                }
              }
            }`;
export default async function saveOrderDiscount({ params, request }: DataFunctionArgs){
    const { functionId, id } = params;
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
      requirements,
    } = JSON.parse(formData.get("discount")?.toString() ?? "");
  
    const baseDiscount = {
      title,
      functionId,
      combinesWith,
      startsAt: new Date(startsAt),
      endsAt: endsAt ? new Date(endsAt) : null,
    };
  
    const metafields = [
      {
        namespace: "$app:paymentplan-discount",
        key: "value",
        type: "json",
        value: JSON.stringify(configuration),
      },
      {
        namespace: "$app:paymentplan-discount",
        key: "requirements",
        type: "json",
        value: JSON.stringify(requirements)
      }
    ];
  
    if (method === DiscountMethod.Code) {
      const baseCodeDiscount = {
        ...baseDiscount,
        title: code,
        code,
        usageLimit: usageLimit > 0 ? usageLimit : null,
        appliesOncePerCustomer,
      };

      const input: Parameters<typeof admin.graphql> = (id === NEW_ID ? [CODE_DISCOUNT_CREATE, {
        variables: {
          discount: {
            ...baseCodeDiscount,
            metafields,
          },
        },
      }]
    : [CODE_DISCOUNT_UPDATE, {
      variables: {
        discount: {
          ...baseCodeDiscount,
          metafields,
        },
        id: `gid://shopify/DiscountCodeNode/${id}`
      },
    }]);
  
      const response = await admin.graphql(...input);
  
      const responseJson = await response.json();
  
      const errors = responseJson.data.discount?.userErrors;
      const discount = responseJson.data.discount?.codeAppDiscount;
      if(errors.length > 0) {
        return json({ errors, discount: { ...baseCodeDiscount, ...discount, functionId, metafields } });
      }

      return redirectDocument(discount.appDiscountType.appBridge.detailsPath.replaceAll(":functionId", functionId).replaceAll(":id", discount.discountId.split("/").pop()))
      
    } else {
      const input: Parameters<typeof admin.graphql> = (id === NEW_ID ? [AUTOMATIC_DISCOUNT_CREATE, {
        variables: {
          discount: {
            ...baseDiscount,
            metafields,
          },
        },
      }]
    : [AUTOMATIC_DISCOUNT_UPDATE, {
      variables: {
        discount: {
          ...baseDiscount,
          metafields,
        },
        id: `gid://shopify/DiscountAutomaticNode/${id}`
      },
    }]);
  
      const response = await admin.graphql(...input);
      const responseJson = await response.json();
      const errors = responseJson.data.discount?.userErrors;
      const discount = responseJson.data.discount?.automaticAppDiscount;
      if(errors.length > 0) {
        return json({ errors, discount: { ...baseDiscount, ...discount, functionId, metafields } });
      }
      return redirectDocument(discount.appDiscountType.appBridge.detailsPath.replaceAll(":functionId", functionId).replaceAll(":id", discount.discountId.split("/").pop()) )
    }
  };