import type { DataFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server.js";

export async function loader({ request }: DataFunctionArgs) {
  await authenticate.admin(request);
  return null;
}
