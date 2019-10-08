/**
 * Format price.
 */
export function formatPrice(amount, checkoutData) {
    let result = '';
    if (checkoutData) {
        const config = checkoutData.getConfig();
        const {currency} = config;

        if (currency.symbolLocation === 'left') {
            result = `${currency.symbol} ${amount}`
        } else {
            result = `${amount} ${currency.symbol}`
        }
    }

    return result;
}
