export const REGISTER_ORDER_DISCOUNT = `#graphql
mutation discountApp($functionExtensionId: String!) {
    discountCodeAppCreate(
        codeAppDiscount: {
            functionId: $functionExtensionId
        }
    ) {
        codeAppDiscount {
            functionid
        }
    }
}`

export const REGISTER_CART_TRANSFORMER = `#graphql
mutation cartTransform($functionExtensionId: String!) {
    cartTransformCreate(
        functionId: $functionExtensionId
        blockOnFailure: false
    ) {
        cartTransform {
            functionId
            blockOnFailure
        }
        userErrors {
            field
            message
        }
    }
}`

export const REGISTER_APP_FUNCTIONS = `#graphql
mutation registerAppFunctions($orderDiscountId: String, $cartTransformerId: String) {
    cart: cartTransformCreate(
        functionId: $cartTransformerId
        blockOnFailure: false
    ) {
        cartTransform {
            functionId
            blockOnFailure
        }
        userErrors {
            field
            message
        }
    }

    discount: discountCodeAppCreate(
        codeAppDiscount: {
            functionId: $orderDiscountId
        }
    ) {
        codeAppDiscount {
            discountId
        }
        userErrors {
            field
            message
        }
    }

}`