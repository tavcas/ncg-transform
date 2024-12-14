import { Layout, Banner } from "@shopify/polaris";
import React from "react";

export type ErrorBannerProps = {
    errors: {
        field: string[]
        message: string
    }[]
};

export default function ErrorBanner({ errors }: ErrorBannerProps) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if(ref.current && errors.length > 0) {
      ref.current.focus();
    }
  }, [ref, errors])
    return errors.length > 0 ? (
      <Layout.Section>
        <Banner tone="critical">
          <p ref={ref}>There were some issues with your form submission:</p>
          <ul>
            {errors.map(({ message }, index) => {
              return (
                <li key={`${message}${index}`}>
                  {message}
                </li>
              );
            })}
          </ul>
        </Banner>
      </Layout.Section>
    ) : null;
}