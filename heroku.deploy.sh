
heroku config:set --app=ncg-transform \
 SHOPIFY_API_KEY=6e776e5c13cd8cb0aa631f32d1bfc539 \
 SHOPIFY_CART_TRANSFORMER_ID=7a215176-69e4-43d9-9e89-2ef1f1d8162d \
 SHOPIFY_ORDER_DISCOUNTS_ID=9aa45dea-6ad8-4644-949f-be4e9910bb1b \
 SHOPIFY_API_SECRET=172a88f9de3feade26607860e63e7e08 \
 SCOPES=read_products,write_cart_transforms,write_discounts,write_products \
 SHOPIFY_CHECKOUT_UI_ID=c6b1433a-5908-4077-8d62-9b23db356dc5 \
 SHOPIFY_APP_URL=https://ncg-transform-916f30131d4e.herokuapp.com/ \
 HOST=https://ncg-transform-916f30131d4e.herokuapp.com/ \
\

heroku container:login
heroku container:push  web  --app=ncg-transform
heroku container:release web  --app=ncg-transform