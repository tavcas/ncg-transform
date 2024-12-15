import type { CodegenConfig } from '@graphql-codegen/cli'
 
const config: CodegenConfig = { 
  ignoreNoDocuments: true,
  generates: {
    'app/graphql/generated/': {
        plugins: ['typescript'],
        schema: [{
            'https://ncg-test-environment.myshopify.com/admin/api/2024-10/graphql.json': {
                headers: {
                    'X-Shopify-Access-Token': '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'
                }
            }
        }],
        documents: ['app/graphql/**.{ts,tsx}'],
        preset: 'client',
        config: {
            documentMode: 'string'
        }
    }
  }
}
export default config