import React from 'react';
import styles from './panel.scss';

export default function Panel({body}){
    return (
        <div className={ styles.container }>
            { body }
        </div>
    );
}
