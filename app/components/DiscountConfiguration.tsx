import { Box, Card, BlockStack, Select, TextField, Text } from "@shopify/polaris";
import type { DiscountConfigurationFields } from "../types"
import React from "react";
import HiddenInput from "./HiddenField";

type DiscountConfigurationProps = DiscountConfigurationFields;

export default function DiscountConfiguration({ id, discountType, ...fields}: DiscountConfigurationProps){
    return (
        <Box paddingBlockEnd="300">
                <HiddenInput {...id} />
                <Card>
                  <BlockStack gap="300">
                  <Text variant="headingMd" as="h3">
                      Value Type
                    </Text>
                    <Select
                    label=""
                    options={[
                        { label: 'Fixed amount', value: 'fixedAmount'},
                        { label: 'Percentage', value: 'percentage'},
                    ]}
                    {...discountType}
                     />
                     <Text variant="headingMd" as="h3">
                      Value by payment plan
                    </Text>
                    {Object.entries(fields).filter(k => k[0] !== 'discountType').map(([k, f]) => (
                       <TextField
                       key={k}
                       label={k || "Cash"}
                       autoComplete="on"
                       inputMode="numeric"
                       {...f}
                       suffix={discountType.value === "percentage" ? "%" : ""}
                     />
                    ))}
                  </BlockStack>
                </Card>
              </Box>
    )
}