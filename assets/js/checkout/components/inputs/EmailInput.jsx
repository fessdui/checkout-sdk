import React from 'react';
import classNames from 'classnames';
import styles from './input-container.scss';

export default function EmailInput({id, label, helpText, width, value, onChange}) {
    return (
        <div className={ classNames(styles.container, styles[width ? width + 'Width' : 'fullWidth']) }>
            <label
                htmlFor={id}
                className={ styles.label }>
                {label} {helpText && <span className="help">({helpText})</span>}
            </label>
            <input
                type="email"
                id={id}
                value={value || ''}
                required
                onChange={onChange}
                className={ styles.input }  />
        </div>
    );
}
