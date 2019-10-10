import React from 'react';
import classNames from 'classnames';
import styles from './input-container.scss';

export default function TextInput({id, label, helpText, className, value, errors}) {
    return (
        <div className={ classNames(styles.container, styles[className]) }>
            <label
                htmlFor={id}
                className={ styles.label }>
                {label} {helpText && <span className="help">({helpText})</span>}
            </label>
            <input
                type="text"
                id={id}
                defaultValue={value || ''}
                className={ classNames(styles.input, styles[ (errors || false) ? "error" : '' ] ) }   />
            <div className={classNames(styles[ (errors || false) ? "error_message" : 'hidden' ])}> {errors}</div>
        </div>
    );
}
