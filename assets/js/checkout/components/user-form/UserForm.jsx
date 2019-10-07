import React, {useState, useEffect} from 'react';
import EmailInput from "../inputs/EmailInput";
import TextInput from "../inputs/TextInput";

export default function UserForm({email: loggedEmail, fullName: name, companyName: company, updateHandle}) {

    const [email, setEmail] = useState(loggedEmail);
    const [companyName, setCompanyName] = useState(company);
    const [fullName, setFullName] = useState(name);

    /**
     * Triggered only if one of params was update.
     */
    useEffect(() => {
        updateHandle({email, companyName, fullName});
    }, [email, companyName, fullName]);

    return (
        <>
          <TextInput
              id={'user-name'}
              label={'User Full Name'}
              value={fullName}
              onChange={({target}) => setFullName(target.value)}/>

          <EmailInput
              id={'customerEmail'}
              label={'Email'}
              value={email}
              onChange={({target}) => setEmail(target.value)}/>

            <TextInput
                id={'company name'}
                label={'Company Name'}
                value={companyName}
                onChange={({target}) => setCompanyName(target.value)}/>
        </>
    );
}
