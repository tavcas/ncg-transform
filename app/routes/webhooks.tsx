import { authenticate } from "../shopify.server.js";
import db from "../db.server.js";
import type { DataFunctionArgs } from "@remix-run/node";
import type { OrderCreatePayload } from "../types/orders.js";
import postProcessOrder from "../actions/postprocessOrder.js";


export const action = async (args: DataFunctionArgs) => {
  const { topic, shop, session } = await authenticate.webhook(args.request);
  switch (topic) {
    case "APP_UNINSTALLED":
      if (session) {
        await db.session.deleteMany({ where: { shop } });
      }
      break;
    case "ORDERS_CREATE":
      return await postProcessOrder(args);
    case "CUSTOMERS_DATA_REQUEST":
    case "CUSTOMERS_REDACT":
    case "SHOP_REDACT":
    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }

  throw new Response();
};
