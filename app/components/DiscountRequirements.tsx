import type { SelectProps } from "@shopify/polaris";
import { Box, Card, Text, TextField, Select } from "@shopify/polaris";
import type { DiscountRequirementsFields } from "../types";
import { RequirementType } from "@shopify/discount-app-components";
import React, { useMemo } from "react";
import HiddenInput from "./HiddenField";

type DiscountRequirementsProps = DiscountRequirementsFields

const REQUIEREMENTS: SelectProps["options"] = [
    { label: 'No minimum requirements', value: RequirementType.None },
    { label: 'Minimum purchase amount ($)', value: RequirementType.Subtotal },
    { label: 'Minimum quantity of items', value: RequirementType.Quantity },
]

export default function DiscountRequirements({ id, requirementType, requirementQuantity, requirementSubtotal }: DiscountRequirementsProps) {
    const [label, requirementValue] = useMemo(() => requirementType.value === RequirementType.Quantity 
    ? ['Quantity', requirementQuantity]
    : requirementType.value === RequirementType.Subtotal  
    ? ['Subtotal', requirementSubtotal]
    : [], [requirementQuantity, requirementSubtotal, requirementType.value]);
    return (
        <Box>
            <HiddenInput {...id} />
            <Card>
                <Text variant="headingMd" as="h3">
                     Minimum purchase requirements
                </Text>
                <Select labelHidden label=''  options={REQUIEREMENTS} {...requirementType}/>
                {requirementValue && (<TextField inputMode="numeric" label={label} autoComplete="off" type="number" {...requirementValue} />)}
            </Card>
        </Box>
    )
}