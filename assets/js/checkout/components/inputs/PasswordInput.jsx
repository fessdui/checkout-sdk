import React from 'react';
import classNames from 'classnames';

export default function EmailInput({id, label, helpText, width, value, onChange}) {
    return (
        <div className={'password-fields'}>
            <label
                htmlFor={id}
                className=''>
                {label} {helpText && <span className="help">({helpText})</span>}
            </label>
            <input
                type="password"
                id={id}
                value={value || ''}
                required
                onChange={onChange}
                className='form-input form-input'/>
        </div>
    );
}
