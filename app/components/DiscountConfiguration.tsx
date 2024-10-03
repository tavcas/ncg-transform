import { Box, Card, BlockStack, Select, TextField, Text } from "@shopify/polaris";
import type { DiscountConfigurationFields } from "../types"

type DiscountConfigurationProps = DiscountConfigurationFields;

export default function DiscountConfiguration({ discountType, ...fields}: DiscountConfigurationProps){
    return (
        <Box paddingBlockEnd="300">
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
                       label={k || "None"}
                       autoComplete="on"
                       {...f}
                       suffix={discountType.value === "percentage" ? "%" : ""}
                     />
                    ))}
                  </BlockStack>
                </Card>
              </Box>
    )
}