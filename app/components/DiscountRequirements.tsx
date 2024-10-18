import type { SelectProps } from "@shopify/polaris";
import { Box, Card, Text, TextField, Select } from "@shopify/polaris";
import type { DiscountRequirementsFields } from "../types";
import { RequirementType } from "@shopify/discount-app-components";
import React from "react";

type DiscountRequirementsProps = DiscountRequirementsFields

const REQUIEREMENTS: SelectProps["options"] = [
    { label: 'No minimum requirements', value: RequirementType.None },
    { label: 'Minimum purchase amount ($)', value: RequirementType.Subtotal },
    { label: 'Minimum quantity of items', value: RequirementType.Quantity },
]

export default function DiscountRequirements({ requirementType, requirementQuantity, requirementSubtotal, currencyCode }: DiscountRequirementsProps) {
    const [label, requirementValue] = requirementType.value === RequirementType.Quantity 
    ? ['Quantity', requirementQuantity]
    : requirementType.value === RequirementType.Subtotal  
    ? ['Subtotal', requirementSubtotal]
    : [];
    return (
        <Box>
            <Card>
                <Text variant="headingMd" as="h3">
                     Minimum purchase requirements
                </Text>
                <Select labelHidden label=''  options={REQUIEREMENTS} value={requirementType.value ?? RequirementType.None} />
                {requirementValue && (<TextField label={label} autoComplete="off" type="number" {...requirementValue} />)}
            </Card>
        </Box>
    )
}