import ReactDOM from 'react-dom';
import React from 'react';
import PageManager from './page-manager';
import CheckoutMain from '../checkout/CheckoutMain';
import { createCheckoutService } from '@bigcommerce/checkout-sdk';

export default class Checkout extends PageManager {
    async onReady() {
        ReactDOM.render(
            React.createElement(CheckoutMain, null, null),
            document.getElementById('checkout-app')
        );
    }
}
