heroku container:login
heroku container:push  web  --app=ncg-transform-dev
heroku container:release web  --app=ncg-transform-dev
heroku config:set --app=ncg-transform-dev \
 SHOPIFY_API_KEY=952fc59953bdc2206b9ead351b810388 \
 SHOPIFY_CART_TRANSFORMER_ID=7a215176-69e4-43d9-9e89-2ef1f1d8162d \
 SHOPIFY_ORDER_DISCOUNTS_ID=9aa45dea-6ad8-4644-949f-be4e9910bb1b \
 SHOPIFY_API_SECRET=e9947e440806bbcb2522907e620e2458 \
 SCOPES=read_products,write_cart_transforms,write_discounts,write_products \
 SHOPIFY_CHECKOUT_UI_ID=c6b1433a-5908-4077-8d62-9b23db356dc5 \
 SHOPIFY_APP_URL=https://ncg-transform-dev-874ed72e91b8.herokuapp.com \
\

