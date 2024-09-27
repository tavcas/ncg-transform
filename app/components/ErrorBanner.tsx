import { Layout, Banner } from "@shopify/polaris";
import React from "react";

type ErrorBannerProps = {
    errors: {
        field: string[]
        message: string
    }[]
};

export default function ErrorBanner({ errors }: ErrorBannerProps) {
    return errors.length > 0 ? (
      <Layout.Section>
        <Banner status="critical">
          <p>There were some issues with your form submission:</p>
          <ul>
            {errors.map(({ message, field }, index) => {
              return (
                <li key={`${message}${index}`}>
                  {field.join(".")} {message}
                </li>
              );
            })}
          </ul>
        </Banner>
      </Layout.Section>
    ) : null;
}