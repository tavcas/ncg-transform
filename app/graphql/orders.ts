export const BEGIN_EDIT_MUTATION = `#graphql
mutation beginEdit($orderId: ID!){
      orderEditBegin(id: $orderId){
         calculatedOrder{
           id
           lineItems(first: 50){
            edges{
              node{
                id
                quantity
              }
            }
          }
         }
       }
     }`;

export const END_EDIT_MUTATION = `#graphql
mutation endEdit($id: ID!) {  
    orderEditCommit(
        id:$id, 
        notifyCustomer: false, 
        staffNote:"For pricing plan purposes"
    ) {
        order {
            id
        }
        userErrors {
            field
            message
        }
    }
}
`;

export const ADD_VARIANT_MUTATION = `#graphql
mutation addVariantsToOrder($id: ID!, $variantId: ID!, $quantity: Int!) {
    orderEditAddVariant(id: $id, variantId: $variantId, quantity: $quantity) {
        calculatedOrder {
            id
        }
        calculatedLineItem {
            id
        }
        userErrors {
            field
            message
        }
    }
}`;

export const ADD_DISCOUNT_MUTATION = `#graphql
mutation applyDiscountToLineItems($orderId: ID!, $lineItemId: ID!, $discount_percentage: Float!, $discountDescription: String) {
    orderEditAddLineItemDiscount(
        id: $orderId, 
        lineItemId: $lineItemId, 
        discount: { 
            fixedValue: { currencyCode: USD, amount: $discountAmount } 
            description: $discountDescription 
        }) {
            calculatedOrder {
                id
            }
            userErrors{
                field
                message
            }
        }
}
`;

export const EDIT_QUANTITY_MUTATION = `#graphql
mutation orderEditSetQuantity($id: ID!, $lineItemId: ID!, $quantity: Int!) {
  orderEditSetQuantity(id: $id, lineItemId: $lineItemId, quantity: $quantity) {
    calculatedLineItem {
      id
      quantity
    }
    calculatedOrder {
      id
    }
    userErrors {
      field
      message
    }
  }
}
`;