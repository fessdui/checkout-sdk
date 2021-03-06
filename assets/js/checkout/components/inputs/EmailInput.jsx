import React from 'react';
import classNames from 'classnames';
import styles from './input-container.scss';

export default function LoginEmailInput({id, label, helpText, width, value, errors}) {
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
            defaultValue={value || ''}
            required
            className={ classNames(styles.input, styles[ (errors || false) ? "error" : '' ] ) }  />
        <div className={classNames(styles[ (errors || false) ? "error_message" : 'hidden' ])}> {errors}</div>
      </div>
  );
}
