import React, { Fragment, useState } from 'react';
import EmailInput from '../inputs/EmailInput';
import PasswordInput from '../inputs/PasswordInput';
import SubmitButton from '../submit/SubmitButton';
import styles from './login-panel.scss';

export default function LoginPanel({onClick, onClose, errors, isSigningIn}) {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const _signIn = (event) =>  {
        event.preventDefault();

        if (email && password) {
            return onClick({email, password}).then(onClose);
        }
    }

    return (
        <div className={ styles.container }>
            <div className={ styles.header }>
                <div className={ styles.heading }>
                    Welcome Back!
                </div>

                <a
                    onClick={ onClose }
                    className={ styles.closeButton }>
                    &#10005;
                </a>
            </div>
            <form onSubmit={ (event) => _signIn(event) }>
            { errors && errors.body.detail }

            <div>
                <EmailInput
                    id={ 'customerEmail' }
                    label={ 'Email' }
                    value={ email }
                    onChange={ ({ target }) => setEmail(target.value) } />

                <PasswordInput
                    id={ 'customerPassword' }
                    label={ 'Password' }
                    value={ password }
                    onChange={ ({ target }) => setPassword(target.value) } />
            </div>

            <div className="submit">
                <SubmitButton
                    label={ isSigningIn ? `Signing in as ${ email }...` : 'Sign In' }
                    isLoading={ isSigningIn } />
            </div>
        </form>
        </div>
    );
}
