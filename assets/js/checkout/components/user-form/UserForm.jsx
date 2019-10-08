import React, {useState, useEffect} from 'react';
import EmailInput from "../inputs/EmailInput";
import TextInput from "../inputs/TextInput";

export default function UserForm({email, fullName, companyName, updateHandle}) {

    const [customerEmail, setCustomerEmail] = useState('');
    const [customerCompanyName, setCustomerCompanyName] = useState('');
    const [customerFullName, setCustomerFullName] = useState('');


    /**
     * Triggered only if one of params was update.
     */
    useEffect(() => {
        let userEmail = customerEmail || email;
        let name = customerFullName || fullName;
        let company = customerCompanyName || companyName;

        setCustomerFullName(name);
        setCustomerEmail(userEmail);
        setCustomerCompanyName(company);

        if (userEmail || company || name) {
            updateHandle({userEmail, company, name});
        }

    }, [customerEmail, customerCompanyName, customerFullName]);

    return (
        <>
          <TextInput
              id={'user-name'}
              label={'User Full Name'}
              value={customerFullName || fullName}
              onChange={({target}) => setCustomerFullName(target.value)}/>

          <EmailInput
              id={'customerEmail'}
              label={'Email'}
              value={customerEmail || email}
              onChange={({target}) => setCustomerEmail(target.value)}/>

            <TextInput
                id={'company name'}
                label={'Company Name'}
                value={customerCompanyName || companyName}
                onChange={({target}) => setCustomerCompanyName(target.value)}/>
        </>
    );
}
