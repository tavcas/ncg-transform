import { json, Response } from "@remix-run/node";
import type { DataFunctionArgs } from "@remix-run/node";
import { NEW_ID } from "../constants";
import shopify from "../shopify.server";
import type { DiscountConfigurationInput, DiscountInput, DiscountRequirementsInput } from "../types";
import { DiscountMethod } from "@shopify/discount-app-components";
import { QUERY_DISCOUNT_ID } from "../graphql";


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
            discountMethod: foundDiscount.codeCount >= 0 ? DiscountMethod.Code : DiscountMethod.Automatic,
            combinesWith: foundDiscount.combinesWith,
            status: foundDiscount.status,
            usageCount: foundDiscount.asyncUsageCount,
            usageLimit: "",
            appliesOncePerCustomer: false,
            
        };
        return json({ functionId, discount, id });
    }
    return json({ functionId, discount: {}, id });
}
