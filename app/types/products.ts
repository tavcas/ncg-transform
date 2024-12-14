export interface ProductDetails {
  __typename: string
  productTitle: string
  rate: number
  cashPrice: string
  imgURL: string
  URL: string
  variant: number
  quantity: string
  properties: ProductProperty[]
}

export interface ProductProperty {
  name: string
  value: string
}
