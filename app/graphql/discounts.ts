export const QUERY_DISCOUNT_ID = `#graphql
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
                    codesCount {
                        count
                    }
                    codes(first: 100) {
                      nodes {
                        id
                        code
                        asyncUsageCount
                      }
                    }
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
            configuration: metafield(namespace: "paymentplan-discount", key: "value") {
               id
               value 
            }
            requirements: metafield(namespace: "paymentplan-discount", key: "requirements") {
              id
               value 
            }
        } }
    }
}`;

export const CODE_DISCOUNT_UPDATE = `#graphql
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
export const AUTOMATIC_DISCOUNT_UPDATE = `#graphql
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

export const CODE_DISCOUNT_CREATE = `#graphql
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
export const AUTOMATIC_DISCOUNT_CREATE = `#graphql
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