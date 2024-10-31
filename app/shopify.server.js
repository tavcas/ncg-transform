import "@shopify/shopify-app-remix/adapters/node";
import {
  AppDistribution,
  DeliveryMethod,
  shopifyApp,
  LATEST_API_VERSION,
} from "@shopify/shopify-app-remix";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { restResources } from "@shopify/shopify-api/rest/admin/2023-07";
import { REGISTER_APP_FUNCTIONS } from "app/graphql/app";

import prisma from "./db.server.js";

async function registerFunctions(args) {
  const { SHOPIFY_CART_TRANSFORMER_ID, SHOPIFY_ORDER_DISCOUNTS_ID } = process.env;
  const response = await args.admin.graphql(REGISTER_APP_FUNCTIONS, {
    variables: {
      orderDiscountId: `${SHOPIFY_ORDER_DISCOUNTS_ID}`,
      cartTransformerId: `${SHOPIFY_CART_TRANSFORMER_ID}`
    }
  });
  if (response.ok) {
    const result = await response.json();
    if (result.data.cart.userErrors?.length > 0) {
      console.error(JSON.stringify(result.data.cart.userErrors));
    }
  } else {
    console.error(await response.text());
  }
}

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: LATEST_API_VERSION,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  restResources,
  webhooks: {
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
    ORDERS_CREATE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    }
  },
  hooks: {
    afterAuth: async (args) => {
      console.log('afterAuth hook');
      await shopify.registerWebhooks({ session: args.session });
      await registerFunctions(args);
    },
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = LATEST_API_VERSION;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;


