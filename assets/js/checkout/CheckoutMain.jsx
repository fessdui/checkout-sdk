import React, { Fragment } from 'react';
import {createCheckoutService} from '@bigcommerce/checkout-sdk';
import LoginPanel from './components/login/LoginPanel';
import LoadingState from './components/loading-state/LoadingState';
import SubmitButton from './components/submit/SubmitButton';
import UserForm from './components/user-form/UserForm'
import Layout from './components/layout/layout';
import Cart from './components/cart/Cart';
import {formatPrice} from './helpers/price'
import Panel from './components/panel/Panel';
import styles from './checkout.scss';

export default class Checkout extends React.PureComponent {
    constructor(props) {
        super(props);

        this.service = createCheckoutService();
        this.state = {
            isPlacingOrder: false,
            showSignInPanel: false,
        };

        // this.formatPrice = this.formatPrice.bind(this);
    }

    componentDidMount() {
        Promise.all([
            this.service.loadCheckout(),
            this.service.loadShippingCountries(),
            this.service.loadShippingOptions(),
            this.service.loadBillingCountries(),
            this.service.loadPaymentMethods()
        ]).then(() => {
            this.unsubscribe = this.service.subscribe((state) => {
                this.setState(state);
            });
        });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {data} = this.state;

        if (prevState.data !== data) {
            if (data) {
                this.setCustomer(this.prepareCustomerData(data));
            }
        }
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    /**
     * Prepare customer data.
     *
     * @param data
     * @returns {{fullName: *, company: *, email: *}}
     */
    prepareCustomerData(data) {
        const {id, email, fullName, addresses} = data.getCustomer();
        let result = false;

        if (id !== 0) {
            let company = '';

            if (addresses.length > 0) {
                company = addresses[0].company
            }

            result = {email, fullName, company};
        }

        return result;
    };

    /**
     * Login form.
     *
     * @returns {string}
     */
    renderLoginPanel() {
        let {data, showSignInPanel, statuses, errors} = this.state;
        let result = '';
        if (data) {
            if (showSignInPanel) {
                result = (
                    <Layout body={
                        <LoginPanel
                            errors={errors.getSignInError()}
                            isSigningIn={statuses.isSigningIn()}
                            onClick={(customer) => this.loginCustomer(customer)}
                            onClose={() => this.setState({showSignInPanel: false})}/>
                    }/>);
            } else {
                if (data.getCustomer().id === 0) {
                    result = (
                        <a className='button button--primary' onClick={ () => this.setState({showSignInPanel: true})}>Log In</a>
                    );
                }
            }
        }

        return result;
    };

    /**
     * login customer event handler.
     *
     * @param customer
     * @returns {Promise<CheckoutSelectors>}
     */
    loginCustomer(customer) {
        return this.service.signInCustomer(customer)
            .then(({data}) => {
                this.setCustomer(this.prepareCustomerData(data));
                return Promise.resolve();
            }).then(() => this.service.loadShippingOptions())
            .catch((error) => {
                this.setState({showSignInPanel: false});
            });
    }

    /**
     * Loading state.
     *
     * @returns {string}
     */
    renderLoadingState() {
        let result = '';
        if (!this.state.data) {
            result = <Layout body={<LoadingState/>}/>;
        }

        return result;
    };

    /**
     * Render form.
     *
     * @returns {*}
     */
    renderUserForm() {
        let {data, customerEmail, customerFullName, customerCompanyName} = this.state;

        if (data) {
            return <UserForm
                email={customerEmail}
                fullName={customerFullName}
                companyName={customerCompanyName}
                updateHandle={(data) => {
                    let {userEmail, company, name} = data;
                    console.log(data, 'UserForm');
                    this.setCustomer({email: userEmail, company, fullName: name});
                }}
            />
        }
    };

    /**
     * Set customer data.
     *
     * @param customer
     */
    setCustomer(customer) {
        if (customer) {
            let {email, company, fullName} = customer;
            this.setState({customerEmail: email, customerFullName: fullName, customerCompanyName: company})
        }
    };

    /**
     * Check is placing order.
     *
     * @returns {boolean}
     * @private
     */
    _isPlacingOrder() {
        return this.state.isPlacingOrder;
    };

    /**
     * Submit order.
     *
     * @param event
     * @param isGuest
     * @private
     */
    _submitOrder(event, isGuest) {
        event.preventDefault();

        let address = {
            address1: "Test Adress 23 /3",
            address2: "Club Campestre",
            city: "Outlying Islands",
            company: "Custom Company",
            country: "Russian Federation",
            countryCode: "RU",
            email: "",
            firstName: "",
            lastName: "",
            phone: "11111111",
            postalCode: "11221",
            stateOrProvince: "Outlying Islands",
            stateOrProvinceCode: "",
        };

        let {customerEmail, customerFullName, customerCompanyName} = this.state;

        const [firstName, lastName] = customerFullName.split(' ');

        /**
         * Set data params to address.
         *
         * @type {Address&{firstName: string, lastName: string, company: string, email: string}}
         */
        address = {...address, email: customerEmail, company: customerCompanyName, firstName, lastName};

        const {data} = this.state;
        const {service} = this;

        this.setState({setIsPlacingOrder: true});

        Promise.all([
            isGuest ? service.continueAsGuest({email: customerEmail}) : Promise.resolve(),
            isGuest ? service.updateShippingAddress(address) : Promise.resolve(),
            service.updateBillingAddress(address)
        ])
            .then(() => {
                /**
                 * Get available shipping options here
                 * @type {ShippingOption[]}
                 */
                let options = data.getShippingOptions();
                let shippingMethod = options.pop();

                /**
                 * Set first available shipping here.
                 */
                return service.selectShippingOption(shippingMethod.id);
            })
            .then(() => service.loadPaymentMethods())
            .then(({data}) => data.getPaymentMethods())
            .then((paymentMethods) => {
                /**
                 * Get First payment method - for this case it is Cache.
                 * @todo add type validations here.
                 * @type {PaymentMethod}
                 */
                let method = paymentMethods[0];
                let payment = {methodId: method.id, gatewayId: method.gateway};
                return service.initializePayment(payment)
                    .then(() => Promise.resolve(payment))
            })
            .then((payment) => {
                return service.submitOrder({payment})
            })
            .then(({data}) => {
                window.location.href = data.getConfig().links.orderConfirmationLink;
            })
            .catch((error) => {
                console.error(error);
                this.setState({setIsPlacingOrder: false});
            });
    };

    renderCheckout() {
        const {data} = this.state;

        return (
            <form onSubmit={(event) => this._submitOrder(event, data.getCustomer().isGuest)}>
                <SubmitButton
                    label={this._isPlacingOrder() ?
                        'Placing your order...' :
                        `Pay ${formatPrice((data.getCheckout()).grandTotal, data)}`
                    }
                    isLoading={this._isPlacingOrder()}/>
            </form>
        )
    };

    /**
     * Render cart info.
     *
     * @returns {string}
     */
    renderCart() {
        const {data} = this.state;
        let result = '';
        if (data) {
            result = (
                <Cart
                    formatAmount={(price) => formatPrice(price, data)}
                    checkout={data.getCheckout()}
                    cartLink={(data.getConfig()).links.cartLink}/>
            );
        }

        return result;
    };

    /**
     * Render all components.
     *
     * @returns {*}
     */
    renderAll() {
        const {data} = this.state;
        let result = '';
        if (!data) {
            result =  ( <div data-tab={'blat'} className={styles.loading}> {this.renderLoadingState()} </div>)
        } else {
            result = (
                <Fragment>
                    <div className={styles.body}>
                        <Panel body={
                            <>
                                {this.renderLoginPanel()}
                                {this.renderUserForm()}
                                {this.renderCheckout()}
                            </>
                        }/>
                    </div>
                    <div className={styles.side}>
                        {this.renderCart()}
                    </div>
                </Fragment>
            );
        }

        return result;
    };

    render() {
        return (
            <Layout body={this.renderAll()}/>
        );
    }
}
