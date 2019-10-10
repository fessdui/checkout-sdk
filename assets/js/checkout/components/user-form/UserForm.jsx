import React, {useState, useEffect} from 'react';
import EmailInput from "../inputs/EmailInput";
import TextInput from "../inputs/TextInput";
import styles from './user-form.scss';

export default function UserForm({customer, validationErrors}) {
  
  
  
  const {email, firstName, lastName, company} = ((customer) => {
    const {id, addresses} = customer;

    let result = false;
    let company = '';
    if (id !== 0) {
      if (addresses.length > 0) {
        company = addresses[0].company
      }
    }
    
    return {...customer, company};
  })(customer);
    
    return (
        <>
            <EmailInput
                id={'email'}
                label={'Email Address'}
                value={email}
                errors={validationErrors['customerEmail']}
            />
                <div className={styles.user_name}>
                    <TextInput
                        id={'firstName'}
                        label={'First Name'}
                        value={firstName}
                        className={'first_name'}
                        errors={validationErrors['customerFirstName']}
                    />
                    <TextInput
                        id={'lastName'}
                        label={'Last Name'}
                        value={lastName}
                        className={'last_name'}
                        errors={validationErrors['customerLastName']}
                    />
                </div>
            <TextInput
                id={'companyName'}
                label={'Company Name'}
                value={company}
                errors={validationErrors['customerCompanyName']}/>
        </>
    );
}
