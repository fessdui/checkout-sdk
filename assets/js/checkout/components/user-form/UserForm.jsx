import React, {useState, useEffect} from 'react';
import EmailInput from "../inputs/EmailInput";
import TextInput from "../inputs/TextInput";
import styles from './user-form.scss';

export default function UserForm({email, firstName: first, lastName: last, companyName, updateHandle, validationErrors}) {

    const [customerEmail, setCustomerEmail] = useState('');
    const [customerCompanyName, setCustomerCompanyName] = useState('');
    const [customerFirstName, setCustomerFirstName] = useState('');
    const [customerLastName, setCustomerLastName] = useState('');


    /**
     * Triggered only if one of params was update.
     */
    useEffect(() => {
        let userEmail = customerEmail || email;
        let firstName = customerFirstName || first;
        let lastName = customerLastName || last;
        let company = customerCompanyName || companyName;

        if (userEmail || company || firstName || lastName) {
            updateHandle({email: userEmail, company, firstName, lastName});
        }

    }, [customerEmail, customerCompanyName, customerFirstName, customerLastName]);

    console.log(customerFirstName, first, 'customerFirstName || first');

    return (
        <>
            <EmailInput
                id={'customer_email'}
                label={'Email Address'}
                value={customerEmail || email}
                onChange={({target}) => setCustomerEmail(target.value)}
                errors={validationErrors['customerEmail']}
            />
                <div className={styles.user_name}>
                    <TextInput
                        id={'first_name'}
                        label={'First Name'}
                        value={customerFirstName || first}
                        onChange={({target}) => setCustomerFirstName(target.value)}
                        className={'first_name'}
                        errors={validationErrors['customerFirstName']}
                    />
                    <TextInput
                        id={'last_name'}
                        label={'Last Name'}
                        value={customerLastName || last}
                        onChange={({target}) => setCustomerLastName(target.value)}
                        className={'last_name'}
                        errors={validationErrors['customerLastName']}
                    />
                </div>
            <TextInput
                id={'company_name'}
                label={'Company Name'}
                value={customerCompanyName || companyName}
                onChange={({target}) => setCustomerCompanyName(target.value)}
                errors={validationErrors['customerCompanyName']}/>
        </>
    );
}
