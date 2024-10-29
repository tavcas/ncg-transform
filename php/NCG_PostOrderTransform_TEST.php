<?php
ini_set('display_errors', 'on');
error_reporting(E_ALL);
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header("Access-Control-Allow-Headers: X-Requested-With");
header('Content-Type: application/json; charset=utf-8');

require __DIR__.'/vendor/autoload.php';
use phpish\shopify;
require __DIR__.'/conf_ncg-test.php';

// File to store processed order IDs
$order_ids_file = __DIR__ . '/processed_orders.txt';

// capture webhook details
$json = file_get_contents('php://input');
$orders = json_decode($json, true);
$order_id = $orders['id'];


// Check if the order has been processed
if (file_exists($order_ids_file)) {
    $processed_orders = file_get_contents($order_ids_file);
    $processed_orders_array = explode("\n", $processed_orders);

    if (in_array($order_id, $processed_orders_array)) {
        // Order has been processed, exit the script
        exit("Order already processed: " . $order_id);
    }
}


// Print note attributes for debugging
$note_attributes = $orders['note_attributes'];
print_r($note_attributes);

// Define key variables for processing
$payment_plan = 0;
$discount_percentage = 0;
$note_attributes_size = sizeof($note_attributes);

// Determine payment plan based on order details
for ($x = 0; $x < $note_attributes_size; $x++) {
    $name = $note_attributes[$x]['name'];
    $value = $note_attributes[$x]['value'];

    if ($name == 'Payment Plan') {
        echo 'my payment plan value is ' . $value;
        if ($value == 'Monthly' || $value == 'Bi-Monthly' || $value == 'Every Two Weeks') {
            $payment_plan = 1;
            $discount_percentage = ($value == 'Monthly') ? 88.888888 : 94.444444;
        }
    }
}

