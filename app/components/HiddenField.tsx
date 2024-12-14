import type { Field } from "@shopify/react-form";
import { TextField } from "@shopify/polaris";
import React from "react";

type HiddenInputProps = Partial<Field<string>>;

export default function HiddenInput(props: HiddenInputProps) {

    return (
        <input type="hidden" {...props} />
    )
}