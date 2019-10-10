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
            validationErrors: {},
        };
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

    componentWillUnmount() {
        this.unsubscribe();
    }

    /**
     * Prepare form data.
     *
     * @param event
     */
    prepareFormData(event) {
        const formData = {};

        ['email', 'firstName', 'lastName', 'companyName'].map((field) => {
            formData[field] = event.target.elements[field].value;
        });
        
        return formData;
    }
    
    /**
     * Login form.
     *
     * @returns {string}
     */
    renderLoginPanel() {
        let {data, showSignInPanel, statuses, errors} = this.state;
        let result = '';
        if (false) {
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
            .then(() => this.setState({showSignInPanel: false}))
            .then(() => this.service.loadShippingOptions())
            .catch((error) => {
                this.setState({showSignInPanel: true});
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
        let {data, validationErrors} = this.state;

        if (data) {
            return <UserForm
                customer={data.getCustomer()}
                validationErrors={validationErrors}
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
            let {email, firstName, lastName, company} = customer;
            this.setState({customerEmail: email, customerFirstName: firstName, customerLastName: lastName, customerCompanyName: company})
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

        let formData = this.prepareFormData(event);
        let {email, firstName, lastName , company} = formData;

        if (!this.validate(formData)) {
            return;
        }
        
        let address = {
            address1: "965 W Chicago Ave.",
            address2: "Club Campestre",
            city: "Chicago",
            company: "",
            country: "United States",
            countryCode: "US",
            email: "",
            firstName: "",
            lastName: "",
            phone: "11111111",
            postalCode: "60642",
            stateOrProvince: "Outlying Islands",
            stateOrProvinceCode: "",
        };

        /**
         * Set data params to address.
         *
         * @type {Address&{firstName: string, lastName: string, company: string, email: string}}
         */
        address = {...address, email, company, firstName, lastName};

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

    /**
     * Render submit btn.
     *
     * @returns {*}
     */
    renderCheckoutSubmit() {
        const {data} = this.state;

        return (
            <form onSubmit={(event) => this._submitOrder(event, data.getCustomer().isGuest)}>
                {this.renderUserForm()}
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
            result =  ( <div className={styles.loading}> {this.renderLoadingState()} </div>)
        } else {
            result = (
                <Fragment>
                    <div className={styles.body}>
                        <Panel body={this.renderCheckoutSubmit() }/>
                    </div>
                    <div className={styles.side}>
                        {this.renderCart()}
                    </div>
                </Fragment>
            );
        }

        return result;
    };

    _validation(name, value, callback = () => {}) {
        this.setState({validationErrors: {}});
        const errors = {};

        switch (name) {
            case 'firstName':
                if (value.length <= 0) {
                    errors.customerFirstName = 'First Name is required!'
                }
                break;
            case 'lastName':
                if (value.length <= 0) {
                    errors.customerLastName = 'Last Name is required!'
                }
                break;
            case 'email':
                let regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;;

                if (!regex.test(value.toLowerCase())) {
                    errors.customerEmail = 'Email is not valid!'
                }
                break;
            case 'companyName':
                debugger;
                if (value.length <= 0 ) {
                    errors.customerCompanyName = 'Company Name is required!';
                }

                if (value.length >= 120) {
                    errors.customerCompanyName = 'Company Name could not be more than 120 characters!';
                }
                break;
            default:
                break;
        }

        if (typeof callback == 'function') {
            callback(errors);
        }

        return !Object.keys(errors).length > 0;
    }

    validate(formData) {
        let stateKeys = Object.keys(formData);

        // Filter form data and return array with fields name and it`s values.
        let userData = stateKeys.map( value => {
            if (typeof formData[value] == 'string' || typeof formData[value] == 'undefined') {
                let object = {};
                object['field'] = value;
                object['value'] = formData[value] || '';

                return object;
            }
        }).filter(item => item !== undefined);

        let errors = {};

        // validate each items.
        let result = userData.map((item) => this._validation(item.field, item.value, (errorsArray) => {
            errors = {...errors, ...errorsArray};
        }));

        this.setState({validationErrors: errors});

        // Filter and return unique result from array of boolean items.
        let  uniqueResult = ((arr) => {
            let result = [];

            for (let str of arr) {
                if (!result.includes(str)) {
                    result.push(str);
                }
            }

            return result;
        })(result);

        if (uniqueResult.length > 1) {
            return uniqueResult.pop() && uniqueResult.pop();
        } else {
            return uniqueResult.pop();
        }
    }

    render() {
        return (
            <Layout body={this.renderAll()}/>
        );
    }
}
