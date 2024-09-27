/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  reactExtension,
  useApi,
  AdminAction,
  BlockStack,
  Text,
  Button,
} from '@shopify/ui-extensions-react/admin';
import { useEffect, useState } from 'react';

// The target used here must match the target used in the extension's toml file (./shopify.extension.toml)
const TARGET = 'admin.discount-index.action.render';

export default reactExtension(TARGET, () => <App />);

const FUNCTION_ID_QUERY= `
#graphql
query {
  appDiscountTypes {
    app {
      handle
    }
    functionId
    description
    discountClass
  }
}
`;

function App() {
  const [loading, setLoading] = useState(false);
  const [functionId, setFunctionId] = useState("");
  const {i18n, data, close, query} = useApi(TARGET);

  useEffect(() => {
    console.log(data);
  }, [data])
  
  const doAction = () => {
    alert(JSON.stringify(data?.selected, null, 2));
    close()
  }

  return (
    // The AdminBlock component provides an API for setting the title of the Block extension wrapper.
    <AdminAction 
    title="Payment plan configuration"
    primaryAction={<Button onClick={doAction} variant='primary'>Continue</Button>}
    secondaryAction={<Button variant='secondary' onClick={close}>Cancel</Button>}
    >
      <BlockStack>
        <Text fontWeight="bold">{i18n.translate('welcome', {TARGET})}</Text>
      </BlockStack>
    </AdminAction>
  ); 
}