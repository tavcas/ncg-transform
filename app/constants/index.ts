import {CurrencyCode} from '@shopify/react-i18n';

const DEFAULT_CURRENCY = CurrencyCode.Usd
const NEW_ID = "new";

enum PaymentPlan {
    None = "",
    Monthly = "Monthly",
    BiMonthly = "Bi-Monthly",
    EveryTwoWeeks = "Every Two Weeks"
}

export { DEFAULT_CURRENCY, NEW_ID, PaymentPlan }