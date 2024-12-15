import {
  reactExtension,
  BlockStack,
  Text,
  TextBlock,
  Heading,
  useApi,
  useApplyAttributeChange,
  useInstructions,
  useTranslate,
  View,
  BlockSpacer,
  Banner,
  useCartLines
} from "@shopify/ui-extensions-react/checkout";
import { useEffect, useMemo, useState } from "react";

export interface PrimaryProductDetails {
  productTitle: string
  rate: number
  cashPrice: number
  imgURL: string
  URL: string
  variant: number
  quantity: string
  properties: PrimaryProductProperties[]
  totalDiscounts?: number;
}

export interface PrimaryProductProperties {
  name: string
  value: string
}

const ATTRIBUTE_KEYS = {
  PRIMARY_DETAILS: "Primary Product Details",
  TOTAL_DISCOUNTS: "Total Discounts",
  PROPERTIES: "Properties"
}

const CASH_PRICE_KEY = "_cashPrice";

// 1. Choose an extension target
export default reactExtension("purchase.checkout.cart-line-list.render-after", () => (
  <Extension />
));

function Extension() {
  const applyAttributeChange = useApplyAttributeChange();
  const { attributes, discountAllocations } = useApi();
  const instructions = useInstructions();

  const [primaryData, setPrimaryData] = useState(null);
  const [totalDiscounts, setTotalDiscounts] = useState(0);

  attributes.subscribe(attributes => {
    
    const primaryValue = attributes.find(a => a.key === ATTRIBUTE_KEYS.PRIMARY_DETAILS);
    if(primaryValue !== primaryData) {
      setPrimaryData(primaryValue.value);
      console.log({attributes});
    }
  });

  discountAllocations.subscribe(discounts => {
    
    const total = discounts.reduce((p,c) => p + c.discountedAmount.amount , 0) * 100;
    if(total != totalDiscounts) {
      setTotalDiscounts(total);
      console.log({discounts})
    }
  })

  useEffect(() => {
      if(totalDiscounts > 0 && primaryData) {
        const [primaryObj] = JSON.parse(primaryData) as PrimaryProductDetails[];
        console.log({ "when": "before",  primaryObj, totalDiscounts });
        if(primaryObj.totalDiscounts === totalDiscounts) {
          return;
        }

        const discountApplication = Math.max(totalDiscounts - (primaryObj.totalDiscounts ?? 0), 0);
        primaryObj.rate = Number(primaryObj.rate) - discountApplication;
        primaryObj.cashPrice = Number(primaryObj.cashPrice) - discountApplication;
        primaryObj.totalDiscounts = totalDiscounts;
        primaryData.properties = primaryObj.properties.map(p => 
          p.name === CASH_PRICE_KEY 
          ? {...p, value: 
            (Number(p.value) - discountApplication)
              .toLocaleString()
            }
          : p
          );
        applyAttributeChange({
          type: "updateAttribute",
          key: ATTRIBUTE_KEYS.PRIMARY_DETAILS,
          value: JSON.stringify([primaryObj])
        });
        applyAttributeChange({
          type: "updateAttribute",
          key: ATTRIBUTE_KEYS.TOTAL_DISCOUNTS,
          value: totalDiscounts.toLocaleString()
        })

        console.log({ "when": "after",  primaryObj, totalDiscounts, discountApplication });

      }

  }, [totalDiscounts, primaryData])
  
  
  return (
    <Banner status={
      instructions.attributes.canUpdateAttributes && totalDiscounts > 0
      ? "success" 
      : !instructions.attributes.canUpdateAttributes 
      ? "critical"
      : "info"}>
        {instructions.attributes.canUpdateAttributes && totalDiscounts > 0
        ? "Discounts applied succesfully"
        : !instructions.attributes.canUpdateAttributes 
        ? "Enable app permissions to update attributes"
        : "Add your discount"}
    </Banner>
  )
}