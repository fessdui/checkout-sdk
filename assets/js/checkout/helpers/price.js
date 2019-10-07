/**
 * Format price.
 */
export function formatPrice(amount, chekoutData) {
    let result = '';

    if (chekoutData) {
        const config = chekoutData.getConfig();
        const {currency} = config;

        if (currency.symbolLocation == 'left') {
            result = `${currency.symbol} ${amount}`
        } else {
            result = `${amount} ${currency.symbol}`
        }
    }

    return result;
}
