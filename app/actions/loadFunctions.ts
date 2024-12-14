import type { DataFunctionArgs } from "@remix-run/node";
import { json, Response } from "@remix-run/node";
import shopify from "../shopify.server";
import { CART_TRANSFORMER_CREATE_MUTATION, CART_TRANSFORMER_SWITCH_MUTATION, QUERY_FUNCTIONS } from "../graphql/functions";

export default async function loadFunctions({ request }: DataFunctionArgs) {
    try {
      console.log("loadFunctions start");
      const { admin } = await shopify.authenticate.admin(request);
      const { SHOPIFY_CART_TRANSFORMER_TS_ID, SHOPIFY_CART_TRANSFORMER_ID } = process.env;
      console.log({ SHOPIFY_CART_TRANSFORMER_TS_ID, SHOPIFY_CART_TRANSFORMER_ID })
      const functionResponse = await admin.graphql(QUERY_FUNCTIONS);
      const functionData = await functionResponse.json();
      console.log(JSON.stringify(functionData, null, 2));
      const [transformer] = functionData.data.transformers.nodes.filter(c => [SHOPIFY_CART_TRANSFORMER_ID, SHOPIFY_CART_TRANSFORMER_TS_ID].includes(c.functionId));
      console.log(JSON.stringify({ transformer }, null, 2));
      if(transformer?.functionId === SHOPIFY_CART_TRANSFORMER_ID) {
            const switchResponse = await admin.graphql(CART_TRANSFORMER_SWITCH_MUTATION, {
                variables: {
                    cartTransformerId: transformer.id,
                    newFunctionId: SHOPIFY_CART_TRANSFORMER_TS_ID
                }
            
            });
            const switchData = await switchResponse.json();
            const errors = [
                ...switchData.data.switchCartTransformer.old.userErrors,
                ...switchData.data.switchCartTransformer.new.userErrors
            ];

            if(errors.length > 0) {
                throw  { errors, status: 500 };
            }
            console.log(switchData)
            return json("OK", { status: 200 });
      } else if(transformer?.functionId === SHOPIFY_CART_TRANSFORMER_TS_ID) {
            console.log("cart transformer already created");
            return json("OK", { status: 200 });

      } else {
        const createResponse = await admin.graphql(CART_TRANSFORMER_CREATE_MUTATION, {
            variables: {
                functionId: SHOPIFY_CART_TRANSFORMER_TS_ID
            }
        });
        const createData = await createResponse.json();
        if(createData.data.cartTransformCreate.userErrors.length > 0) {
            throw { 
                errors: createData.data.cartTransformCreate.userErrors, 
                status: 500 
            };
        }
        console.log(createData);
        return json("OK", { status: 200 });
      }
    } catch(e: any) {
        if('errors' in e) {
            console.error(e.errors);
            return json(e.errors, { status: 500 })
        } else if('message' in e) {
            console.error(e.message);
            return json(e.message, { status: 500})
        }
    }
    console.log("loadFunctions start");
}