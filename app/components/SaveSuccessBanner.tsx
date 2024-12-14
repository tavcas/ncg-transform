import { Layout, Banner } from "@shopify/polaris";

export default function SaveSuccessBanner() {
    return (<Layout.Section>
        <Banner tone="success">
          <p>Changes were saved successfully</p>
        </Banner>
      </Layout.Section>)
}