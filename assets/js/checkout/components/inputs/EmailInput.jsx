import React from 'react';
import classNames from 'classnames';

export default function EmailInput({id, label, helpText, width, value, onChange}) {
    return (
        <div className={'test'}>
            <label
                htmlFor={id}
                className=''>
                {label} {helpText && <span className="help">({helpText})</span>}
            </label>
            <input
                type="email"
                id={id}
                value={value || ''}
                required
                onChange={onChange}
                className='form-input form-input'/>
        </div>
    );
}
