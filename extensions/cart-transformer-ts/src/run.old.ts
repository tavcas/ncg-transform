/*
This is a transcription of the rust code in the old cart transformer
Meant to be used only by reference
*/

import type {
  RunInput,
  FunctionRunResult,
  CartOperation,
  CartLineInput,
  PriceAdjustment,
  MergeOperation,
  ProductVariant,
  ExpandedItem,
  ExpandOperation
} from "../generated/api";

type ID = string;
type Cart = RunInput["cart"];
type Merchandise = RunInput["cart"]["lines"][0]["merchandise"];

type ComponentParent = {
  id: ID;
  component_reference: string[];
  component_quantities: number[];
  price_adjustment: number | null;
}

type ComponentParentMetafieldReference = {
  value: string[]
}

type ComponentParentMetafieldQuantities = {
  value: number[]
}

type ComponentParentMetafieldPriceAdjustment = {
  value: number;
}

type ComponentParentMetafield = {
  id: ID,
  component_reference: ComponentParentMetafieldReference;
  component_quantities: ComponentParentMetafieldQuantities;
  price_adjustment: ComponentParentMetafieldPriceAdjustment | null;
}

export enum PaymentPlan {
  None = "",
  Monthly = "Monthly",
  BiMonthly = "Bi-Monthly",
  EveryTwoWeeks = "Every Two Weeks"
}

const NO_CHANGES: FunctionRunResult = {
  operations: [],
};

const monthly_price: PriceAdjustment = {
  percentageDecrease: {
    value: "88.8888"
  }
}

const bi_weekly_price: PriceAdjustment = {
  percentageDecrease: {
    value: "94.4444"
  }
}

function get_component_parents(variant: Merchandise): ComponentParent[] {
  const result: ComponentParent[] = [];
  const component_parent = variant.__typename === "ProductVariant" && (variant.component_parents?.value ?? "");
  const value = JSON.parse(component_parent ? component_parent: "[]") as ComponentParentMetafield[];
  for(const parent_definition of value) {
    const price = parent_definition.price_adjustment?.value ?? null;
    result.push({
      id: parent_definition.id,
      component_reference: ["44201767567526"],
      component_quantities: [1], // Assuming quantity is 1
      price_adjustment: 50.0,  // You can adjust this as necessary
    });
  }
  return result;
}

function get_component_quantities(variant: Merchandise): number[] {
  return [1];
}

function get_component_references_bi(variant: Merchandise): ID[] {
  return ["gid://shopify/ProductVariant/46250760110389"]
}

function get_component_references_mo(variant: Merchandise): ID[] {
  return ["gid://shopify/ProductVariant/46499859726645"]
}



function get_components_in_cart(cart: Cart, definition: ComponentParent): [CartLineInput[], number] {
  const line_result: CartLineInput[] = [];
  const max_available_component: number[] = [];
  for(const [index, reference] of definition.component_reference.entries()) {
    const quantity = definition.component_quantities[index];
    for(const line of cart.lines) {
       if(line.merchandise 
        && line.merchandise.__typename === "ProductVariant" 
        && line.merchandise.id === reference 
        && line.quantity >= quantity) {
          line_result.push({
            cartLineId: line.id,
            quantity
          })
       }
       const maximum_available = quantity > 0 
       ? line.quantity / quantity
       : 0;
       max_available_component.push(maximum_available);
    }
  }

  const parent_variant_quantity = max_available_component.reduce((p, c) => Math.min(p, c), 0);
  return [line_result, parent_variant_quantity];
}

function get_merge_parent_definitions(cart: Cart): ComponentParent[] {
  const merge_parent_definitions: ComponentParent[] = [];
  for(const line of cart.lines) {
    const payment_plan = line.payment_plan?.value ?? "";
    const price_adjustment = (function() {
      switch(payment_plan) {
        case PaymentPlan.Monthly:
          return 88.8888;
        case PaymentPlan.BiMonthly:
        case PaymentPlan.EveryTwoWeeks:
          return 94.4444;
        default: 
          return null;
      }
    })();

    if(price_adjustment) {
      merge_parent_definitions.push({
        id: line.id,
        component_reference: ["44201767567526"],
        component_quantities: [1],
        price_adjustment
      })
    }

    if(line.merchandise && line.merchandise.__typename === "ProductVariant" && payment_plan) {
      merge_parent_definitions.push({
        id: line.id,
        component_reference: ["gid://shopify/ProductVariant/44201767567526"],
        component_quantities: [1],
        price_adjustment: 50
      })
    }
  }
  return merge_parent_definitions;
}

function get_merge_cart_operations(cart: Cart): CartOperation[] {
  const merge_parent_defintions = get_merge_parent_definitions(cart);
  const result: CartOperation[] = [];
  for(const definition of merge_parent_defintions) {

    const [components_in_cart, parent_variant_quantity] = get_components_in_cart(cart, definition);
    if(components_in_cart.length === definition.component_reference.length) {
      const cartLines = components_in_cart.map(component => ({
        cartLineId: component.cartLineId,
        quantity: component.quantity + parent_variant_quantity
       } as CartLineInput));

       let price: PriceAdjustment | null = definition.price_adjustment 
       ? { percentageDecrease: {
        value: definition.price_adjustment
       }}
       : null;

       const merge: MergeOperation = {
        parentVariantId: definition.id,
        title: null,
        cartLines,
        image: null,
        price
       }

       result.push({ merge });

    }
  }

  return result;
}

function get_expand_cart_operations(cart: Cart): CartOperation[] {
  const result: CartOperation[] = [];
  for(const line of cart.lines) {
    const variant = (line.merchandise as ProductVariant)?.id ?? null;
    const payment = line.payment_plan?.value ?? null;
    if(![variant, payment].every(Boolean)) {
      continue;
    }

    const [component_references, price] = (function() {
      switch(payment) {
        case PaymentPlan.Monthly:
          return [get_component_references_mo(line.merchandise), monthly_price];
        case PaymentPlan.BiMonthly:
        case PaymentPlan.EveryTwoWeeks:
          return [get_component_references_bi(line.merchandise), bi_weekly_price];
        default:
        return [[], undefined];
      }
    })();

    if(component_references.length === 0) {
      continue;
    }

    const component_quantities = get_component_quantities(line.merchandise);
    const expandedCartItems: ExpandedItem[] = component_references.map((merchandiseId, index) => ({
      merchandiseId,
      quantity: component_quantities[index]
    }))

    const expand: ExpandOperation = {
      cartLineId: line.id,
      price,
      expandedCartItems
    }

    result.push({ expand })

  }
  return result;
}

export function run(input: RunInput): FunctionRunResult {
  const operations = get_merge_cart_operations(input.cart);
  operations.push(...get_expand_cart_operations(input.cart));
  return { operations };
};