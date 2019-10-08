import React from 'react';
import { formatMoney } from 'accounting';
import ItemLine from "./item-line/ItemLine";
import styles from './cart.scss';

const Cart = ({checkout, cartLink, formatAmount}) => {
    return (
        <div className={ styles.container }>
            <div className={ styles.cartContainer }>
                <div className={ styles.cartHeaderContainer }>
                    <div className={ styles.cartHeader }>
                        Your Order
                    </div>

                    <a href={ cartLink } className={ styles.cartAction }>
                        Return to cart
                    </a>
                </div>

                { ['physicalItems', 'digitalItems', 'giftCertificates'].map((keyType) => (
                    ( checkout.cart.lineItems[keyType] || []).map((item) =>
                    {
                        return (<ItemLine
                            key={ item.id }
                            label={ `${ item.quantity } x ${ item.name }` }
                            amount={ formatAmount(item.extendedSalePrice) }
                            imageUrl={ item.imageUrl }
                            brand={item.brand}
                        /> )
                    })
                )) }
            </div>

            <div className={ styles.orderSummaryContainer }>
                <ItemLine
                    label={ 'Subtotal' }
                    amount={ formatAmount( checkout.subtotal) } />

                <ItemLine
                    label={ 'Shipping' }
                    amount={ formatAmount( checkout.shippingCostTotal) } />

                <ItemLine
                    label={ 'Tax' }
                    amount={ formatAmount( checkout.taxTotal) } />

                <div className={ styles.grandTotalContainer }>
                    <div className={ styles.grandTotalLabel }>
                        Total
                    </div>

                    <div className={ styles.grandTotalAmount }>
                        { formatAmount( checkout.grandTotal) }
                    </div>
                </div>
            </div>
        </div>
    );
}


export default Cart;
