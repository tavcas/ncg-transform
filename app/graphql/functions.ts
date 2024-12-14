export const CART_TRANSFORMER_SWITCH_MUTATION  = `#graphql
mutation switchCartTransformer($cartTransformerId: ID!, $newFunctionId: String!) {
    old: cartTransformDelete(id: $cartTransformerId) {
        deletedId
        userErrors {
            field
            message
        }
    }
    new: cartTransformCreate(functionId: $newFunctionId) {
        cartTransform {
            id
            functionId
        }
        userErrors {
            field
            message
        }
    }
}`;

export const CART_TRANSFORMER_CREATE_MUTATION = `#graphql
mutation createTransformer($functionId: String!) {
    cartTransformCreate(functionId: $functionId) {
        cartTransform {
            id
            functionId
        }
        userErrors {
            field
            message
        }
    }
}
`;

export const QUERY_FUNCTIONS = `#graphql
query {
  transformers: cartTransforms(first: 25) {
    nodes {
        id
        functionId
    }
  }

}`;