import { json, Response } from "@remix-run/node";
import type { DataFunctionArgs } from "@remix-run/node";
import { NEW_ID } from "../constants";
import shopify from "../shopify.server";
import type { DiscountConfigurationInput, DiscountInput, DiscountRequirementsInput } from "../types";
import { DiscountMethod } from "@shopify/discount-app-components";

const QUERY_DISCOUNT_ID = `#graphql
query orderDetails($query:String) {
    discountNodes(first: 1, query: $query) {
        edges { node {
            discount {
                ...on DiscountAutomaticApp {
                    title
                    combinesWith {
                        orderDiscounts
                        productDiscounts
                        shippingDiscounts
                    }
                    asyncUsageCount
                    startsAt
                    endsAt
                    status

                }
                ...on DiscountCodeApp {
                    title
                    combinesWith {
                        orderDiscounts
                        productDiscounts
                        shippingDiscounts
                    }
                    asyncUsageCount
                    startsAt
                    endsAt
                    status
                }
            } 
            configuration: metafield(namespace: "$app:paymentplan-discount", key: "value") { value }
            requirements: metafield(namespace: "$app:paymentplan-discount", key: "requirements") { value }
        } }
    }
}`;


export default async function queryOrderDiscount({ params, request }: DataFunctionArgs) { 
    const { id, functionId } = params;
    const { admin } = await shopify.authenticate.admin(request);
    if(id !== NEW_ID) {
        const response = await admin.graphql(QUERY_DISCOUNT_ID, { variables: { query: `id:${id}`}});
        const responseJson = await response.json();
        if(responseJson.data.discountNodes.edges.length === 0) {
            return new Response(null, {
                status: 404
            });
        }
        const foundDiscount = responseJson.data.discountNodes.edges[0].node.discount;
        const configuration = responseJson.data.discountNodes.edges[0].node.configuration.value;
        const requirements = responseJson.data.discountNodes.edges[0].node.requirements.value;

        const discount: DiscountInput = {
            discountTitle: foundDiscount.title,
            discountCode: foundDiscount.title,
            configuration: JSON.parse(configuration) as DiscountConfigurationInput,
            requirements: JSON.parse(requirements) as DiscountRequirementsInput,
            startDate: foundDiscount.startAt,
            endDate: foundDiscount.endsAt,
            discountMethod: foundDiscount.code ? DiscountMethod.Code : DiscountMethod.Automatic,
            combinesWith: foundDiscount.combinesWith,
            status: foundDiscount.status,
            usageCount: foundDiscount.asyncUsageCount,
            usageLimit: "",
            appliesOncePerCustomer: false,
            
        };
        return json({ functionId, discount });
    }
    return json({ functionId, discount: {} });
}