// Continue with additional processing only if it's a payment plan order
if ($payment_plan == 1) {
    $SKU_array = [];
    for ($x = 0; $x < $note_attributes_size; $x++) {
        $name = $note_attributes[$x]['name'];
        $value = $note_attributes[$x]['value'];

        if ($name == 'Order Details') {
            // Decode the JSON string to an array
            $decodedArray = json_decode($value, true);

            // Check if decoding was successful and decodedArray is an array
            if (is_array($decodedArray)) {
                // Combine items with the same variant ID
                foreach ($decodedArray as $item) {
                    $variant = $item['variant'];
                    $quantity = (int) $item['quantity'];

                    if (isset($SKU_array[$variant])) {
                        $SKU_array[$variant]['quantity'] += $quantity;
                    } else {
                        $SKU_array[$variant] = $item;
                    }
                }
            }
        }
    }

    // Convert SKU_array values back to a sequential array
    $SKU_array = array_values($SKU_array);
    print_r($SKU_array);
    echo 'my payment plan value is ' . $payment_plan;

    $mutation = '{"query":"mutation beginEdit{'
        . '  orderEditBegin(id: \\"gid://shopify/Order/' . $order_id . '\\"){'
        . '     calculatedOrder{'
        . '       id'
        . '       lineItems(first: 50){'
        . '        edges{'
        . '          node{'
        . '            id'
        . '            quantity'
        . '          }'
        . '        }'
        . '      }'
        . '     }'
        . '   }'
        . ' }",'
        . '"variables":{}}';

    $curl = curl_init();

    curl_setopt_array($curl, array(
        CURLOPT_URL => SHOPIFY_LINK.'/admin/api/2023-07/graphql.json',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => '',
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 0,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => 'POST',
        CURLOPT_POSTFIELDS =>$mutation,
        CURLOPT_HTTPHEADER => array(
            'X-Shopify-Access-Token: '.SHOPIFY_ACCESS_TOKEN,
            'Content-Type: application/json',
            SHOPIFY_APP_API_KEY.':'.SHOPIFY_APP_PASSWORD
        ),
    ));

    $response = curl_exec($curl);
    echo $response;
    curl_close($curl);
    // Decode the JSON response
    $responseArray = json_decode($response, true);
    //print_r($responseArray);
    // Extract the calculated order ID string
    $calculatedOrderId = $responseArray['data']['orderEditBegin']['calculatedOrder']['id'];
    $lineItems = $responseArray['data']['orderEditBegin']['calculatedOrder']['lineItems']['edges'];
    // Use regex to extract just the numeric ID
    preg_match('/\d+$/', $calculatedOrderId, $matches);

    $numericID = $matches[0];

    // Before adding products to the order, we must remove the existing ones since they will not be right based on our cart transform function
    // Loop through each line item and send a separate request
    foreach ($lineItems as $item) {
        $mutation = <<<GRAPHQL
mutation orderEditSetQuantity(\$id: ID!, \$lineItemId: ID!, \$quantity: Int!) {
  orderEditSetQuantity(id: \$id, lineItemId: \$lineItemId, quantity: \$quantity) {
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
GRAPHQL;
        $lineItemId = $item['node']['id'];
        $quantity = 0; // Set the quantity to 0 to remove the item

        // Prepare the variables for this line item
        $variables = [
            'id' => $calculatedOrderId,
            'lineItemId' => $lineItemId,
            'quantity' => $quantity,
        ];
        // Convert the mutation and variables to JSON for the request
        $jsonData = json_encode(['query' => $mutation, 'variables' => $variables]);

        echo $jsonData;

        // Initialize a cURL session for the GraphQL endpoint
        $curl = curl_init();
        curl_setopt_array($curl, array(
            CURLOPT_URL => SHOPIFY_LINK.'/admin/api/2023-07/graphql.json',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'POST',
            CURLOPT_POSTFIELDS =>$jsonData,
            CURLOPT_HTTPHEADER => array(
                'X-Shopify-Access-Token: '.SHOPIFY_ACCESS_TOKEN,
                'Content-Type: application/json',
                SHOPIFY_APP_API_KEY.':'.SHOPIFY_APP_PASSWORD
            ),
        ));

        $response = curl_exec($curl);
        echo $response;
        curl_close($curl);
    }

    $mutationStart = "mutation addVariantsToOrder {\n";
    $mutationEnd = "}";
    $mutationBody = "";

    // Assume $numericID and $variant_array are available and populated
    for ($i = 0; $i < sizeof($SKU_array); $i++) {
        $mutationBody .= "  addVariant" . ($i+1) . ": orderEditAddVariant(\n";
        $mutationBody .= '    id: "gid://shopify/CalculatedOrder/' . $numericID . "\"\n";
        $mutationBody .= '    variantId: "gid://shopify/ProductVariant/' . $SKU_array[$i]['variant'] . "\"\n";
        $mutationBody .= "    quantity: ".$SKU_array[$i]['quantity']." \n  ) {\n";
        $mutationBody .= "    calculatedOrder {\n      id\n    }\n";
        $mutationBody .= "    calculatedLineItem {\n      id\n    }\n";
        $mutationBody .= "    userErrors {\n      field\n      message\n    }\n  }\n\n";
    }

    $completeMutation = "mutation addVariantsToOrder {\n" . $mutationBody . "}";
    $completeMutationJson = json_encode([
        "query" => $completeMutation
    ]);
    // echo $completeMutationJson;
    $curl = curl_init();

    curl_setopt_array($curl, array(
        CURLOPT_URL => SHOPIFY_LINK.'/admin/api/2023-07/graphql.json',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => '',
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 0,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => 'POST',
        CURLOPT_POSTFIELDS =>$completeMutationJson,
        CURLOPT_HTTPHEADER => array(
            'X-Shopify-Access-Token: '.SHOPIFY_ACCESS_TOKEN,
            'Content-Type: application/json',
            SHOPIFY_APP_API_KEY.':'.SHOPIFY_APP_PASSWORD
        ),
    ));

    $response = curl_exec($curl);
    echo $response;
    $response = json_decode($response, true); // Decode the JSON string
    curl_close($curl);
    echo $discount_percentage . ' is set to this discount';
    echo $discount_percentage . ' is set to this discount';
    $mutationBody = "mutation applyDiscountToLineItems {\n";
    
    // Ensure $response['data'] is set and iterate properly
    if (isset($response['data'])) {
        foreach ($response['data'] as $index => $variant) {
            // Construct the mutation name (like 'addDiscount1')
            $mutationName = str_replace("addVariant", "addDiscount", $index);
    
            if (isset($variant['calculatedOrder']) && isset($variant['calculatedLineItem'])) {
                $orderId = $variant['calculatedOrder']['id'];
                $lineItemId = $variant['calculatedLineItem']['id'];
    
                // Determine the numeric index from the mutation name
                $numericIndex = filter_var($index, FILTER_SANITIZE_NUMBER_INT) - 1;
    
                // Ensure $SKU_array[$numericIndex] is set and get the variant ID
                if (isset($SKU_array[$numericIndex]['variant'])) {
                    $variantId = str_replace('gid://shopify/ProductVariant/', '', $SKU_array[$numericIndex]['variant']);
    
                    // Fetch the variant price
                    $curl = curl_init();
                    curl_setopt_array($curl, array(
                        CURLOPT_URL => 'https://ncg-test-environment.myshopify.com/admin/api/2024-01/variants/' . $variantId . '.json',
                        CURLOPT_RETURNTRANSFER => true,
                        CURLOPT_ENCODING => '',
                        CURLOPT_MAXREDIRS => 10,
                        CURLOPT_TIMEOUT => 0,
                        CURLOPT_FOLLOWLOCATION => true,
                        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                        CURLOPT_CUSTOMREQUEST => 'GET',
                        CURLOPT_HTTPHEADER => array(
                            'X-Shopify-Access-Token: '.SHOPIFY_ACCESS_TOKEN,
                            'Content-Type: application/json',
                            SHOPIFY_APP_API_KEY.':'.SHOPIFY_APP_PASSWORD
                        ),
                    ));
    
                    $variantResponse = curl_exec($curl);
                    curl_close($curl);
    
                    $variantData = json_decode($variantResponse, true);
    
                    // Ensure the variant price is set
                    if (isset($variantData['variant']['price'])) {
                        $variantPrice = $variantData['variant']['price'];
    
                        // Calculate the fixed discount amount and round to two decimal places
                        $discountAmount = round(($variantPrice * $discount_percentage) / 100, 2);
    
                        // Prepare the mutation for the discount
                        $mutationBody .= "  {$mutationName}: orderEditAddLineItemDiscount(\n";
                        $mutationBody .= '    id: "' . $orderId . "\",\n";
                        $mutationBody .= '    lineItemId: "' . $lineItemId . "\",\n";
                        $mutationBody .= '    discount: { fixedValue: { amount: "' . $discountAmount . '", currencyCode: USD }, description: "Payment plan" }' . "\n";
                        $mutationBody .= "  ) {\n";
                        $mutationBody .= "    calculatedOrder {\n      id\n    }\n";
                        $mutationBody .= "    userErrors {\n      message\n    }\n  }\n\n";
                    } else {
                        echo "Variant price not found for variant ID: $variantId\n";
                    }
                } else {
                    echo "Variant key not found for numeric index: $numericIndex\n";
                }
            } else {
                echo "Calculated order or line item not found for index: $index\n";
            }
        }
    } else {
        echo "Response data not found\n";
    }
    
    $mutationBody .= "}"; // close the mutation block
    
    $query = [
        'query' => $mutationBody
    ];
    
    $query_json = json_encode($query, true);
    
    // Execute the mutation
    $curl = curl_init();
    
    curl_setopt_array($curl, array(
        CURLOPT_URL => SHOPIFY_LINK.'/admin/api/2024-01/graphql.json',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => '',
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 0,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => 'POST',
        CURLOPT_POSTFIELDS => $query_json,
        CURLOPT_HTTPHEADER => array(
            'X-Shopify-Access-Token: '.SHOPIFY_ACCESS_TOKEN,
            'Content-Type: application/json',
            SHOPIFY_APP_API_KEY.':'.SHOPIFY_APP_PASSWORD
        ),
    ));
    
    $response = curl_exec($curl);
    
    curl_close($curl);
    echo $response;
    
    


    $curl = curl_init();

    curl_setopt_array($curl, array(
        CURLOPT_URL => SHOPIFY_LINK.'/admin/api/2023-07/graphql.json',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => '',
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 0,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => 'POST',
        CURLOPT_POSTFIELDS =>'{"query":"mutation commitEdit {\\n  orderEditCommit(id: \\"gid://shopify/CalculatedOrder/'.$numericID.'\\", notifyCustomer: false, staffNote: \\"For pricing plan purposes\\") {\\n    order {\\n      id\\n    }\\n    userErrors {\\n      field\\n      message\\n    }\\n  }\\n}","variables":{}}',
        CURLOPT_HTTPHEADER => array(
            'X-Shopify-Access-Token: '.SHOPIFY_ACCESS_TOKEN,
            'Content-Type: application/json',
            SHOPIFY_APP_API_KEY.':'.SHOPIFY_APP_PASSWORD
        ),
    ));

    $response = curl_exec($curl);

    curl_close($curl);
    echo $response;

    file_put_contents($order_ids_file, $order_id . "\n", FILE_APPEND);
} else {
    // payment plan is cash so we do nothing
}
?>
