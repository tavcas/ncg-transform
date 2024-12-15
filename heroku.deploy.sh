
# heroku config:set --app=ncg-transform \
#  SHOPIFY_API_KEY=6e776e5c13cd8cb0aa631f32d1bfc539 \
#  SHOPIFY_CART_TRANSFORMER_ID=7a215176-69e4-43d9-9e89-2ef1f1d8162d \
#  SHOPIFY_ORDER_DISCOUNTS_ID=9aa45dea-6ad8-4644-949f-be4e9910bb1b \
#  SHOPIFY_API_SECRET=172a88f9de3feade26607860e63e7e08 \
#  SCOPES=read_marketplace_orders,write_marketplace_orders,write_orders,read_orders,read_products,write_products,write_cart_transforms,write_discounts,read_discounts,write_discounts_allocator_functions \
#  SHOPIFY_CHECKOUT_UI_ID=c6b1433a-5908-4077-8d62-9b23db356dc5 \
#  SHOPIFY_APP_URL=https://ncg-transform-916f30131d4e.herokuapp.com/ \
#  HOST=https://ncg-transform-916f30131d4e.herokuapp.com/ \
# \


# heroku container:login
# heroku container:push  web  --app=ncg-transform
# heroku container:release web  --app=ncg-transform



heroku config:set --app=$SHOPIFY_APP_NAME \
 SHOPIFY_API_KEY=$SHOPIFY_API_KEY \
 SHOPIFY_CART_TRANSFORMER_ID=$SHOPIFY_CART_TRANSFORMER_ID \
 SHOPIFY_ORDER_DISCOUNTS_ID=$SHOPIFY_ORDER_DISCOUNTS_ID \
 SHOPIFY_API_SECRET=$SHOPIFY_API_SECRET \
 SCOPES=$SCOPES \
 SHOPIFY_CHECKOUT_UI_ID=$SHOPIFY_CHECKOUT_UI_ID \
 SHOPIFY_APP_URL=$SHOPIFY_APP_URL \
 SHOPIFY_CART_TRANSFORMER_TS_ID=$SHOPIFY_CART_TRANSFORMER_TS_ID \
\


heroku container:login
heroku container:push  web  --app=$SHOPIFY_APP_NAME
heroku container:release web  --app=$SHOPIFY_APP_NAME