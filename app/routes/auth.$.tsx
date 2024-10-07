import type { LoaderFunctionArgs} from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server.js";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { cors } = await authenticate.admin(request);
  return null;
}
