import React, { useState, useEffect } from 'react';
import { createCheckoutService } from '@bigcommerce/checkout-sdk';
import ReactDOM from 'react-dom';
import LoginPanel from './components/login/LoginPanel';
import LoadingState from './components/loading-state/LoadingState';
import SubmitButton from './components/submit/SubmitButton';
import UserForm from './components/user-form/UserForm'

import { formatPrice } from './helpers/price'

export default function CheckoutMain(props) {

    const [state, setState] = useState({});
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [showSignInPanel, setShowSignInPanel] = useState(false);

    const [customerEmail, setCustomerEmail] = useState('');
    const [customerCompanyName, setCustomerCompanyName] = useState('');
    const [customerFullName, setCustomerFullName] = useState('');

    const service = createCheckoutService();
    let unsubscribe = null;
    
    const { data, errors, statuses } = state;
    
    // Similar to componentDidMount
    useEffect(() => {
        Promise.all([
            service.loadCheckout(),
            service.loadShippingCountries(),
            service.loadShippingOptions(),
            service.loadBillingCountries(),
            service.loadPaymentMethods(),
        ]).then(() => {
            unsubscribe = service.subscribe((checkoutData) => {
                console.log(checkoutData, 'checkoutData');
                setState(checkoutData);
            });
        });

        return () => {
            unsubscribe();
        }
    }, []);

    useEffect(() => {
        
        const {data} = state;
        if (data) {
            const {id} = state.data.getCustomer();
    
            if (id === 0) {
                setShowSignInPanel(true);
            }

            const {email, fullName, addresses } = data.getCustomer();
            let {company} = addresses.pop();
            console.log(email, fullName)
            setCustomerEmail(email);
            setCustomerCompanyName(company);
            setCustomerFullName(fullName);
        }
    }, [state]);



    /**
     * Login form.
     *
     * @returns {string}
     */
    const renderLoginPannel = () => {
        let result = '';
        if (data) {
            if (showSignInPanel) {
                result = (<LoginPanel
                    errors={ errors.getSignInError() }
                    isSigningIn={ statuses.isSigningIn() }
                    onClick={
                        (customer) => service.signInCustomer(customer)
                        .then( () => service.loadShippingOptions() )
                    }
                    onClose={ () => setShowSignInPanel(false) } />);
            }
        }

        return result;
    };

    /**
     * Loading state.
     *
     * @returns {string}
     */
    const renderLoadingState = () => {
        let result = '';
        if (!data) {
            result = <LoadingState />;
        }

        return result;
    };

    const renderUserForm = () => {
        if (data) {
            return <UserForm
                email={customerEmail}
                fullName={customerFullName}
                companyName={customerCompanyName}
                updateHandle={ (data) => {console.log(data, 'data')} }
            />
        }
    };

    /**
     * Check is placing order.
     *
     * @returns {boolean}
     * @private
     */
    const _isPlacingOrder = () => {
        return isPlacingOrder && (
            statuses.isSigningIn() ||
            statuses.isUpdatingShippingAddress() ||
            statuses.isUpdatingBillingAddress() ||
            statuses.isSubmittingOrder()
        );
    };

    /**
     * Submit order.
     *
     * @param event
     * @param isGuest
     * @private
     */
    const _submitOrder = (event, isGuest) => {
        event.preventDefault();
        
        let addresses = data.getShippingAddress();

        const [firstName, lastName] = customerFullName.split(' ');
    
        /**
         * Set data params to address.
         *
         * @type {Address&{firstName: string, lastName: string, company: string, email: string}}
         */
        addresses = { ...addresses, email: customerEmail, company: customerCompanyName, firstName, lastName };
    
        console.log(addresses, 'addresses');
        const options = state.data.getShippingOptions();
        
        console.log( state, 'blat');

        // billingAddressPayload = { ...billingAddressPayload, email: state.customer.email };
        //
        // let { payment } = state; /** @todo implement checkong and setting payment here. */

        // setIsPlacingOrder(true);
        return;
       

        //
        // Promise.all([
        //     isGuest ? service.continueAsGuest(state.customer) : Promise.resolve(),
        //     service.updateBillingAddress(billingAddressPayload),
        // ])
        //     .then(() => service.submitOrder({ payment }))
        //     .then(({ data }) => {
        //         window.location.href = data.getConfig().links.orderConfirmationLink;
        //     })
        //     .catch(() => setIsPlacingOrder(false));
    };

    const renderCheckout = () => {
        return (
            <form onSubmit={ (event) => _submitOrder(event, data.getCustomer().isGuest) }>
                <SubmitButton
                    label={ _isPlacingOrder() ?
                        'Placing your order...' :
                        `Pay ${ formatPrice((data.getCheckout()).grandTotal, data) }`
                    }
                    isLoading={ _isPlacingOrder() } />
            </form>
        )
    };

    /**
     * Render all components.
     *
     * @returns {*}
     */
    const render = () => {
        let result = '';
        if (!data) {
            result = renderLoadingState();
        } else {
            result = (
                <>
                    {renderLoginPannel()}
                    {renderUserForm()}
                    {renderCheckout()}
                </>
            );
        }

        return result;
    };

    return ( render() );
}
